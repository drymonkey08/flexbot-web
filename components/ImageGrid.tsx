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
        <h2 className="text-2xl font-bold text-gray-900">Your Flex Photos</h2>
      </div>

      <div className="space-y-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
              expandedIndex === index ? 'ring-2 ring-yellow-500' : 'hover:ring-2 hover:ring-yellow-500'
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
              <div className="absolute inset-0 bg-gray-900 bg-opacity-0 hover:bg-opacity-60 flex items-center justify-center gap-4 transition-all opacity-0 hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image, index);
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareImage(image, index);
                  }}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-lg transition-colors"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 text-yellow-400 px-3 py-1 rounded-full font-bold text-sm">
              {index + 1}/3
            </div>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <p className="text-gray-800 whitespace-pre-wrap text-sm">{caption}</p>
      </div>
    </div>
  );
}
