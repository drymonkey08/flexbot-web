'use client';

import { useState } from 'react';
import FlexForm from '@/components/FlexForm';
import ImageGrid from '@/components/ImageGrid';

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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900">FLEXBOT</h1>
            <p className="text-sm text-gray-600">Premeditated Millionaire</p>
          </div>
          <div className="flex gap-6 text-sm font-medium text-gray-700">
            <button className="hover:text-yellow-600 transition">ABOUT</button>
            <button className="hover:text-yellow-600 transition">CONTACT</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Headline & Form */}
          <div>
            <h2 className="text-5xl font-black text-gray-900 leading-tight mb-4">
              This Is What <span className="text-yellow-600">Moving Different</span> Looks Like
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Generate 3 hyper-realistic AI photos of any famous figure in custom outfits, scenes, and poses. No limits. Pure flex.
            </p>

            {/* Form Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />
            </div>
          </div>

          {/* Right: Hero Image or Results */}
          <div className="relative">
            {!images.length && !isLoading && !error && (
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl h-96 flex items-center justify-center border border-yellow-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <p className="text-gray-600 font-medium">Your flex photos will appear here</p>
                </div>
              </div>
            )}

            {isLoading && !images.length && (
              <div className="bg-white rounded-2xl h-96 flex flex-col items-center justify-center border border-gray-200">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-yellow-600 mb-4"></div>
                <p className="text-lg font-medium text-gray-900">Generating your flex</p>
                <p className="text-sm text-gray-500 mt-2">{progress}/3 photos</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <ImageGrid images={images} caption={caption} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="text-3xl font-black text-yellow-600 mb-2">25+</div>
            <p className="text-gray-700 font-semibold">Designer Outfits</p>
            <p className="text-sm text-gray-500 mt-1">Luxury to street wear</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="text-3xl font-black text-yellow-600 mb-2">24+</div>
            <p className="text-gray-700 font-semibold">Iconic Scenes</p>
            <p className="text-sm text-gray-500 mt-1">From penthouse to yacht</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="text-3xl font-black text-yellow-600 mb-2">30+</div>
            <p className="text-gray-700 font-semibold">Dynamic Poses</p>
            <p className="text-sm text-gray-500 mt-1">Cash, flex, confidence</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>© 2026 FlexBot. This is what it looks like when you move different. 🔥</p>
        </div>
      </footer>
    </main>
  );
}
