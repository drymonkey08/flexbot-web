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
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500 uppercase tracking-wider">FLEX RESULTS</h2>
      </div>

      <div className="space-y-4">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
              expandedIndex === index ? 'border-magenta-400 shadow-lg shadow-magenta-500/50' : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30'
            }`}
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            {/* Image Container */}
            <div className={`relative bg-black ${expandedIndex === index ? 'max-h-none' : 'max-h-96'}`}>
              <img
                src={`data:image/png;base64,${image}`}
                alt={`Flex photo ${index + 1}`}
                className="w-full h-auto"
              />

              {/* Overlay with buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-70 flex items-center justify-center gap-4 transition-all opacity-0 hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadImage(image, index);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-cyan-500/50"
                >
                  DOWNLOAD
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareImage(image, index);
                  }}
                  className="bg-gradient-to-r from-magenta-600 to-magenta-500 hover:from-magenta-500 hover:to-magenta-400 text-black font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-magenta-500/50"
                >
                  SHARE
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="absolute top-4 right-4 bg-black/80 border border-cyan-400 text-cyan-300 px-3 py-1 rounded-full font-mono font-bold text-sm">
              [{index + 1}/3]
            </div>
          </div>
        ))}
      </div>

      {/* Caption */}
      <div className="bg-black border-2 border-magenta-500/30 rounded-lg p-4 backdrop-blur">
        <p className="text-magenta-300 whitespace-pre-wrap text-sm font-mono">{caption}</p>
      </div>
    </div>
  );
}
