'use client';

import { useState, useEffect, useCallback } from 'react';
import { OUTFITS, SCENES, POSES, PANTS, SHOES } from '@/lib/data';

// ─── Types ───
interface GenerateResponse {
  images: string[];
  caption: string;
}

interface GalleryItem {
  id: string;
  name: string;
  images: string[];
  caption: string;
  outfit: string;
  scene: string;
  date: string;
  time: string;
}

type Tab = 'home' | 'gallery' | 'profile';

// ─── LocalStorage helpers ───
function loadGallery(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('flexbot-gallery');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGallery(items: GalleryItem[]) {
  try {
    localStorage.setItem('flexbot-gallery', JSON.stringify(items));
  } catch {
    items.pop();
    localStorage.setItem('flexbot-gallery', JSON.stringify(items));
  }
}

function downloadImage(base64: string, filename: string) {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  link.click();
}

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function Home() {
  const [tab, setTab] = useState<Tab>('home');
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [outfitKey, setOutfitKey] = useState('');
  const [sceneKey, setSceneKey] = useState('');
  const [poseKey, setPoseKey] = useState('');
  const [pantsKey, setPantsKey] = useState('');
  const [shoesKey, setShoesKey] = useState('');
  const [chainEnabled, setChainEnabled] = useState(true);
  const [tattoosEnabled, setTattoosEnabled] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [activeOption, setActiveOption] = useState<'outfit' | 'scene' | 'pose' | 'pants' | 'shoes'>('outfit');

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setProgress(0);
    setError('');
    setImages([]);
    setCaption('');

    // Simulate progress: 0 → 1 at ~10s, 1 → 2 at ~25s, 2 → 3 when done
    const progressTimer = setInterval(() => {
      setProgress(prev => (prev < 2 ? prev + 1 : prev));
    }, 12000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          outfitKey: outfitKey || undefined,
          sceneKey: sceneKey || undefined,
          poseKey: poseKey || undefined,
          pantsKey: pantsKey || undefined,
          shoesKey: shoesKey || undefined,
          chainEnabled,
          tattoosEnabled,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }
      const result: GenerateResponse = await response.json();
      clearInterval(progressTimer);
      setImages(result.images);
      setCaption(result.caption);
      setProgress(3);
      setSelectedIndex(0);

      const now = new Date();
      const item: GalleryItem = {
        id: Date.now().toString(),
        name: name.trim(),
        images: result.images,
        caption: result.caption,
        outfit: outfitKey || 'Random',
        scene: sceneKey || 'Random',
        date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setGallery(prev => {
        const updated = [item, ...prev];
        saveGallery(updated);
        return updated;
      });
    } catch (err) {
      clearInterval(progressTimer);
      console.error('Generate error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGalleryItem = useCallback((id: string) => {
    setGallery(prev => {
      const updated = prev.filter(g => g.id !== id);
      saveGallery(updated);
      return updated;
    });
    if (viewingItem?.id === id) setViewingItem(null);
  }, [viewingItem]);

  const totalGenerated = gallery.reduce((sum, g) => sum + g.images.length, 0);

  // ═══════════════════════════════════════
  // HOME SCREEN
  // ═══════════════════════════════════════
  const renderHome = () => (
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
      {/* FlexBot branding */}
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">FlexBot</h1>
        <span className="text-lg">⚡</span>
      </div>

      {/* Search-style input — above cards */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="What Celebrity Is Flexing?"
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 font-medium focus:ring-2 focus:ring-accent/50 border-0"
          />
        </div>
      </div>

      {/* Category Cards — 3x2 grid, tappable to open picker */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Outfits */}
        <button
          onClick={() => { setShowOptions(true); setActiveOption('outfit'); }}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border border-gray-800 text-left cursor-pointer active:scale-[0.97] transition"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">👔</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Outfits</span>
            {outfitKey && <p className="text-[9px] text-gray-400 truncate">{outfitKey.replace(/_/g, ' ')}</p>}
          </div>
        </button>

        {/* Pants */}
        <button
          onClick={() => { setShowOptions(true); setActiveOption('pants'); }}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border border-gray-800 text-left cursor-pointer active:scale-[0.97] transition"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">👖</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Pants</span>
            {pantsKey && <p className="text-[9px] text-gray-400 truncate">{pantsKey.replace(/_/g, ' ')}</p>}
          </div>
        </button>

        {/* Shoes */}
        <button
          onClick={() => { setShowOptions(true); setActiveOption('shoes'); }}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border border-gray-800 text-left cursor-pointer active:scale-[0.97] transition"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">👟</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Shoes</span>
            {shoesKey && <p className="text-[9px] text-gray-400 truncate">{shoesKey.replace(/_/g, ' ')}</p>}
          </div>
        </button>

        {/* Scenes */}
        <button
          onClick={() => { setShowOptions(true); setActiveOption('scene'); }}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border border-gray-800 text-left cursor-pointer active:scale-[0.97] transition"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🏙️</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Scenes</span>
            {sceneKey && <p className="text-[9px] text-gray-400 truncate">{sceneKey.replace(/_/g, ' ')}</p>}
          </div>
        </button>

        {/* Poses */}
        <button
          onClick={() => { setShowOptions(true); setActiveOption('pose'); }}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border border-gray-800 text-left cursor-pointer active:scale-[0.97] transition"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">💪</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Poses</span>
            {poseKey && <p className="text-[9px] text-gray-400 truncate">{poseKey.replace(/_/g, ' ')}</p>}
          </div>
        </button>

        {/* Chain Toggle card */}
        <button
          type="button"
          onClick={() => setChainEnabled(!chainEnabled)}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border cursor-pointer text-left active:scale-[0.97] transition"
          style={{ borderColor: chainEnabled ? 'rgba(255,215,0,0.5)' : 'rgba(75,75,75,0.5)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">{chainEnabled ? '⛓️' : '🚫'}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Chain</span>
            <p className="text-[9px] truncate" style={{ color: chainEnabled ? '#ffd700' : '#9ca3af' }}>
              {chainEnabled ? 'Last Name Pendant' : 'No Chain'}
            </p>
          </div>
        </button>

        {/* Tattoo Toggle card */}
        <button
          type="button"
          onClick={() => setTattoosEnabled(!tattoosEnabled)}
          className="bg-gray-900 rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden border cursor-pointer text-left active:scale-[0.97] transition"
          style={{ borderColor: tattoosEnabled ? 'rgba(139,92,246,0.6)' : 'rgba(75,75,75,0.5)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">{tattoosEnabled ? '🔱' : '🫧'}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-xs font-semibold text-white">Tattoos</span>
            <p className="text-[9px] truncate" style={{ color: tattoosEnabled ? '#a78bfa' : '#9ca3af' }}>
              {tattoosEnabled ? 'Full Sleeves + Neck' : 'Clean Skin'}
            </p>
          </div>
        </button>

        {/* Generate — red glow accent card */}
        <button
          onClick={() => name.trim() ? handleGenerate() : document.getElementById('name-input')?.focus()}
          className="rounded-2xl p-3 aspect-square flex flex-col justify-end relative overflow-hidden cursor-pointer text-left active:scale-[0.97] transition"
          style={{ background: '#111', boxShadow: 'inset 0 0 20px rgba(229,57,53,0.25), 0 0 0 1px rgba(229,57,53,0.3)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-accent/30 via-accent/5 to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl drop-shadow-[0_0_8px_rgba(229,57,53,0.8)]">⚡</span>
          </div>
          <div className="relative z-20">
            <span className="text-xs font-bold text-white">Generate</span>
          </div>
        </button>
      </div>

      {/* Options picker — scrollable pill buttons */}
      {showOptions && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
              {activeOption === 'outfit' ? 'Choose Outfit' : activeOption === 'scene' ? 'Choose Scene' : activeOption === 'pose' ? 'Choose Pose' : activeOption === 'pants' ? 'Choose Pants' : 'Choose Shoes'}
            </span>
            <button onClick={() => setShowOptions(false)} className="text-xs text-accent font-bold">Done</button>
          </div>
          <PillPicker
            options={
              activeOption === 'outfit' ? Object.keys(OUTFITS) :
              activeOption === 'pants' ? Object.keys(PANTS) :
              activeOption === 'shoes' ? Object.keys(SHOES) :
              activeOption === 'scene' ? Object.keys(SCENES) :
              Object.keys(POSES)
            }
            value={
              activeOption === 'outfit' ? outfitKey :
              activeOption === 'pants' ? pantsKey :
              activeOption === 'shoes' ? shoesKey :
              activeOption === 'scene' ? sceneKey :
              poseKey
            }
            onChange={(val) => {
              if (activeOption === 'outfit') setOutfitKey(val);
              else if (activeOption === 'pants') setPantsKey(val);
              else if (activeOption === 'shoes') setShoesKey(val);
              else if (activeOption === 'scene') setSceneKey(val);
              else setPoseKey(val);
            }}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-xs text-red-600 font-medium">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 ml-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* Generate Button */}
      {name.trim() && (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full py-4 bg-accent text-white text-sm font-bold rounded-2xl mb-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all relative overflow-hidden ${!isLoading ? 'btn-shimmer' : ''}`}
        >
          {isLoading ? 'Generating...' : 'Generate Flex ⚡'}
        </button>
      )}

      {/* Loading state with progress bar */}
      {isLoading && !images.length && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-4 flex flex-col items-center justify-center border border-gray-200" style={{ minHeight: 200 }}>
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-gray-900 mb-1">Creating {name}&apos;s flex photos...</p>
          <p className="text-[10px] text-gray-400 mb-4">This takes 30–45 seconds</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-accent h-1.5 rounded-full transition-all duration-[3000ms] ease-out"
              style={{ width: `${(progress / 3) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{progress}/3 images</p>
        </div>
      )}

      {/* Results */}
      {images.length > 0 && (
        <div className="mb-5">
          <div className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-200 shadow-sm">
            <div className="relative">
              <img
                src={`data:image/png;base64,${images[selectedIndex]}`}
                alt={`${name} flex`}
                className="w-full block"
              />
              <button
                onClick={() => downloadImage(images[selectedIndex], `flexbot-${name}-${selectedIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {outfitKey ? outfitKey.replace(/_/g, ' ') : 'Random outfit'} · Photo {selectedIndex + 1}/3
                  </p>
                  {caption && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{caption}</p>}
                </div>
                <button
                  onClick={() => {
                    images.forEach((img, i) => {
                      setTimeout(() => downloadImage(img, `flexbot-${name}-${i + 1}.png`), i * 300);
                    });
                  }}
                  className="text-[10px] text-accent font-semibold"
                >
                  Download All
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                  selectedIndex === idx ? 'border-accent' : 'border-gray-200'
                }`}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent generations */}
      {gallery.length > 0 && !isLoading && images.length === 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Recent</p>
          {gallery.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); setTab('gallery'); }}
              className="w-full flex items-center gap-3 py-3 border-b border-gray-100 text-left"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.outfit.replace(/_/g, ' ')} · {item.scene.replace(/_/g, ' ')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l5 5-5 5" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // GALLERY SCREEN
  // ═══════════════════════════════════════
  const renderGallery = () => (
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
        <span className="text-lg">🔥</span>
      </div>

      {/* Viewing detail */}
      {viewingItem ? (
        <div>
          <button
            onClick={() => setViewingItem(null)}
            className="text-xs text-accent font-semibold mb-4 flex items-center gap-1 py-1"
          >
            ← Back
          </button>

          <div className="bg-white rounded-2xl overflow-hidden mb-3 border border-gray-200 shadow-sm">
            <div className="relative">
              <img
                src={`data:image/png;base64,${viewingItem.images[viewingIndex]}`}
                alt={viewingItem.name}
                className="w-full block"
              />
              <button
                onClick={() => downloadImage(viewingItem.images[viewingIndex], `flexbot-${viewingItem.name}-${viewingIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{viewingItem.name}</p>
                <p className="text-[10px] text-gray-500">{viewingItem.date}, {viewingItem.time} · {viewingItem.outfit.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={() => deleteGalleryItem(viewingItem.id)}
                className="text-[10px] text-gray-400 font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {viewingItem.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setViewingIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                  viewingIndex === idx ? 'border-accent' : 'border-gray-200'
                }`}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              viewingItem.images.forEach((img, i) => {
                setTimeout(() => downloadImage(img, `flexbot-${viewingItem.name}-${i + 1}.png`), i * 300);
              });
            }}
            className="w-full py-3.5 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl active:scale-[0.98] transition"
          >
            Download All Photos
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-4">Past</p>

          {gallery.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-50">📸</div>
              <p className="text-sm text-gray-500">No generations yet</p>
              <p className="text-[10px] text-gray-400 mt-1">Create your first flex on the Home tab</p>
            </div>
          )}

          {gallery.length > 0 && (
            <button
              onClick={() => { setViewingItem(gallery[0]); setViewingIndex(0); }}
              className="w-full bg-white rounded-2xl overflow-hidden mb-4 text-left border border-gray-200 shadow-sm active:opacity-90 transition"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`data:image/png;base64,${gallery[0].images[0]}`}
                  alt={gallery[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{gallery[0].name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{gallery[0].date}, {gallery[0].time}</p>
                <p className="text-[10px] text-gray-400">{gallery[0].outfit.replace(/_/g, ' ')} · {gallery[0].scene.replace(/_/g, ' ')}</p>
              </div>
            </button>
          )}

          {gallery.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); }}
              className="w-full flex items-center gap-3 py-3.5 border-b border-gray-100 text-left active:opacity-70 transition"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-[10px] text-gray-500">
                  {item.date}, {item.time}
                </p>
                <p className="text-[10px] text-gray-400">{item.outfit.replace(/_/g, ' ')}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 1l5 5-5 5" />
                </svg>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // PROFILE SCREEN
  // ═══════════════════════════════════════
  const renderProfile = () => (
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
      {/* Greeting + Avatar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xl font-bold text-gray-900">Hi there 👋</p>
          <p className="text-sm text-gray-500">Premeditated Millionaire</p>
        </div>
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
          <span className="text-2xl">💰</span>
        </div>
      </div>

      {/* 3 Action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setTab('gallery')}
          className="bg-gray-50 rounded-2xl py-5 flex flex-col items-center gap-2.5 border border-gray-200 shadow-sm active:opacity-80 transition"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-900">Gallery</span>
        </button>
        <button className="bg-gray-50 rounded-2xl py-5 flex flex-col items-center gap-2.5 border border-gray-200 shadow-sm active:opacity-80 transition">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-900">Downloads</span>
        </button>
        <button
          onClick={() => setTab('home')}
          className="bg-gray-50 rounded-2xl py-5 flex flex-col items-center gap-2.5 border border-gray-200 shadow-sm active:opacity-80 transition"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-[11px] font-semibold text-gray-900">Generate</span>
        </button>
      </div>

      {/* Menu items */}
      <div className="space-y-0">
        <MenuRow icon="📊" label="Stats" value={`${totalGenerated} images`} />
        <MenuRow icon="⚙️" label="Settings" />
        <MenuRow icon="📤" label="Share FlexBot" />
        <MenuRow icon="💬" label="Discord Community" />
        <MenuRow icon="ℹ️" label="About" />
      </div>

      <div className="mt-8 text-right">
        <p className="text-[10px] text-gray-400">v2.0.0</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white relative max-w-md mx-auto">
      <div className="pt-safe">
        {tab === 'home' && renderHome()}
        {tab === 'gallery' && renderGallery()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* ─── Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border-t border-gray-200">
          <div className="flex justify-around items-center h-[72px] pb-safe">
            <BottomTab
              active={tab === 'home'}
              label="Home"
              onClick={() => setTab('home')}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === 'home' ? '#E53935' : 'none'} stroke={tab === 'home' ? '#E53935' : '#aaa'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              }
            />
            <BottomTab
              active={tab === 'gallery'}
              label="Activity"
              onClick={() => { setTab('gallery'); setViewingItem(null); }}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === 'gallery' ? '#E53935' : '#aaa'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              }
            />
            <BottomTab
              active={tab === 'profile'}
              label="Profile"
              onClick={() => setTab('profile')}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === 'profile' ? '#E53935' : '#aaa'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />
          </div>
        </div>
      </nav>
    </main>
  );
}

// ─── Sub-components ───

function BottomTab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-1 px-5 transition active:opacity-70 relative">
      {active && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent" />
      )}
      {icon}
      <span className={`text-[10px] font-medium ${active ? 'text-accent' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}

function PillPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (val: string) => void }) {
  return (
    <div className="pill-scroll">
      <button
        onClick={() => onChange('')}
        className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
          value === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'
        }`}
      >
        Random
      </button>
      {options.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition whitespace-nowrap ${
            value === key ? 'bg-accent text-white border-accent' : 'bg-white text-gray-700 border-gray-200'
          }`}
        >
          {key.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}

function MenuRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px] text-gray-400">{value}</span>}
        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
