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
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Figure
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Albert Einstein, Putin, Steph Curry..."
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
        />
      </div>

      {/* Outfit Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Outfit
        </label>
        <select
          value={outfitKey}
          onChange={(e) => setOutfitKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
        >
          <option value="">Random</option>
          {Object.entries(OUTFITS).map(([key, _]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Scene Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Scene
        </label>
        <select
          value={sceneKey}
          onChange={(e) => setSceneKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
        >
          <option value="">Random</option>
          {Object.entries(SCENES).map(([key, _]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Pose Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Pose
        </label>
        <select
          value={poseKey}
          onChange={(e) => setPoseKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
        >
          <option value="">Random</option>
          {Object.entries(POSES).map(([key, _]) => (
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
          className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
        >
          {showAdvanced ? '▼ Advanced' : '▶ Advanced'}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 bg-gray-100 p-4 rounded-lg border border-gray-300">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Custom Outfit
            </label>
            <textarea
              value={customOutfit}
              onChange={(e) => setCustomOutfit(e.target.value)}
              placeholder="Describe your own outfit in detail..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Custom Pose
            </label>
            <textarea
              value={customPose}
              onChange={(e) => setCustomPose(e.target.value)}
              placeholder="Describe your own pose in detail..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Full Custom Prompt
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Write a full custom prompt — bypasses all dropdowns..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-30"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full px-6 py-4 rounded-lg bg-yellow-600 text-white font-bold text-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? `Generating ${progress}/3...` : 'Generate 3 Flex Photos'}
      </button>
    </form>
  );
}
