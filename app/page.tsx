'use client';

import { useState, useEffect, useCallback } from 'react';
import { OUTFITS, SCENES, POSES } from '@/lib/data';

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
  const [, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [outfitKey, setOutfitKey] = useState('');
  const [sceneKey, setSceneKey] = useState('');
  const [poseKey, setPoseKey] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    setProgress(0);
    setImages([]);
    setCaption('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          outfitKey: outfitKey || undefined,
          sceneKey: sceneKey || undefined,
          poseKey: poseKey || undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }
      const result: GenerateResponse = await response.json();
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
      const updated = [item, ...gallery];
      setGallery(updated);
      saveGallery(updated);
    } catch (err) {
      console.error('Generate error:', err);
      alert(err instanceof Error ? err.message : 'Generation failed');
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
      {/* Category Cards — 2x2 grid matching reference */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-surface rounded-[20px] p-4 aspect-square flex flex-col justify-end relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="absolute top-4 left-4 right-4 bottom-4 flex items-center justify-center">
            <span className="text-5xl opacity-80">👔</span>
          </div>
          <div className="relative z-20">
            <span className="text-sm font-semibold">Outfits</span>
            <span className="ml-2 bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">35+</span>
          </div>
        </div>

        <div className="bg-surface rounded-[20px] p-4 aspect-square flex flex-col justify-end relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="absolute top-4 left-4 right-4 bottom-4 flex items-center justify-center">
            <span className="text-5xl opacity-80">🏙️</span>
          </div>
          <div className="relative z-20">
            <span className="text-sm font-semibold">Scenes</span>
            <span className="ml-2 text-[10px] text-gray-400">33+ locations</span>
          </div>
        </div>

        <div className="bg-surface rounded-[20px] p-4 aspect-square flex flex-col justify-end relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
          <div className="absolute top-4 left-4 right-4 bottom-4 flex items-center justify-center">
            <span className="text-5xl opacity-80">💪</span>
          </div>
          <div className="relative z-20">
            <span className="text-sm font-semibold">Poses</span>
            <span className="ml-2 text-[10px] text-gray-400">38+ actions</span>
          </div>
        </div>

        <div
          onClick={() => document.getElementById('name-input')?.focus()}
          className="bg-surface rounded-[20px] p-4 aspect-square flex flex-col justify-end relative overflow-hidden cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-accent/30 to-transparent z-10" />
          <div className="absolute top-4 left-4 right-4 bottom-4 flex items-center justify-center">
            <span className="text-5xl opacity-80">⚡</span>
          </div>
          <div className="relative z-20">
            <span className="text-sm font-semibold">Generate</span>
            <span className="ml-2 text-[10px] text-gray-400">3 photos</span>
          </div>
        </div>
      </div>

      {/* Search-style input — like "Where to?" */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
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
            placeholder="Who's flexing?"
            className="w-full pl-10 pr-4 py-3.5 text-sm bg-surface rounded-full text-white placeholder-gray-500 font-medium focus:ring-2 focus:ring-accent/50 border border-surface-lighter"
          />
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="h-[46px] px-4 bg-surface border border-surface-lighter rounded-full text-xs font-semibold text-gray-300 flex items-center gap-1.5 shrink-0"
        >
          Options
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points={showOptions ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
          </svg>
        </button>
      </div>

      {/* Options panel */}
      {showOptions && (
        <div className="bg-surface rounded-2xl p-4 mb-4 space-y-3 border border-surface-lighter">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Outfit</label>
            <select
              value={outfitKey}
              onChange={(e) => setOutfitKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-light border border-surface-lighter rounded-xl text-white appearance-none cursor-pointer"
            >
              <option value="">Random</option>
              {Object.keys(OUTFITS).map((key) => (
                <option key={key} value={key}>{key.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Scene</label>
            <select
              value={sceneKey}
              onChange={(e) => setSceneKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-light border border-surface-lighter rounded-xl text-white appearance-none cursor-pointer"
            >
              <option value="">Random</option>
              {Object.keys(SCENES).map((key) => (
                <option key={key} value={key}>{key.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Pose</label>
            <select
              value={poseKey}
              onChange={(e) => setPoseKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-surface-light border border-surface-lighter rounded-xl text-white appearance-none cursor-pointer"
            >
              <option value="">Random</option>
              {Object.keys(POSES).map((key) => (
                <option key={key} value={key}>{key.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Generate Button */}
      {name.trim() && (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full py-4 bg-accent text-white text-sm font-bold rounded-2xl mb-5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-dark active:scale-[0.98] transition-all"
        >
          {isLoading ? `Generating... ${progress}/3` : 'Generate Flex ⚡'}
        </button>
      )}

      {/* Loading state */}
      {isLoading && !images.length && (
        <div className="bg-surface rounded-2xl p-6 mb-4 flex flex-col items-center justify-center" style={{ minHeight: 200 }}>
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400">Creating {name}&apos;s flex photos...</p>
          <p className="text-[10px] text-gray-600 mt-1">This takes 30-45 seconds</p>
        </div>
      )}

      {/* Results */}
      {images.length > 0 && (
        <div className="mb-5">
          {/* Featured image — large card like reference Activity first item */}
          <div className="bg-surface rounded-2xl overflow-hidden mb-3 border border-surface-lighter">
            <div className="relative">
              <img
                src={`data:image/png;base64,${images[selectedIndex]}`}
                alt={`${name} flex`}
                className="w-full block"
              />
              {/* Download overlay button */}
              <button
                onClick={() => downloadImage(images[selectedIndex], `flexbot-${name}-${selectedIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition"
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
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {outfitKey ? outfitKey.replace(/_/g, ' ') : 'Random outfit'} · Photo {selectedIndex + 1}/3
                  </p>
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

          {/* Thumbnail row */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                  selectedIndex === idx ? 'border-accent' : 'border-transparent'
                }`}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent generations — compact list like reference */}
      {gallery.length > 0 && !isLoading && images.length === 0 && (
        <div>
          {gallery.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); setTab('gallery'); }}
              className="w-full flex items-center gap-3 py-3 border-b border-surface-lighter text-left"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-light">
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.outfit.replace(/_/g, ' ')} · {item.scene.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex-shrink-0">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
        <h1 className="text-2xl font-bold">Activity</h1>
        <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
          <span className="text-[8px]">🔥</span>
        </div>
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

          {/* Featured card */}
          <div className="bg-surface rounded-2xl overflow-hidden mb-3 border border-surface-lighter">
            <div className="relative">
              <img
                src={`data:image/png;base64,${viewingItem.images[viewingIndex]}`}
                alt={viewingItem.name}
                className="w-full block"
              />
              <button
                onClick={() => downloadImage(viewingItem.images[viewingIndex], `flexbot-${viewingItem.name}-${viewingIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition"
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
                <p className="text-sm font-semibold">{viewingItem.name}</p>
                <p className="text-[10px] text-gray-500">{viewingItem.date}, {viewingItem.time} · {viewingItem.outfit.replace(/_/g, ' ')}</p>
              </div>
              <button
                onClick={() => deleteGalleryItem(viewingItem.id)}
                className="text-[10px] text-gray-500 font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {viewingItem.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setViewingIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                  viewingIndex === idx ? 'border-accent' : 'border-transparent'
                }`}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Download all */}
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
          {/* Past label */}
          <p className="text-xs text-gray-500 mb-4">Past</p>

          {gallery.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-50">📸</div>
              <p className="text-sm text-gray-500">No generations yet</p>
              <p className="text-[10px] text-gray-600 mt-1">Create your first flex on the Home tab</p>
            </div>
          )}

          {/* First item — large featured card (like reference) */}
          {gallery.length > 0 && (
            <button
              onClick={() => { setViewingItem(gallery[0]); setViewingIndex(0); }}
              className="w-full bg-surface rounded-2xl overflow-hidden mb-4 text-left border border-surface-lighter active:opacity-90 transition"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`data:image/png;base64,${gallery[0].images[0]}`}
                  alt={gallery[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-semibold">{gallery[0].name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{gallery[0].date}, {gallery[0].time}</p>
                <p className="text-[10px] text-gray-600">{gallery[0].outfit.replace(/_/g, ' ')} · {gallery[0].scene.replace(/_/g, ' ')}</p>
              </div>
            </button>
          )}

          {/* Remaining items — compact list with red dot */}
          {gallery.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); }}
              className="w-full flex items-center gap-3 py-3.5 border-b border-surface-lighter text-left active:opacity-70 transition"
            >
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-[10px] text-gray-500">
                  {item.date}, {item.time}
                </p>
                <p className="text-[10px] text-gray-600">{item.outfit.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex-shrink-0">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <p className="text-xl font-bold">Hi there 👋</p>
          <p className="text-sm text-gray-400">Premeditated Millionaire</p>
        </div>
        <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center border-2 border-surface-lighter">
          <span className="text-2xl">💰</span>
        </div>
      </div>

      {/* 3 Action buttons — matching reference exactly */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => setTab('gallery')}
          className="bg-surface-light rounded-2xl py-4 flex flex-col items-center gap-2 border border-surface-lighter active:opacity-80 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-[11px] font-semibold">Gallery</span>
        </button>
        <button className="bg-surface-light rounded-2xl py-4 flex flex-col items-center gap-2 border border-surface-lighter active:opacity-80 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="text-[11px] font-semibold">Downloads</span>
        </button>
        <button
          onClick={() => setTab('home')}
          className="bg-surface-light rounded-2xl py-4 flex flex-col items-center gap-2 border border-surface-lighter active:opacity-80 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span className="text-[11px] font-semibold">Generate</span>
        </button>
      </div>

      {/* Menu items — matching reference style */}
      <div className="space-y-0">
        <MenuRow icon="📊" label="Stats" value={`${totalGenerated} images`} />
        <MenuRow icon="⚙️" label="Settings" />
        <MenuRow icon="📤" label="Share FlexBot" />
        <MenuRow icon="💬" label="Discord Community" />
        <MenuRow icon="ℹ️" label="About" />
      </div>

      {/* Version — bottom right like reference */}
      <div className="mt-8 text-right">
        <p className="text-[10px] text-gray-600">v2.0.0</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-dark relative max-w-md mx-auto">
      <div className="pt-safe">
        {tab === 'home' && renderHome()}
        {tab === 'gallery' && renderGallery()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* ─── Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-md mx-auto bg-surface/95 backdrop-blur-lg border-t border-surface-lighter">
          <div className="flex justify-around items-center h-[72px] pb-safe">
            <BottomTab
              active={tab === 'home'}
              label="Home"
              onClick={() => setTab('home')}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill={tab === 'home' ? '#E53935' : 'none'} stroke={tab === 'home' ? '#E53935' : '#666'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === 'gallery' ? '#E53935' : '#666'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab === 'profile' ? '#E53935' : '#666'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 py-1 px-5 transition active:opacity-70">
      {icon}
      <span className={`text-[10px] font-medium ${active ? 'text-accent' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}

function MenuRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-surface-lighter">
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px] text-gray-500">{value}</span>}
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1l5 5-5 5" />
        </svg>
      </div>
    </div>
  );
}
