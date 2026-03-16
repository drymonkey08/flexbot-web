'use client';

import { useState } from 'react';
import { OUTFITS, SCENES, POSES } from '@/lib/data';

interface FlexFormProps {
  onGenerate: (data: {
    name: string;
    outfitKey?: string;
    sceneKey?: string;
    poseKey?: string;
    customOutfit?: string;
    customPose?: string;
    customPrompt?: string;
  }) => Promise<void>;
  isLoading: boolean;
  progress: number;
}

export default function FlexForm({ onGenerate, isLoading, progress }: FlexFormProps) {
  const [name, setName] = useState('');
  const [outfitKey, setOutfitKey] = useState('');
  const [sceneKey, setSceneKey] = useState('');
  const [poseKey, setPoseKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customOutfit, setCustomOutfit] = useState('');
  const [customPose, setCustomPose] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onGenerate({
      name: name.trim(),
      outfitKey: outfitKey || undefined,
      sceneKey: sceneKey || undefined,
      poseKey: poseKey || undefined,
      customOutfit: customOutfit || undefined,
      customPose: customPose || undefined,
      customPrompt: customPrompt || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Figure / Name Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          FIGURE NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Albert Einstein, Steph Curry..."
          required
          className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black transition-all"
        />
      </div>

      {/* Outfit Select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          OUTFIT
        </label>
        <select
          value={outfitKey}
          onChange={(e) => setOutfitKey(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
        >
          <option value="">RANDOM</option>
          {Object.entries(OUTFITS).map(([key]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Scene Select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          SCENE
        </label>
        <select
          value={sceneKey}
          onChange={(e) => setSceneKey(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
        >
          <option value="">RANDOM</option>
          {Object.entries(SCENES).map(([key]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Pose Select */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider mb-2">
          POSE
        </label>
        <select
          value={poseKey}
          onChange={(e) => setPoseKey(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black focus:outline-none focus:ring-1 focus:ring-black transition-all"
        >
          <option value="">RANDOM</option>
          {Object.entries(POSES).map(([key]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Advanced Toggle */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition"
        >
          {showAdvanced ? '▼ ADVANCED' : '▶ ADVANCED'}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-50 border-2 border-black">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Custom Outfit
            </label>
            <textarea
              value={customOutfit}
              onChange={(e) => setCustomOutfit(e.target.value)}
              placeholder="Describe outfit..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Custom Pose
            </label>
            <textarea
              value={customPose}
              onChange={(e) => setCustomPose(e.target.value)}
              placeholder="Describe pose..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">
              Full Custom Prompt
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Custom prompt..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-white border-2 border-black text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full py-3 bg-black text-white text-xs font-bold uppercase tracking-widest disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition border-2 border-black"
      >
        {isLoading ? `GENERATING ${progress}/3` : '⚡ GENERATE'}
      </button>
    </form>
  );
}
