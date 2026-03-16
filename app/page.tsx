'use client';

import { useState } from 'react';
import FlexForm from '@/components/FlexForm';
import FallingMoney from '@/components/FallingMoney';

interface GenerateResponse {
  images: string[];
  caption: string;
  outfitUsed?: string;
  sceneUsed?: string;
  posesUsed?: string[];
}

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
    setError('');
    setProgress(0);
    setImages([]);
    setCaption('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate images');
      }

      const result: GenerateResponse = await response.json();
      setImages(result.images);
      setCaption(result.caption);
      setProgress(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 relative">
      <FallingMoney />

      {/* Top Navigation */}
      <nav className="bg-white border-b border-black sticky top-0 z-40">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex gap-6">
            <button className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition">CATALOG</button>
            <button className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition">ABOUT US</button>
            <button onClick={() => setShowContact(!showContact)} className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition">CONTACT US</button>
          </div>
          <div className="flex gap-4 text-lg">
            <button className="hover:opacity-70 transition">♡</button>
            <button className="hover:opacity-70 transition">🛒</button>
            <button className="hover:opacity-70 transition">👤</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Navigation Dots & Thumbnails */}
        <div className="w-24 bg-white border-r border-black p-4 flex flex-col items-center gap-6">
          <div className="text-sm font-bold text-black">FLEXBOT</div>

          {/* Navigation dots */}
          <div className="flex flex-col gap-4">
            <button className="w-3 h-3 bg-black rounded-full hover:opacity-70 transition" />
            <button className="w-3 h-3 bg-gray-300 rounded-full hover:opacity-70 transition" />
            <button className="w-3 h-3 bg-gray-300 rounded-full hover:opacity-70 transition" />
          </div>

          {/* Image thumbnails */}
          {images.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-full aspect-square border-2 transition ${selectedImageIndex === idx ? 'border-black' : 'border-gray-300'}`}
                >
                  <img src={`data:image/png;base64,${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center - Large Image Display */}
        <div className="flex-1 bg-white border-r border-black flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
          {!images.length && !isLoading && !error && (
            <div className="text-center">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-sm uppercase tracking-widest font-mono mb-2">AWAITING GENERATION</p>
              <p className="text-xs text-gray-600">Enter figure name and generate</p>
            </div>
          )}

          {isLoading && !images.length && (
            <div className="text-center">
              <div className="text-4xl mb-4 animate-spin">⚡</div>
              <p className="text-sm uppercase tracking-widest font-mono">GENERATING [{progress}/3]</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-sm text-red-600 font-mono">⚠️ {error}</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="w-full max-w-2xl">
              <img
                src={`data:image/png;base64,${images[selectedImageIndex]}`}
                alt="Generated flex photo"
                className="w-full border-2 border-black"
              />
              <div className="mt-4 p-4 bg-gray-50 border-2 border-black">
                <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{caption}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Form */}
        <div className="w-80 bg-white border-l border-black p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="mb-6">
            <h2 className="text-xl font-black uppercase tracking-wider mb-1">FLEXBOT</h2>
            <p className="text-xs text-gray-600 font-mono">AI FLEX GENERATOR</p>
          </div>

          <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />

          {/* Action Buttons */}
          {images.length > 0 && (
            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:image/png;base64,${images[selectedImageIndex]}`;
                  link.download = `flexbot-${selectedImageIndex + 1}.png`;
                  link.click();
                }}
                className="w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition border border-black"
              >
                DOWNLOAD
              </button>
              <button
                onClick={async () => {
                  if (!navigator.share) {
                    alert('Web Share API not supported');
                    return;
                  }
                  const binaryString = atob(images[selectedImageIndex]);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const blob = new Blob([bytes], { type: 'image/png' });
                  const file = new File([blob], `flexbot-${selectedImageIndex + 1}.png`, { type: 'image/png' });
                  await navigator.share({ title: 'FlexBot', text: caption, files: [file] });
                }}
                className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition border-2 border-black"
              >
                SHARE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 border-2 border-black shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black uppercase tracking-wider">CONTACT</h2>
              <button onClick={() => setShowContact(false)} className="text-2xl font-bold hover:opacity-70">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold uppercase mb-1">EMAIL</p>
                <a href="mailto:contact@flexbot.com" className="text-sm text-blue-600 hover:underline font-mono">contact@flexbot.com</a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1">DISCORD</p>
                <a href="https://discord.gg/flexbot" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-mono">Join Discord Server →</a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1">TWITTER</p>
                <a href="https://twitter.com/flexbot" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-mono">@flexbot</a>
              </div>
              <div>
                <p className="text-xs font-bold uppercase mb-1">GITHUB</p>
                <a href="https://github.com/darshytwan" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-mono">@darshytwan</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
