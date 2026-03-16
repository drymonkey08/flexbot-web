import { NextRequest, NextResponse } from 'next/server';
import { OUTFITS, SCENES, POSES, getRandomOutfit, getRandomScene, getRandomPoses } from '@/lib/data';
import { buildPromptsForGeneration } from '@/lib/buildPrompt';

export const maxDuration = 300;

interface GenerateRequest {
  name: string;
  outfitKey?: string;
  sceneKey?: string;
  poseKey?: string;
  customOutfit?: string;
  customPose?: string;
  customPrompt?: string;
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

    const { name, outfitKey, sceneKey, poseKey, customOutfit, customPose } = body;

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

    // Resolve outfit
    if (customOutfit) {
      outfit = customOutfit;
    } else if (outfitKey && OUTFITS[outfitKey]) {
      outfit = OUTFITS[outfitKey];
    } else {
      outfit = getRandomOutfit();
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
    const { prompts, caption } = buildPromptsForGeneration(name, outfit, sceneDesc, poses);

    // Generate all 3 images
    const images: string[] = [];

    try {
      console.log('Generating image 1/3...');
      const img1 = await callGemini(prompts[0], apiKey);
      images.push(img1);

      console.log('Generating image 2/3...');
      const img2 = await callGemini(prompts[1], apiKey);
      images.push(img2);

      console.log('Generating image 3/3...');
      const img3 = await callGemini(prompts[2], apiKey);
      images.push(img3);
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
