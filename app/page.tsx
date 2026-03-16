'use client';

import { useState } from 'react';
import FlexForm from '@/components/FlexForm';
import ImageGrid from '@/components/ImageGrid';
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
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Falling money animation */}
      <FallingMoney />

      {/* Animated gradient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none" />

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">FLEXBOT</h1>
            <p className="text-xs text-gray-600 font-bold tracking-wider">PREMEDITATED MILLIONAIRE</p>
          </div>
          <div className="flex gap-6 text-sm font-bold text-gray-700 uppercase">
            <button className="hover:text-purple-600 transition duration-300">SYSTEM</button>
            <button className="hover:text-purple-600 transition duration-300">CONTACT</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & Form */}
          <div className="relative z-10">
            <h2 className="text-6xl font-black leading-tight mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                THIS IS WHAT
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600">
                MOVING DIFFERENT
              </span>
              <br />
              <span className="text-purple-700">LOOKS LIKE</span>
            </h2>
            <p className="text-lg text-gray-700 mb-8 font-medium leading-relaxed">
              Enter the FlexBot realm. Generate 3 hyper-realistic AI photos across any scenario. Zero limits. Pure flex energy. 🚀
            </p>

            {/* Form Card */}
            <div className="bg-white/80 border-2 border-blue-200 rounded-xl p-8 backdrop-blur hover:border-purple-300 transition-all duration-300 shadow-lg shadow-purple-200/30">
              <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />
            </div>
          </div>

          {/* Right: Hero Image or Results */}
          <div className="relative z-10">
            {!images.length && !isLoading && !error && (
              <div className="bg-gradient-to-br from-blue-100/50 to-purple-100/50 border-2 border-dashed border-purple-400 rounded-xl h-96 flex items-center justify-center backdrop-blur">
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-pulse">💰</div>
                  <p className="text-purple-700 font-bold text-lg">AWAITING FLEX GENERATION</p>
                  <p className="text-purple-500/60 text-sm mt-2">Results will materialize here</p>
                </div>
              </div>
            )}

            {isLoading && !images.length && (
              <div className="bg-white/50 rounded-xl h-96 flex flex-col items-center justify-center border-2 border-blue-300 backdrop-blur">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin" style={{opacity: 0.7}} />
                  <div className="absolute inset-2 bg-white rounded-full" />
                </div>
                <p className="text-blue-600 font-bold text-lg">GENERATING FLEX</p>
                <p className="text-purple-600 text-sm mt-2 font-mono">[{progress}/3]</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 backdrop-blur">
                <p className="text-red-700 font-medium">⚠️ ERROR: {error}</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="bg-white/80 rounded-xl p-6 border-2 border-purple-300 backdrop-blur shadow-lg shadow-purple-200/30">
                <ImageGrid images={images} caption={caption} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 rounded-lg p-8 border-2 border-blue-300 backdrop-blur hover:border-blue-500 transition-all duration-300 group shadow-lg shadow-blue-200/30 hover:shadow-blue-300/50">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 mb-2 group-hover:drop-shadow-lg">35+</div>
            <p className="text-blue-700 font-bold text-lg">OUTFITS</p>
            <p className="text-blue-600/70 text-sm mt-2">Luxury to cyberpunk</p>
          </div>
          <div className="bg-white/70 rounded-lg p-8 border-2 border-purple-300 backdrop-blur hover:border-purple-500 transition-all duration-300 group shadow-lg shadow-purple-200/30 hover:shadow-purple-300/50">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-500 mb-2 group-hover:drop-shadow-lg">33+</div>
            <p className="text-purple-700 font-bold text-lg">SCENES</p>
            <p className="text-purple-600/70 text-sm mt-2">Luxury to everyday</p>
          </div>
          <div className="bg-white/70 rounded-lg p-8 border-2 border-blue-300 backdrop-blur hover:border-blue-500 transition-all duration-300 group shadow-lg shadow-blue-200/30 hover:shadow-blue-300/50">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 mb-2 group-hover:drop-shadow-lg">38+</div>
            <p className="text-blue-700 font-bold text-lg">POSES</p>
            <p className="text-blue-600/70 text-sm mt-2">Flex in any moment</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur border-t border-gray-200 mt-20 py-8 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm font-mono">© 2026 FLEXBOT | THIS IS WHAT IT LOOKS LIKE WHEN YOU MOVE DIFFERENT 🚀</p>
        </div>
      </footer>
    </main>
  );
}
