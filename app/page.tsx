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
type OptionTab = 'outfit' | 'scene' | 'pose';

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
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [viewingItem, setViewingItem] = useState<GalleryItem | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [name2, setName2] = useState('');
  const [showName2, setShowName2] = useState(false);
  const [outfitKey, setOutfitKey] = useState('');
  const [sceneKey, setSceneKey] = useState('');
  const [poseKey, setPoseKey] = useState('');
  const [tattoosEnabled, setTattoosEnabled] = useState(false);
  const [activeOption, setActiveOption] = useState<OptionTab>('outfit');

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) {
      document.getElementById('name-input')?.focus();
      return;
    }
    setIsLoading(true);
    setProgress(0);
    setError('');
    setImages([]);
    setCaption('');

    const progressTimer = setInterval(() => {
      setProgress(prev => (prev < 2 ? prev + 1 : prev));
    }, 12000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          name2: (showName2 && name2.trim()) ? name2.trim() : undefined,
          outfitKey: outfitKey || undefined,
          sceneKey: sceneKey || undefined,
          poseKey: poseKey || undefined,
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
        const updated = [item, ...prev].slice(0, 8); // Keep last 8 generations
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

  const currentOptionValue = activeOption === 'outfit' ? outfitKey : activeOption === 'scene' ? sceneKey : poseKey;
  const setCurrentOption = (val: string) => {
    if (activeOption === 'outfit') setOutfitKey(val);
    else if (activeOption === 'scene') setSceneKey(val);
    else setPoseKey(val);
  };
  const currentOptionKeys = activeOption === 'outfit' ? Object.keys(OUTFITS) : activeOption === 'scene' ? Object.keys(SCENES) : Object.keys(POSES);

  // ═══════════════════════════════════════
  // HOME SCREEN
  // ═══════════════════════════════════════
  const renderHome = () => (
    <div className="px-4 pt-4 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', color: '#C9A84B', letterSpacing: '0.12em', lineHeight: 1 }}
          >
            FLEXBOT
          </h1>
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(240,235,224,0.28)' }}>
            AI · STREET · FLEX
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base"
          style={{ background: 'rgba(201,168,75,0.1)', border: '1px solid rgba(201,168,75,0.22)' }}
        >
          ⚡
        </div>
      </div>

      {/* ── Name Input(s) ── */}
      <div className="mb-4 space-y-2">
        {/* Person 1 */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-xs font-bold" style={{ color: 'rgba(201,168,75,0.5)' }}>1</span>
          </div>
          <input
            id="name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Who's flexing? (e.g. Steph Curry)"
            className="w-full pl-8 pr-10 py-4 rounded-2xl font-medium transition-all"
            style={{
              background: '#111111',
              border: `1.5px solid ${name.trim() ? 'rgba(201,168,75,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: '#F0EBE0',
              fontSize: '0.95rem',
              boxShadow: name.trim() ? '0 0 0 3px rgba(201,168,75,0.07)' : 'none',
            }}
          />
          {/* Add / Remove person 2 toggle */}
          <button
            onClick={() => { setShowName2(!showName2); if (showName2) setName2(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{
              background: showName2 ? 'rgba(229,57,53,0.15)' : 'rgba(201,168,75,0.12)',
              border: `1px solid ${showName2 ? 'rgba(229,57,53,0.3)' : 'rgba(201,168,75,0.25)'}`,
            }}
            title={showName2 ? 'Remove second person' : 'Add second person'}
          >
            {showName2 ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(229,57,53,0.8)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,75,0.8)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            )}
          </button>
        </div>

        {/* Person 2 — slides in */}
        {showName2 && (
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="text-xs font-bold" style={{ color: 'rgba(201,168,75,0.5)' }}>2</span>
            </div>
            <input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Second person (e.g. LeBron James)"
              className="w-full pl-8 pr-4 py-4 rounded-2xl font-medium transition-all"
              style={{
                background: '#111111',
                border: `1.5px solid ${name2.trim() ? 'rgba(201,168,75,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: '#F0EBE0',
                fontSize: '0.95rem',
                boxShadow: name2.trim() ? '0 0 0 3px rgba(201,168,75,0.07)' : 'none',
              }}
            />
          </div>
        )}

        {/* Duo mode label */}
        {showName2 && (
          <p className="text-[10px] text-center font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(201,168,75,0.5)' }}>
            👥 Duo mode — both in the same scene
          </p>
        )}
      </div>

      {/* ── Options Block: Tabs + Pills ── */}
      <div
        className="rounded-2xl overflow-hidden mb-4"
        style={{ background: '#0C0C0C', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Tab row */}
        <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {([
            { key: 'outfit', label: 'Outfit', emoji: '👔', selected: outfitKey },
            { key: 'scene', label: 'Scene', emoji: '🏙️', selected: sceneKey },
            { key: 'pose', label: 'Pose', emoji: '💪', selected: poseKey },
          ] as { key: OptionTab; label: string; emoji: string; selected: string }[]).map(({ key, label, emoji, selected }) => (
            <button
              key={key}
              onClick={() => setActiveOption(key)}
              className="flex-1 py-3 flex flex-col items-center gap-0.5 transition-all"
              style={{
                borderBottom: `2px solid ${activeOption === key ? '#C9A84B' : 'transparent'}`,
              }}
            >
              <span className="text-base leading-none">{emoji}</span>
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: activeOption === key ? '#C9A84B' : 'rgba(240,235,224,0.38)' }}
              >
                {label}
              </span>
              {selected && (
                <span
                  className="text-[8px] truncate max-w-[60px]"
                  style={{ color: 'rgba(201,168,75,0.7)' }}
                >
                  {selected.replace(/_/g, ' ')}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pill scroll for active tab */}
        <div className="px-3 py-3">
          <PillPicker
            options={currentOptionKeys}
            value={currentOptionValue}
            onChange={setCurrentOption}
          />
        </div>
      </div>

      {/* ── Tattoo Toggle ── */}
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-2xl mb-5"
        style={{
          background: '#0C0C0C',
          border: `1px solid ${tattoosEnabled ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{tattoosEnabled ? '🔱' : '🫧'}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#F0EBE0' }}>Sleeve Tattoos</p>
            <p className="text-[10px] mt-0.5" style={{ color: tattoosEnabled ? '#a78bfa' : 'rgba(240,235,224,0.32)' }}>
              {tattoosEnabled ? 'Full sleeves + neck tattoos' : 'Clean skin — no ink'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTattoosEnabled(!tattoosEnabled)}
          className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
          style={{ background: tattoosEnabled ? 'rgba(139,92,246,0.75)' : 'rgba(255,255,255,0.09)' }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
            style={{ left: tattoosEnabled ? '26px' : '2px' }}
          />
        </button>
      </div>

      {/* ── Generate Button ── */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] btn-shimmer relative overflow-hidden disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #C9A84B 0%, #A07628 100%)',
          boxShadow: isLoading ? 'none' : '0 4px 28px rgba(201,168,75,0.3)',
          border: '1px solid rgba(201,168,75,0.4)',
        }}
      >
        {isLoading ? (
          <>
            <div
              className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black/70"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.05rem', color: '#0F0F0F', letterSpacing: '0.15em' }}>
              Generating {progress}/3...
            </span>
          </>
        ) : (
          <>
            <span className="text-lg">⚡</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.15rem', color: '#0A0A0A', letterSpacing: '0.15em' }}>
              {showName2 && name.trim() && name2.trim()
                ? `Flex ${name.split(' ')[0]} & ${name2.split(' ')[0]}`
                : name.trim() ? `Flex ${name.split(' ')[0]}` : 'Generate Flex'}
            </span>
          </>
        )}
      </button>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-2xl px-4 py-3 mt-3 flex items-center justify-between" style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)' }}>
          <p className="text-xs font-medium" style={{ color: '#ff6b6b' }}>{error}</p>
          <button onClick={() => setError('')} className="ml-2 opacity-60 hover:opacity-100">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && !images.length && (
        <div
          className="rounded-2xl p-8 mt-4 flex flex-col items-center justify-center"
          style={{ background: '#0C0C0C', border: '1px solid rgba(201,168,75,0.12)', minHeight: 220 }}
        >
          <div
            className="w-12 h-12 rounded-full mb-5"
            style={{ border: '2px solid rgba(201,168,75,0.15)', borderTop: '2px solid #C9A84B', animation: 'spin 0.9s linear infinite' }}
          />
          <p className="text-sm font-semibold mb-1" style={{ color: '#F0EBE0' }}>
            Creating {name}&apos;s flex photos...
          </p>
          <p className="text-[11px] mb-5" style={{ color: 'rgba(240,235,224,0.32)' }}>
            30–45 seconds · 3 AI photos
          </p>
          <div className="w-full rounded-full overflow-hidden h-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-1 rounded-full transition-all duration-[3000ms] ease-out"
              style={{ width: `${(progress / 3) * 100}%`, background: 'linear-gradient(90deg, #C9A84B, #E8C96A)' }}
            />
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'rgba(240,235,224,0.28)' }}>{progress} of 3 images ready</p>
        </div>
      )}

      {/* ── Feature cards (shown whenever no active result) ── */}
      {!isLoading && images.length === 0 && (
        <div className="mt-5 rounded-2xl overflow-hidden" style={{ background: '#0C0C0C', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="px-4 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'rgba(240,235,224,0.25)' }}>What you get</p>
            {[
              { icon: '📸', label: '3 AI photos per generation', sub: 'Different poses, same scene' },
              { icon: '⚡', label: '30–45 second generation', sub: 'Powered by Google Gemini' },
              { icon: '💰', label: 'Full body, ultra-realistic', sub: 'Indistinguishable from real photos' },
              { icon: '⛓️', label: 'Diamond chain every time', sub: 'Cuban link + pendant, always on' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 mb-4 last:mb-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(201,168,75,0.08)', border: '1px solid rgba(201,168,75,0.15)' }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'rgba(240,235,224,0.75)' }}>{label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,235,224,0.32)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {images.length > 0 && (
        <div className="mt-4">
          <div
            className="rounded-2xl overflow-hidden mb-3"
            style={{ background: '#0C0C0C', border: '1px solid rgba(201,168,75,0.2)', boxShadow: '0 8px 48px rgba(0,0,0,0.7)' }}
          >
            <div className="relative">
              <img
                src={`data:image/png;base64,${images[selectedIndex]}`}
                alt={`${name} flex`}
                className="w-full block"
              />
              {/* Prev */}
              <button
                onClick={() => setSelectedIndex(prev => (prev - 1 + images.length) % images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              {/* Next */}
              <button
                onClick={() => setSelectedIndex(prev => (prev + 1) % images.length)}
                className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition"
                style={{ right: '52px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              {/* Counter */}
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
              >
                <span className="text-[10px] font-semibold" style={{ color: '#C9A84B' }}>
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
              {/* Download */}
              <button
                onClick={() => downloadImage(images[selectedIndex], `flexbot-${name}-${selectedIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            {/* Image info bar */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#F0EBE0' }}>{name}</p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(240,235,224,0.38)' }}>
                  {outfitKey ? outfitKey.replace(/_/g, ' ') : 'Random outfit'} · Photo {selectedIndex + 1}/3
                </p>
              </div>
              <button
                onClick={() => images.forEach((img, i) => setTimeout(() => downloadImage(img, `flexbot-${name}-${i + 1}.png`), i * 300))}
                className="text-[11px] font-semibold ml-3 flex-shrink-0"
                style={{ color: '#C9A84B' }}
              >
                Save All
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className="aspect-square rounded-xl overflow-hidden transition-all active:scale-95"
                style={{
                  border: `2px solid ${selectedIndex === idx ? '#C9A84B' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: selectedIndex === idx ? '0 0 14px rgba(201,168,75,0.28)' : 'none',
                }}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent ── */}
      {gallery.length > 0 && !isLoading && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(240,235,224,0.28)' }}>
              Recent · {gallery.length}/8
            </p>
            <button onClick={() => setTab('gallery')} className="text-[10px] font-semibold" style={{ color: '#C9A84B' }}>
              See All
            </button>
          </div>
          {gallery.slice(0, 8).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); setTab('gallery'); }}
              className="w-full flex items-center gap-3 py-3 text-left"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#1A1A1A' }}>
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#F0EBE0' }}>{item.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,235,224,0.32)' }}>
                  {item.outfit.replace(/_/g, ' ')} · {item.scene.replace(/_/g, ' ')}
                </p>
              </div>
              <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="rgba(201,168,75,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1l5 5-5 5" />
              </svg>
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
    <div className="px-4 pt-4 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', color: '#C9A84B', letterSpacing: '0.1em', lineHeight: 1 }}
          >
            ACTIVITY
          </h1>
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(240,235,224,0.28)' }}>
            Past Generations
          </p>
        </div>
        <span className="text-xl">🔥</span>
      </div>

      {viewingItem ? (
        <div>
          <button
            onClick={() => setViewingItem(null)}
            className="flex items-center gap-1.5 text-xs font-semibold mb-4 py-1"
            style={{ color: '#C9A84B' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div
            className="rounded-2xl overflow-hidden mb-3"
            style={{ background: '#0C0C0C', border: '1px solid rgba(201,168,75,0.2)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
          >
            <div className="relative">
              <button
                onClick={() => setViewingIndex(prev => (prev - 1 + viewingItem.images.length) % viewingItem.images.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition z-10"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <img
                src={`data:image/png;base64,${viewingItem.images[viewingIndex]}`}
                alt={viewingItem.name}
                className="w-full block"
              />
              <button
                onClick={() => setViewingIndex(prev => (prev + 1) % viewingItem.images.length)}
                className="absolute top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition z-10"
                style={{ right: '52px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <div
                className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
              >
                <span className="text-[10px] font-semibold" style={{ color: '#C9A84B' }}>
                  {viewingIndex + 1} / {viewingItem.images.length}
                </span>
              </div>
              <button
                onClick={() => downloadImage(viewingItem.images[viewingIndex], `flexbot-${viewingItem.name}-${viewingIndex + 1}.png`)}
                className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#F0EBE0' }}>{viewingItem.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,235,224,0.38)' }}>
                  {viewingItem.date}, {viewingItem.time} · {viewingItem.outfit.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={() => deleteGalleryItem(viewingItem.id)}
                className="text-[11px] font-medium"
                style={{ color: 'rgba(229,57,53,0.65)' }}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {viewingItem.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setViewingIndex(idx)}
                className="aspect-square rounded-xl overflow-hidden transition-all active:scale-95"
                style={{
                  border: `2px solid ${viewingIndex === idx ? '#C9A84B' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: viewingIndex === idx ? '0 0 14px rgba(201,168,75,0.28)' : 'none',
                }}
              >
                <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <button
            onClick={() => viewingItem.images.forEach((img, i) => setTimeout(() => downloadImage(img, `flexbot-${viewingItem.name}-${i + 1}.png`), i * 300))}
            className="w-full py-3.5 rounded-xl active:scale-[0.98] transition btn-shimmer relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C9A84B 0%, #A07628 100%)', color: '#0A0A0A', fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem', letterSpacing: '0.15em', boxShadow: '0 4px 20px rgba(201,168,75,0.22)' }}
          >
            Save All Photos
          </button>
        </div>
      ) : (
        <>
          {gallery.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-20">📸</div>
              <p className="text-sm font-medium" style={{ color: 'rgba(240,235,224,0.45)' }}>No generations yet</p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(240,235,224,0.28)' }}>Create your first flex on the Home tab</p>
            </div>
          )}

          {gallery.length > 0 && (
            <button
              onClick={() => { setViewingItem(gallery[0]); setViewingIndex(0); }}
              className="w-full rounded-2xl overflow-hidden mb-4 text-left active:opacity-90 transition"
              style={{ background: '#0C0C0C', border: '1px solid rgba(201,168,75,0.2)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`data:image/png;base64,${gallery[0].images[0]}`}
                  alt={gallery[0].name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', color: '#C9A84B', letterSpacing: '0.08em', lineHeight: 1 }}
                  >
                    {gallery[0].name.toUpperCase()}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{gallery[0].date}, {gallery[0].time}</p>
                </div>
              </div>
            </button>
          )}

          {gallery.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); }}
              className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-70 transition"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#1A1A1A' }}>
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#F0EBE0' }}>{item.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,235,224,0.38)' }}>{item.date} · {item.outfit.replace(/_/g, ' ')}</p>
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,75,0.1)', border: '1px solid rgba(201,168,75,0.18)' }}
              >
                <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="#C9A84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="px-4 pt-4 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 72px)' }}>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: '#C9A84B', letterSpacing: '0.1em', lineHeight: 1 }}
          >
            PREMEDITATED
          </h1>
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mt-1" style={{ color: 'rgba(240,235,224,0.28)' }}>
            Millionaire
          </p>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(201,168,75,0.09)', border: '1px solid rgba(201,168,75,0.22)' }}
        >
          💰
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <ProfileAction
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
          }
          label="Gallery"
          onClick={() => setTab('gallery')}
        />
        <ProfileAction
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          }
          label="Downloads"
          onClick={() => {}}
        />
        <ProfileAction
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
          label="Generate"
          onClick={() => setTab('home')}
        />
      </div>

      <div>
        <MenuRow icon="📊" label="Stats" value={`${totalGenerated} images`} />
        <MenuRow icon="⚙️" label="Settings" />
        <MenuRow icon="📤" label="Share FlexBot" />
        <MenuRow icon="💬" label="Discord Community" />
        <MenuRow icon="ℹ️" label="About" />
      </div>

      <div className="mt-8 text-right">
        <p className="text-[10px]" style={{ color: 'rgba(240,235,224,0.18)' }}>v2.0.0</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen relative max-w-md mx-auto" style={{ background: '#070707' }}>
      <div className="pt-safe">
        {tab === 'home' && renderHome()}
        {tab === 'gallery' && renderGallery()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* ─── Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div
          className="max-w-md mx-auto backdrop-blur-xl"
          style={{ background: 'rgba(7,7,7,0.97)', borderTop: '1px solid rgba(255,255,255,0.055)' }}
        >
          <div className="flex justify-around items-center h-[72px] pb-safe">
            <BottomTab
              active={tab === 'home'}
              label="Home"
              onClick={() => setTab('home')}
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24"
                  fill={tab === 'home' ? 'rgba(201,168,75,0.12)' : 'none'}
                  stroke={tab === 'home' ? '#C9A84B' : 'rgba(240,235,224,0.28)'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                >
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={tab === 'gallery' ? '#C9A84B' : 'rgba(240,235,224,0.28)'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                >
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke={tab === 'profile' ? '#C9A84B' : 'rgba(240,235,224,0.28)'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                >
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
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
          style={{ background: 'linear-gradient(90deg, #C9A84B, #E8C96A)' }}
        />
      )}
      {icon}
      <span className="text-[10px] font-medium" style={{ color: active ? '#C9A84B' : 'rgba(240,235,224,0.3)' }}>
        {label}
      </span>
    </button>
  );
}

function PillPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (val: string) => void }) {
  return (
    <div className="pill-scroll">
      <button
        onClick={() => onChange('')}
        className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap"
        style={{
          background: value === '' ? '#C9A84B' : 'rgba(255,255,255,0.04)',
          color: value === '' ? '#0A0A0A' : 'rgba(240,235,224,0.5)',
          border: `1px solid ${value === '' ? '#C9A84B' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        Random
      </button>
      {options.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap"
          style={{
            background: value === key ? '#C9A84B' : 'rgba(255,255,255,0.04)',
            color: value === key ? '#0A0A0A' : 'rgba(240,235,224,0.5)',
            border: `1px solid ${value === key ? '#C9A84B' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          {key.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}

function MenuRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="flex items-center gap-3">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-medium" style={{ color: '#F0EBE0' }}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px]" style={{ color: '#C9A84B' }}>{value}</span>}
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.055)' }}>
          <svg width="6" height="10" viewBox="0 0 7 12" fill="none" stroke="rgba(240,235,224,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1l5 5-5 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ProfileAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl py-5 flex flex-col items-center gap-2.5 active:opacity-75 transition"
      style={{ background: '#0C0C0C', border: '1px solid rgba(201,168,75,0.14)' }}
    >
      {icon}
      <span className="text-[11px] font-semibold" style={{ color: 'rgba(240,235,224,0.75)' }}>{label}</span>
    </button>
  );
}
