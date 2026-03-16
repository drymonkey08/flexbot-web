'use client';

import { useState } from 'react';

interface ImageGridProps {
  images: string[];
  caption: string;
}

export default function ImageGrid({ images, caption }: ImageGridProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const downloadImage = (base64: string, index: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `flexbot-${index + 1}.png`;
    link.click();
  };

  const shareImage = async (base64: string, index: number) => {
    if (!navigator.share) {
      alert('Web Share API not supported on this device');
      return;
    }

    try {
      // Convert base64 to blob
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/png' });

      const file = new File([blob], `flexbot-${index + 1}.png`, { type: 'image/png' });

      await navigator.share({
        title: 'FlexBot',
        text: caption,
        files: [file],
      });
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-wider">FLEX RESULTS</h2>
      </div>

      <div className="space-y-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
              expandedIndex === index ? 'border-purple-500 shadow-lg shadow-purple-300/50' : 'border-blue-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-300/50'
            }`}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            {/* Image Container */}
            <div className={`relative bg-gray-100 ${expandedIndex === index ? 'max-h-none' : 'max-h-96'}`}>
              <img
                src={`data:image/png;base64,${image}`}
                alt={`Flex photo ${index + 1}`}
                className="w-full h-auto"
              />

              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 flex items-center justify-center gap-4 transition-all opacity-0 hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image, index);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-blue-400/50"
                >
                  DOWNLOAD
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareImage(image, index);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-purple-400/50"
                >
                  SHARE
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-white/80 border-2 border-blue-400 text-blue-700 px-3 py-1 rounded-full font-mono font-bold text-sm">
              [{index + 1}/3]
            </div>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="bg-white/80 border-2 border-purple-300 rounded-lg p-4 backdrop-blur">
        <p className="text-gray-800 whitespace-pre-wrap text-sm font-mono">{caption}</p>
      </div>
    </div>
  );
}
