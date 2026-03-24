import { NextRequest, NextResponse } from 'next/server';
import { OUTFITS, SCENES, POSES, PANTS, SHOES, getRandomOutfit, getRandomScene, getRandomPoses } from '@/lib/data';
import { buildPromptsForGeneration } from '@/lib/buildPrompt';

export const maxDuration = 300;

interface GenerateRequest {
  name: string;
  outfitKey?: string;
  sceneKey?: string;
  poseKey?: string;
  pantsKey?: string;
  shoesKey?: string;
  customOutfit?: string;
  customPose?: string;
  customPrompt?: string;
  chainEnabled?: boolean;
  tattoosEnabled?: boolean;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Extract base64 image from response
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const parts = data.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
  }

  throw new Error('No image data in Gemini response');
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    const { name, outfitKey, sceneKey, poseKey, pantsKey, shoesKey, customOutfit, customPose, chainEnabled = true, tattoosEnabled = false } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    let outfit: string;
    let scene: { scene: string; light: string };
    let poses: [string, string, string];

    // Resolve base outfit (top/shirt)
    if (customOutfit) {
      outfit = customOutfit;
    } else if (outfitKey && OUTFITS[outfitKey]) {
      outfit = OUTFITS[outfitKey];
    } else {
      outfit = getRandomOutfit();
    }

    // Only override pants/shoes if the user explicitly selected them.
    // Each outfit already has pants and shoes built into its description —
    // appending random ones would conflict and confuse the AI.
    if (pantsKey && PANTS[pantsKey]) {
      outfit += `. PANTS OVERRIDE — ignore any pants mentioned above, use ONLY these instead: ${PANTS[pantsKey]}`;
    }
    if (shoesKey && SHOES[shoesKey]) {
      outfit += `. SHOES OVERRIDE — ignore any shoes mentioned above, use ONLY these instead: ${SHOES[shoesKey]}`;
    }

    // Resolve scene
    if (sceneKey && SCENES[sceneKey]) {
      scene = SCENES[sceneKey];
    } else {
      scene = getRandomScene();
    }

    // Resolve poses
    if (customPose) {
      poses = [customPose, customPose, customPose];
    } else if (poseKey && POSES[poseKey]) {
      poses = [POSES[poseKey], POSES[poseKey], POSES[poseKey]];
    } else {
      const randomPoses = getRandomPoses(3);
      poses = [randomPoses[0], randomPoses[1], randomPoses[2]];
    }

    // Build the scene description
    const sceneDesc = `${scene.scene}, ${scene.light}`;

    // Build prompts
    const { prompts, caption } = buildPromptsForGeneration(name, outfit, sceneDesc, poses, chainEnabled, tattoosEnabled);

    // Generate all 3 images in parallel (much faster!)
    let images: string[] = [];
    try {
      console.log('Generating 3 images in parallel...');
      const [img1, img2, img3] = await Promise.all([
        callGemini(prompts[0], apiKey),
        callGemini(prompts[1], apiKey),
        callGemini(prompts[2], apiKey),
      ]);
      images = [img1, img2, img3];
      console.log('All 3 images generated successfully');
    } catch (error) {
      console.error('Error generating images:', error);
      return NextResponse.json(
        { error: 'Failed to generate images from Gemini API' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      images,
      caption,
      outfitUsed: outfit.substring(0, 100),
      sceneUsed: scene.scene,
      posesUsed: poses,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
