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

  const selectClass =
    'w-full px-4 py-3 text-sm bg-surface-light border border-surface-lighter rounded-xl text-white font-medium focus:border-accent focus:ring-1 focus:ring-accent appearance-none cursor-pointer';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Who&apos;s Flexing?</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Steph Curry, Einstein..."
          required
          className="w-full px-4 py-3 text-sm bg-surface-light border border-surface-lighter rounded-xl text-white placeholder-gray-500 font-medium focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className={labelClass}>Outfit</label>
        <select value={outfitKey} onChange={(e) => setOutfitKey(e.target.value)} className={selectClass}>
          <option value="">Random</option>
          {Object.keys(OUTFITS).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Scene</label>
        <select value={sceneKey} onChange={(e) => setSceneKey(e.target.value)} className={selectClass}>
          <option value="">Random</option>
          {Object.keys(SCENES).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Pose</label>
        <select value={poseKey} onChange={(e) => setPoseKey(e.target.value)} className={selectClass}>
          <option value="">Random</option>
          {Object.keys(POSES).map((key) => (
            <option key={key} value={key}>
              {key.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition"
      >
        {showAdvanced ? '▾' : '▸'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-3 p-4 bg-surface rounded-xl border border-surface-lighter">
          <textarea
            value={customOutfit}
            onChange={(e) => setCustomOutfit(e.target.value)}
            placeholder="Custom outfit description..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-surface-light border border-surface-lighter rounded-lg text-white placeholder-gray-500 resize-none"
          />
          <textarea
            value={customPose}
            onChange={(e) => setCustomPose(e.target.value)}
            placeholder="Custom pose description..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-surface-light border border-surface-lighter rounded-lg text-white placeholder-gray-500 resize-none"
          />
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Full custom prompt override..."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-surface-light border border-surface-lighter rounded-lg text-white placeholder-gray-500 resize-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full py-4 bg-accent text-white text-sm font-bold uppercase tracking-widest rounded-xl disabled:bg-surface-lighter disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-accent-dark transition-all active:scale-[0.98]"
      >
        {isLoading ? `Generating... ${progress}/3` : 'Generate Flex'}
      </button>
    </form>
  );
}
