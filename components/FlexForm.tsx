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
      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-black">Figure Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Einstein, Curry..."
          required
          className="w-full px-4 py-3 text-sm bg-white border-2 border-black text-black placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-black">Outfit</label>
        <select
          value={outfitKey}
          onChange={(e) => setOutfitKey(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-white border-2 border-black text-black font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 appearance-none cursor-pointer"
        >
          <option value="" className="text-black">Random</option>
          {Object.entries(OUTFITS).map(([key]) => (
            <option key={key} value={key} className="text-black">
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-black">Scene</label>
        <select
          value={sceneKey}
          onChange={(e) => setSceneKey(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-white border-2 border-black text-black font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 appearance-none cursor-pointer"
        >
          <option value="" className="text-black">Random</option>
          {Object.entries(SCENES).map(([key]) => (
            <option key={key} value={key} className="text-black">
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase mb-2 text-black">Pose</label>
        <select
          value={poseKey}
          onChange={(e) => setPoseKey(e.target.value)}
          className="w-full px-4 py-3 text-sm bg-white border-2 border-black text-black font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 appearance-none cursor-pointer"
        >
          <option value="" className="text-black">Random</option>
          {Object.entries(POSES).map(([key]) => (
            <option key={key} value={key} className="text-black">
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold uppercase tracking-widest text-black hover:opacity-60 transition"
        >
          {showAdvanced ? '▼' : '▶'} Advanced
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-gray-100 border-2 border-black">
          <textarea
            value={customOutfit}
            onChange={(e) => setCustomOutfit(e.target.value)}
            placeholder="Custom outfit..."
            rows={2}
            className="w-full px-3 py-2 text-sm border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none resize-none font-medium"
          />
          <textarea
            value={customPose}
            onChange={(e) => setCustomPose(e.target.value)}
            placeholder="Custom pose..."
            rows={2}
            className="w-full px-3 py-2 text-sm border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none resize-none font-medium"
          />
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Full custom prompt..."
            rows={3}
            className="w-full px-3 py-2 text-sm border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none resize-none font-medium"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full py-3 bg-black text-white text-xs font-black uppercase tracking-widest disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-900 transition border-2 border-black"
      >
        {isLoading ? `⚡ Generating ${progress}/3` : '⚡ Generate'}
      </button>
    </form>
  );
}
