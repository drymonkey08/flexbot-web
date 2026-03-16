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
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-yellow-500">FLEXBOT</h1>
            <p className="text-gray-400 mt-2">Premeditated Millionaire</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-yellow-500 mb-6">Generate Your Flex</h2>
              <FlexForm onGenerate={handleGenerate} isLoading={isLoading} progress={progress} />
            </div>
          </div>

          {/* Results Section */}
          <div>
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {isLoading && !images.length && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-lg text-gray-300">Generating your flex photos...</p>
                <p className="text-sm text-gray-500 mt-2">{progress}/3</p>
              </div>
            )}

            {images.length > 0 && <ImageGrid images={images} caption={caption} />}

            {!isLoading && !images.length && !error && (
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-400">Your generated flex photos will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2026 FlexBot. This is what it looks like when you move different. 🔥</p>
        </div>
      </footer>
    </main>
  );
}
