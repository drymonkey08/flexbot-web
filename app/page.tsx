'use client';

import { useState } from 'react';
import FlexForm from '@/components/FlexForm';
import FallingMoney from '@/components/FallingMoney';

interface GenerateResponse {
  images: string[];
  caption: string;
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);

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
    } catch (err) {
      console.error('Generate error:', err);
      alert(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-x-hidden">
      <FallingMoney />

      {/* ─── Top Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="flex justify-between items-center px-5 sm:px-10 py-4">
          <div className="flex gap-3 sm:gap-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-all"
            >
              Generate
            </button>
            <button className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-all hidden sm:block">
              About Us
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-2 border-black text-black bg-white hover:bg-black hover:text-white transition-all"
            >
              Contact Us
            </button>
          </div>

          {/* Logo center */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 hidden lg:block">
            <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-xs font-black">F</span>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-5 items-center">
            <span className="text-lg hover:opacity-60 transition cursor-pointer">♡</span>
            <span className="text-lg hover:opacity-60 transition cursor-pointer hidden sm:inline">🛒</span>
            <span className="text-lg hover:opacity-60 transition cursor-pointer">👤</span>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <div className="relative pt-20 sm:pt-24 min-h-screen z-10">

        {/* Left side elements */}
        <div className="absolute left-4 sm:left-10 top-28 sm:top-32 z-20 hidden sm:block">
          {/* Small thumbnail / branding */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-black">FB</span>
            </div>
            <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-sm">↗</span>
            </div>
          </div>

          {/* Vertical "SHOP" text */}
          <div className="flex flex-col items-center gap-0 text-[10px] font-bold tracking-widest text-gray-700 mb-8">
            {'FLEX'.split('').map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>

          {/* Callout */}
          <div className="mt-4 max-w-[140px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-black flex items-center justify-center text-[8px]">↓</div>
              <span className="text-[10px] font-bold uppercase">Go to catalog now</span>
            </div>
          </div>
        </div>

        {/* ─── Center: Large Image (the hero) ─── */}
        <div className="flex justify-center items-start px-4 sm:px-0 pt-4 sm:pt-8">
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl">
            {/* Main image area */}
            {!images.length && !isLoading && (
              <div className="aspect-[3/4] bg-gray-50 border border-gray-200 flex items-center justify-center rounded-2xl">
                <div className="text-center px-8">
                  <div className="text-6xl sm:text-8xl mb-4">💰</div>
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-mono text-gray-400 mb-2">
                    Awaiting Flex Generation
                  </p>
                  <p className="text-[10px] text-gray-300 font-mono">
                    Results will materialize here
                  </p>
                </div>
              </div>
            )}

            {isLoading && !images.length && (
              <div className="aspect-[3/4] bg-gray-50 border border-gray-200 flex items-center justify-center rounded-2xl">
                <div className="text-center">
                  <div className="w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-widest font-mono">[{progress}/3]</p>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <img
                  src={`data:image/png;base64,${images[selectedIndex]}`}
                  alt="Generated flex"
                  className="w-full block"
                />
              </div>
            )}

            {/* Floating callout - right side */}
            <div className="absolute -right-2 sm:right-[-120px] top-1/4 hidden lg:block">
              <div className="border-l-2 border-black pl-3 max-w-[150px]">
                <p className="text-[10px] font-mono leading-relaxed text-black">
                  <span className="font-bold">Find out</span> what your flex
                  photos can look like
                </p>
              </div>
            </div>

            {/* Size selectors - floating right */}
            {images.length > 0 && (
              <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-8 h-8 border-2 text-[10px] font-bold transition-all ${
                      selectedIndex === idx
                        ? 'border-black bg-black text-white'
                        : 'border-black bg-white hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side stats */}
        <div className="absolute right-4 sm:right-10 top-28 sm:top-32 z-20 hidden lg:block">
          <div className="flex gap-12 text-[10px] font-mono">
            <div>
              <span className="font-bold text-black">&lt;35+&gt;</span>
              <span className="ml-2 text-gray-700">Outfit choices</span>
            </div>
            <div>
              <span className="font-bold text-black">&lt;38+&gt;</span>
              <span className="ml-2 text-gray-700">Pose actions available</span>
            </div>
          </div>
          <div className="mt-3 text-right">
            <p className="text-[10px] text-gray-700 font-mono leading-relaxed max-w-[200px] ml-auto">
              Quality that Withstands<br />
              Time and Imagination
            </p>
          </div>
        </div>

        {/* ─── Bottom left: Headline ─── */}
        <div className="px-5 sm:px-10 mt-8 sm:mt-12 relative z-20">
          <div className="flex items-end gap-4 mb-2">
            <div className="w-6 h-6 border border-black flex items-center justify-center">
              <span className="text-[8px]">⚡</span>
            </div>
            <div className="h-px bg-black flex-1 max-w-[60px]" />
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight max-w-lg">
            Your Ultimate Flex<br />
            Against the Ordinary
          </h1>

          <p className="text-[10px] sm:text-xs text-gray-500 mt-4 max-w-sm leading-relaxed font-mono">
            ***When the moment calls for greatness......there&apos;s no room for
            compromise on style and presence.////
          </p>

          <button
            onClick={() => setShowForm(true)}
            className="mt-6 px-5 py-2.5 bg-black text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all inline-flex items-center gap-2"
          >
            Generate now //
          </button>
        </div>

        {/* Mobile thumbnail row */}
        {images.length > 0 && (
          <div className="px-5 mt-6 lg:hidden">
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-square border-2 rounded overflow-hidden transition ${
                    selectedIndex === idx ? 'border-black' : 'border-gray-300'
                  }`}
                >
                  <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Download / Share */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:image/png;base64,${images[selectedIndex]}`;
                  link.download = `flexbot-${selectedIndex + 1}.png`;
                  link.click();
                }}
                className="flex-1 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest"
              >
                ↓ Download
              </button>
              <button
                onClick={async () => {
                  if (!navigator.share) return alert('Share not supported');
                  const bin = atob(images[selectedIndex]);
                  const bytes = new Uint8Array(bin.length);
                  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                  const blob = new Blob([bytes], { type: 'image/png' });
                  const file = new File([blob], `flexbot-${selectedIndex + 1}.png`, { type: 'image/png' });
                  await navigator.share({ title: 'FlexBot', text: caption, files: [file] });
                }}
                className="flex-1 py-2.5 border-2 border-black text-[10px] font-bold uppercase tracking-widest"
              >
                ⤴ Share
              </button>
            </div>
          </div>
        )}

        {/* Caption */}
        {images.length > 0 && (
          <div className="px-5 sm:px-10 mt-6">
            <div className="max-w-xl border-t border-black pt-4">
              <p className="text-[10px] sm:text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap">{caption}</p>
            </div>
          </div>
        )}

        {/* Bottom right: Info cards */}
        <div className="absolute right-4 sm:right-10 bottom-8 sm:bottom-12 z-20 hidden lg:flex gap-4">
          {/* Info card 1 */}
          <div className="w-48 border-2 border-black bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 border border-black rounded-full flex items-center justify-center text-[8px]">✦</div>
              <span className="text-[8px] font-mono text-gray-400">FLEXBOT</span>
            </div>
            <p className="text-[10px] font-bold leading-tight">
              Unyielding<br />
              Creation,<br />
              Uncompromising<br />
              Style
            </p>
          </div>
          {/* Info card 2 */}
          <div className="w-36 border-2 border-black bg-white overflow-hidden">
            {images.length > 0 ? (
              <img
                src={`data:image/png;base64,${images[(selectedIndex + 1) % images.length]}`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center p-4">
                <p className="text-[10px] font-mono text-gray-400 text-center">Preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Year badge */}
        <div className="absolute right-4 sm:right-10 bottom-1/3 z-20 hidden lg:block">
          <span className="text-3xl font-black text-gray-200">2026</span>
        </div>
      </div>

      {/* ─── Form Slide-over ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white border-l-2 border-black overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider">Generate</h2>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">AI FLEX GENERATOR</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-2xl font-bold hover:opacity-60 transition">×</button>
              </div>

              <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />

              {/* Desktop Action Buttons */}
              {images.length > 0 && (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${images[selectedIndex]}`;
                      link.download = `flexbot-${selectedIndex + 1}.png`;
                      link.click();
                    }}
                    className="w-full py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition"
                  >
                    ↓ Download
                  </button>
                  <button
                    onClick={async () => {
                      if (!navigator.share) return alert('Share not supported');
                      const bin = atob(images[selectedIndex]);
                      const bytes = new Uint8Array(bin.length);
                      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                      const blob = new Blob([bytes], { type: 'image/png' });
                      const file = new File([blob], `flexbot-${selectedIndex + 1}.png`, { type: 'image/png' });
                      await navigator.share({ title: 'FlexBot', text: caption, files: [file] });
                    }}
                    className="w-full py-3 border-2 border-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition"
                  >
                    ⤴ Share
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="mt-8 pt-6 border-t-2 border-black space-y-2 text-[10px] font-mono">
                <div className="flex justify-between"><span>OUTFITS</span><span className="font-bold">35+</span></div>
                <div className="flex justify-between"><span>SCENES</span><span className="font-bold">33+</span></div>
                <div className="flex justify-between"><span>POSES</span><span className="font-bold">38+</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Contact Modal ─── */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase">Contact</h2>
              <button onClick={() => setShowContact(false)} className="text-2xl font-bold hover:opacity-60">×</button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase mb-1">Email</p>
                <a href="mailto:contact@flexbot.com" className="text-blue-600 hover:underline font-mono text-xs">contact@flexbot.com</a>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase mb-1">Discord</p>
                <a href="https://discord.gg/flexbot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">Join Discord →</a>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase mb-1">GitHub</p>
                <a href="https://github.com/darshytwan" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-xs">@darshytwan</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
