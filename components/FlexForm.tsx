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
        <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          FIGURE NAME
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Albert Einstein, Putin, Steph Curry..."
          required
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all"
        />
      </div>

      {/* Outfit Select */}
      <div>
        <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
          OUTFIT CHOICE
        </label>
        <select
          value={outfitKey}
          onChange={(e) => setOutfitKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-purple-300 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all"
        >
          <option value="">RANDOM</option>
          {Object.entries(OUTFITS).map(([key, _]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Scene Select */}
      <div>
        <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          SCENE ENVIRONMENT
        </label>
        <select
          value={sceneKey}
          onChange={(e) => setSceneKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-blue-300 text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all"
        >
          <option value="">RANDOM</option>
          {Object.entries(SCENES).map(([key, _]) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Pose Select */}
      <div>
        <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
          POSE ACTION
        </label>
        <select
          value={poseKey}
          onChange={(e) => setPoseKey(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-50 border-2 border-purple-300 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all"
        >
          <option value="">RANDOM</option>
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
          className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-wider"
        >
          {showAdvanced ? '▼ ADVANCED MODE' : '▶ ADVANCED MODE'}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 bg-blue-50/50 p-4 rounded-lg border-2 border-blue-300 backdrop-blur">
          <div>
            <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              Custom Outfit
            </label>
            <textarea
              value={customOutfit}
              onChange={(e) => setCustomOutfit(e.target.value)}
              placeholder="Describe your own outfit in detail..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              Custom Pose
            </label>
            <textarea
              value={customPose}
              onChange={(e) => setCustomPose(e.target.value)}
              placeholder="Describe your own pose in detail..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-purple-300 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-300/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              Full Custom Prompt
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Write a full custom prompt — bypasses all dropdowns..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-white border-2 border-blue-300 text-gray-900 placeholder-gray-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all"
            />
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg disabled:from-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:cursor-not-allowed transition-all duration-300 uppercase tracking-wider shadow-lg shadow-purple-300/50 hover:shadow-purple-400/70"
      >
        {isLoading ? `⚡ GENERATING ${progress}/3...` : '🚀 INITIATE FLEX PROTOCOL'}
      </button>
    </form>
  );
}
