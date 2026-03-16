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
        throw new Error(err.error || 'Failed to generate');
      }

      const result: GenerateResponse = await response.json();
      setImages(result.images);
      setCaption(result.caption);
      setProgress(3);
    } catch (err) {
      console.error('Generate error:', err);
      alert(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <FallingMoney />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black">
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex gap-8">
            <button className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition">CATALOG</button>
            <button className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition">ABOUT US</button>
            <button onClick={() => setShowContact(true)} className="text-xs font-bold uppercase tracking-widest hover:opacity-60 transition">CONTACT US</button>
          </div>
          <div className="flex gap-6 text-lg">
            <button className="hover:opacity-60 transition">♡</button>
            <button className="hover:opacity-60 transition">🛒</button>
            <button className="hover:opacity-60 transition">👤</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Hero Section with Scattered Layout */}
          <div className="relative min-h-[80vh] grid grid-cols-12 gap-8 items-start">

            {/* Left Sidebar - Navigation + Thumbnails */}
            <div className="col-span-2">
              <div className="sticky top-28 space-y-8">
                <div>
                  <h1 className="text-sm font-black uppercase tracking-widest mb-2">FLEXBOT</h1>
                  <p className="text-xs text-gray-600 font-mono">AI FLEX</p>
                </div>

                {/* Navigation dots */}
                <div className="flex flex-col gap-3">
                  <button className="w-2 h-2 bg-black rounded-full hover:opacity-60 transition" />
                  <button className="w-2 h-2 bg-gray-300 rounded-full hover:opacity-60 transition" />
                  <button className="w-2 h-2 bg-gray-300 rounded-full hover:opacity-60 transition" />
                </div>

                {/* Thumbnails */}
                {images.length > 0 && (
                  <div className="space-y-3">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`w-full aspect-square border-2 transition ${
                          selectedIndex === idx ? 'border-black' : 'border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Center - Large Image + Info Cards */}
            <div className="col-span-5 relative">
              {/* Main Image Display */}
              <div className="mb-8">
                {!images.length && !isLoading && (
                  <div className="aspect-square bg-gray-50 border-2 border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">📸</div>
                      <p className="text-xs uppercase font-mono text-gray-600">Generate to start</p>
                    </div>
                  </div>
                )}

                {isLoading && !images.length && (
                  <div className="aspect-square bg-gray-50 border-2 border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2 animate-spin">⚡</div>
                      <p className="text-xs uppercase font-mono">[{progress}/3]</p>
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="border-2 border-black">
                    <img
                      src={`data:image/png;base64,${images[selectedIndex]}`}
                      alt="Generated"
                      className="w-full block"
                    />
                  </div>
                )}
              </div>

              {/* Info Card - Caption */}
              {images.length > 0 && (
                <div className="border-2 border-black p-4 bg-white">
                  <p className="text-xs font-mono text-gray-800 leading-relaxed whitespace-pre-wrap">{caption}</p>
                </div>
              )}

              {/* Scattered callout */}
              {images.length > 0 && (
                <div className="absolute -right-32 top-20 w-40">
                  <div className="border-l-2 border-black pl-4">
                    <p className="text-xs font-mono text-gray-700">
                      <span className="font-bold">HYPER</span>
                      realistic photos
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Form */}
            <div className="col-span-5 sticky top-28">
              <div className="bg-white border-3 border-black p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-8 pb-6 border-b-2 border-black">
                  <h2 className="text-2xl font-black uppercase tracking-wider mb-1">GENERATE</h2>
                  <p className="text-xs text-gray-700 font-mono">AI FLEX GENERATOR</p>
                </div>

                <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />

                {/* Action Buttons */}
                {images.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = `data:image/png;base64,${images[selectedIndex]}`;
                        link.download = `flexbot-${selectedIndex + 1}.png`;
                        link.click();
                      }}
                      className="w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition"
                    >
                      ↓ DOWNLOAD
                    </button>
                    <button
                      onClick={async () => {
                        if (!navigator.share) {
                          alert('Web Share not supported');
                          return;
                        }
                        const binaryString = atob(images[selectedIndex]);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                          bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'image/png' });
                        const file = new File([blob], `flexbot-${selectedIndex + 1}.png`, {
                          type: 'image/png',
                        });
                        await navigator.share({ title: 'FlexBot', text: caption, files: [file] });
                      }}
                      className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-widest border-2 border-black hover:bg-gray-50 transition"
                    >
                      ⤴ SHARE
                    </button>
                  </div>
                )}

                {/* Stats Box */}
                <div className="mt-8 pt-6 border-t-2 border-black space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>OUTFITS</span>
                    <span className="font-bold">35+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SCENES</span>
                    <span className="font-bold">33+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POSES</span>
                    <span className="font-bold">38+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase">CONTACT</h2>
              <button onClick={() => setShowContact(false)} className="text-2xl font-bold hover:opacity-60">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase mb-1">EMAIL</p>
                <a href="mailto:contact@flexbot.com" className="text-sm text-blue-600 hover:underline font-mono">
                  contact@flexbot.com
                </a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1">DISCORD</p>
                <a href="https://discord.gg/flexbot" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-mono">
                  Join Discord →
                </a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1">GITHUB</p>
                <a href="https://github.com/darshytwan" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-mono">
                  @darshytwan
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
