'use client';

import { useState, useEffect, useCallback } from 'react';
import FlexForm from '@/components/FlexForm';

// ─── Types ───
interface GenerateResponse {
  images: string[];
  caption: string;
}

interface GalleryItem {
  id: string;
  name: string;
  images: string[]; // base64
  caption: string;
  outfit: string;
  scene: string;
  date: string;
}

type Tab = 'home' | 'gallery' | 'profile';

// ─── Icons (inline SVG for zero dependencies) ───
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E53935' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GalleryIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E53935' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#E53935' : '#888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

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
    // Storage full — remove oldest
    items.pop();
    localStorage.setItem('flexbot-gallery', JSON.stringify(items));
  }
}

// ─── Download helper ───
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
  const [lastGenName, setLastGenName] = useState('');
  const [lastGenOutfit, setLastGenOutfit] = useState('');
  const [lastGenScene, setLastGenScene] = useState('');

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  const handleGenerate = async (data: {
    name: string;
    outfitKey?: string;
    sceneKey?: string;
    poseKey?: string;
    customOutfit?: string;
    customPose?: string;
    customPrompt?: string;
  }) => {
    setIsLoading(true);
    setProgress(0);
    setImages([]);
    setCaption('');
    setLastGenName(data.name);
    setLastGenOutfit(data.outfitKey || 'Random');
    setLastGenScene(data.sceneKey || 'Random');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

      // Save to gallery
      const item: GalleryItem = {
        id: Date.now().toString(),
        name: data.name,
        images: result.images,
        caption: result.caption,
        outfit: data.outfitKey || 'Random',
        scene: data.sceneKey || 'Random',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
  const topCeleb = gallery.length > 0
    ? Object.entries(
        gallery.reduce((acc, g) => {
          acc[g.name] = (acc[g.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
    : '—';

  // ═══════════════════════════════════════
  // HOME SCREEN
  // ═══════════════════════════════════════
  const renderHome = () => (
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">FlexBot</h1>
          <p className="text-xs text-gray-500 mt-0.5">Premeditated Millionaire</p>
        </div>
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-black">FB</span>
        </div>
      </div>

      {/* Category Cards — matching reference layout */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
          <div className="text-3xl mb-2">👔</div>
          <span className="text-xs font-semibold">Outfits</span>
          <span className="text-[10px] text-gray-500 mt-0.5">35+ styles</span>
          <div className="absolute top-2 right-2 bg-accent px-1.5 py-0.5 rounded text-[8px] font-bold">NEW</div>
        </div>
        <div className="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
          <div className="text-3xl mb-2">🏙️</div>
          <span className="text-xs font-semibold">Scenes</span>
          <span className="text-[10px] text-gray-500 mt-0.5">33+ locations</span>
        </div>
        <div className="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
          <div className="text-3xl mb-2">🤑</div>
          <span className="text-xs font-semibold">Poses</span>
          <span className="text-[10px] text-gray-500 mt-0.5">38+ actions</span>
        </div>
        <div className="bg-surface rounded-2xl p-4 flex flex-col items-center justify-center aspect-square">
          <div className="text-3xl mb-2">⚡</div>
          <span className="text-xs font-semibold">Generate</span>
          <span className="text-[10px] text-gray-500 mt-0.5">3 photos / session</span>
        </div>
      </div>

      {/* Generate Form */}
      <div className="bg-surface rounded-2xl p-5 mb-6">
        <h2 className="text-base font-bold mb-4">Create Your Flex</h2>
        <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />
      </div>

      {/* Results */}
      {(images.length > 0 || isLoading) && (
        <div className="bg-surface rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">{lastGenName}</h3>
            <span className="text-[10px] text-gray-500">{lastGenOutfit} / {lastGenScene}</span>
          </div>

          {isLoading && !images.length && (
            <div className="aspect-[3/4] bg-surface-light rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-gray-400">Generating {progress}/3...</p>
              </div>
            </div>
          )}

          {images.length > 0 && (
            <>
              {/* Main image */}
              <div className="rounded-xl overflow-hidden mb-3">
                <img
                  src={`data:image/png;base64,${images[selectedIndex]}`}
                  alt={`${lastGenName} flex`}
                  className="w-full block"
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      selectedIndex === idx ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => downloadImage(images[selectedIndex], `flexbot-${lastGenName}-${selectedIndex + 1}.png`)}
                  className="flex-1 py-3 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition"
                >
                  <DownloadIcon /> Download
                </button>
                <button
                  onClick={() => {
                    // Download all 3
                    images.forEach((img, i) => {
                      setTimeout(() => downloadImage(img, `flexbot-${lastGenName}-${i + 1}.png`), i * 300);
                    });
                  }}
                  className="py-3 px-4 bg-surface-light text-white text-xs font-bold uppercase tracking-wider rounded-xl active:scale-[0.98] transition"
                >
                  All
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Recent generations quick access */}
      {gallery.length > 0 && !isLoading && images.length === 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-wider">Recent</h3>
          {gallery.slice(0, 3).map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); setTab('gallery'); }}
              className="w-full flex items-center gap-3 p-3 bg-surface rounded-xl mb-2 text-left active:bg-surface-light transition"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.date} · {item.outfit}</p>
              </div>
              <ChevronIcon />
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
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
      <h1 className="text-2xl font-bold mb-1">Gallery</h1>
      <p className="text-xs text-gray-500 mb-5">Past generations</p>

      {/* Viewing a specific item */}
      {viewingItem && (
        <div className="mb-6">
          <button
            onClick={() => setViewingItem(null)}
            className="text-xs text-accent font-semibold mb-3 flex items-center gap-1"
          >
            ← Back to all
          </button>

          <div className="bg-surface rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold">{viewingItem.name}</h3>
                <p className="text-[10px] text-gray-500">{viewingItem.date} · {viewingItem.outfit} · {viewingItem.scene}</p>
              </div>
              <button
                onClick={() => deleteGalleryItem(viewingItem.id)}
                className="text-xs text-red-400 font-semibold px-2 py-1"
              >
                Delete
              </button>
            </div>

            <div className="rounded-xl overflow-hidden mb-3">
              <img
                src={`data:image/png;base64,${viewingItem.images[viewingIndex]}`}
                alt={viewingItem.name}
                className="w-full block"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {viewingItem.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setViewingIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                    viewingIndex === idx ? 'border-accent' : 'border-transparent'
                  }`}
                >
                  <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadImage(viewingItem.images[viewingIndex], `flexbot-${viewingItem.name}-${viewingIndex + 1}.png`)}
                className="flex-1 py-3 bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <DownloadIcon /> Download
              </button>
              <button
                onClick={() => {
                  viewingItem.images.forEach((img, i) => {
                    setTimeout(() => downloadImage(img, `flexbot-${viewingItem.name}-${i + 1}.png`), i * 300);
                  });
                }}
                className="py-3 px-4 bg-surface-light text-white text-xs font-bold uppercase tracking-wider rounded-xl active:scale-[0.98] transition"
              >
                All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery list */}
      {!viewingItem && (
        <>
          {gallery.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📸</div>
              <p className="text-sm text-gray-500">No generations yet</p>
              <p className="text-xs text-gray-600 mt-1">Go to Home and create your first flex</p>
            </div>
          )}

          {gallery.map((item) => (
            <button
              key={item.id}
              onClick={() => { setViewingItem(item); setViewingIndex(0); }}
              className="w-full flex items-center gap-3 p-3 bg-surface rounded-xl mb-2 text-left active:bg-surface-light transition"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img src={`data:image/png;base64,${item.images[0]}`} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.date}</p>
                <p className="text-[10px] text-gray-600">{item.outfit} · {item.scene}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-gray-500">{item.images.length} photos</span>
                <ChevronIcon />
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
    <div className="px-4 pt-2 pb-4 overflow-y-auto" style={{ height: 'calc(100vh - 80px)' }}>
      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h1 className="text-xl font-bold">Premeditated Millionaire</h1>
          <p className="text-xs text-gray-500">FlexBot User</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setTab('gallery')}
          className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <GalleryIcon active={false} />
          </div>
          <span className="text-[10px] font-semibold">Gallery</span>
        </button>
        <button
          onClick={() => {
            // Download all gallery images
            gallery.forEach((item) => {
              item.images.forEach((img, i) => {
                setTimeout(() => downloadImage(img, `flexbot-${item.name}-${i + 1}.png`), i * 300);
              });
            });
          }}
          className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-2"
        >
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <DownloadIcon />
          </div>
          <span className="text-[10px] font-semibold">Downloads</span>
        </button>
        <button className="bg-surface rounded-2xl p-4 flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">Favorites</span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-surface rounded-2xl p-5 mb-6">
        <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">Your Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-black text-accent">{totalGenerated}</p>
            <p className="text-[10px] text-gray-500">Images Generated</p>
          </div>
          <div>
            <p className="text-2xl font-black text-accent">{gallery.length}</p>
            <p className="text-[10px] text-gray-500">Sessions</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm font-bold">{topCeleb}</p>
            <p className="text-[10px] text-gray-500">Most Flexed</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-surface rounded-2xl overflow-hidden mb-6">
        <MenuItem label="Settings" icon="⚙️" />
        <MenuItem label="Share FlexBot" icon="📤" />
        <MenuItem label="Discord Community" icon="💬" />
        <MenuItem label="About" icon="ℹ️" />
      </div>

      {/* Version */}
      <p className="text-center text-[10px] text-gray-600 mt-4">FlexBot v2.0 — Premeditated Millionaire</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-dark relative max-w-md mx-auto">
      {/* Screen content */}
      <div className="pt-safe">
        {tab === 'home' && renderHome()}
        {tab === 'gallery' && renderGallery()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* ─── Bottom Navigation Bar ─── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-surface-lighter z-50">
        <div className="max-w-md mx-auto flex justify-around items-center py-2 pb-safe">
          <TabButton icon={<HomeIcon active={tab === 'home'} />} label="Home" active={tab === 'home'} onClick={() => setTab('home')} />
          <TabButton icon={<GalleryIcon active={tab === 'gallery'} />} label="Gallery" active={tab === 'gallery'} onClick={() => { setTab('gallery'); setViewingItem(null); }} />
          <TabButton icon={<ProfileIcon active={tab === 'profile'} />} label="Profile" active={tab === 'profile'} onClick={() => setTab('profile')} />
        </div>
      </nav>
    </main>
  );
}

// ─── Sub-components ───

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 py-1 px-6 transition">
      {icon}
      <span className={`text-[10px] font-semibold ${active ? 'text-accent' : 'text-gray-500'}`}>{label}</span>
    </button>
  );
}

function MenuItem({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-lighter last:border-0">
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <ChevronIcon />
    </div>
  );
}
