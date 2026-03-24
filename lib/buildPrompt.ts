
export function buildPrompt(
  personName: string,
  outfit: string,
  sceneDesc: string,
  pose: string,
  photoNum: number,
  tattoosEnabled: boolean = false
): string {
  const tattooLine = tattoosEnabled
    ? `TATTOOS (MANDATORY): ${personName} has full sleeve tattoos covering BOTH arms completely from shoulder to wrist — dense intricate black-and-grey and color tattoo artwork covering every inch of both arms with no skin showing through, plus prominent neck tattoos covering the sides and back of the neck. Tattoos must be photorealistic with visible ink texture, shading, and detail. They must show on any exposed skin area in every photo.`
    : `No tattoos. Skin on arms and neck is clean and unmarked.`;

  return [
    `HYPER-PHOTOREALISTIC candid phone photo — photo ${photoNum} of 3 from the SAME shoot session. Must be completely indistinguishable from a real photo taken on an iPhone 15 Pro Max. NOT AI art, NOT a render, NOT a studio shot — a real candid street photo.`,

    `FULL BODY — MANDATORY AND NON-NEGOTIABLE: The subject's ENTIRE body must be visible from the very top of their head down to their shoes/feet. This is a full-body shot. The camera is positioned far enough back that head, torso, legs, and shoes are ALL fully in frame with no cropping of any body part. Feet and shoes are clearly visible at the bottom of the frame. Top of head is clearly visible at the top. This is NOT a portrait, NOT a waist-up shot, NOT a bust shot — it is a FULL BODY photo every single time.`,

    `CRITICAL SCENE LOCK — THIS IS NON-NEGOTIABLE: Photo ${photoNum} of 3. The background, every prop, every object, every light source, the camera distance, camera height, and camera angle are IDENTICAL across all 3 photos. ONLY the subject's body pose changes between photos. Do NOT move any background element, do NOT reposition any prop, do NOT change the lighting in any way, do NOT shift or rotate the camera. The scene must look like a continuous photoshoot in the exact same spot.`,

    `STYLE: RAW STREET PHOTO energy — gritty, unfiltered, authentic. Looks like someone nearby snapped it on their phone in the moment. Never clean editorial or studio. Think trap house, block corner, parking lot, hood authenticity. Candid and real.`,

    `PHONE PHOTO REALISM: Shot on iPhone 15 Pro Max. Vertical 4:5 portrait crop. FULL BODY head-to-toe — shoes visible at bottom, head at top, nothing cropped. Authentic phone camera characteristics — slight lens distortion at edges, natural chromatic aberration, real depth of field with background softly blurred, faint sensor grain in shadows, natural lens flare from bright light sources, slight motion blur on fast-moving elements. The perspective and crop must feel like a real person standing back and holding a phone to capture the full body.`,

    `Subject: ${personName} — 100% photorealistic accurate likeness: exact face structure, skin tone, hair texture, body type, all distinguishing physical features. Must be instantly recognizable as ${personName}. Render the face with complete accuracy — no idealization, no smoothing.`,

    `Outfit (IDENTICAL and UNCHANGED across all 3 photos): ${outfit}.`,

    `MANDATORY JEWELRY — ALWAYS VISIBLE IN EVERY PHOTO: a thick heavy diamond-encrusted Cuban link chain hanging on the chest with a large brilliant-cut diamond pendant. The chain must catch light with realistic diamond sparkle, individual chain links clearly defined, weight and drape realistic. This chain and pendant are visible in EVERY single photo regardless of pose or angle.`,

    tattooLine,

    `Action for THIS photo only (${photoNum}/3): ${pose}`,

    `Scene (LOCKED IDENTICAL in all 3 photos — do not alter anything): ${sceneDesc}.`,

    `ULTRA-REALISM DETAILS: fabric weave and stitching visible on all clothing, natural fabric wrinkles and creases from real body movement, skin pores and subtle stubble texture on face, individual chain links with realistic gold/diamond shine, watch crystal reflecting ambient light, leather grain visible on shoes and belts, individual $100 bill serial numbers faintly legible on outer bills, rubber band compression marks on cash bricks, natural weight sag on held items.`,

    `Cash bricks: real dense rubber-banded stacks — worn paper edges, compression marks, natural weight, bands tight. NOT fake prop money — photorealistic US currency.`,

    `All clothing graphics, brand logos, and text on clothing must be razor-sharp, perfectly legible, and correctly rendered — never blurred, smeared, or distorted.`,

    `CIGAR/CIGARETTE: If present — held naturally between index and middle fingers or in corner of mouth at realistic angle. Lit end glows orange-red realistically. All 5 fingers visible in natural grip. Thick volumetric white/grey smoke with realistic curl and drift.`,

    `ALCOHOL BOTTLES: Label must face camera directly, brand name fully readable, bottle shape accurate to real product.`,

    `GUNS: If present — must be a real, accurately rendered firearm. Correct proportions, accurate details, weight and grip realistic. Held with proper hand positioning and realistic grip tension. NOT a toy, NOT distorted.`,

    `PROHIBITIONS: No cropped body (feet and full legs MUST be visible), no portrait framing, no waist-up shots, no bust shots, no close-up framing — ALWAYS full body. No phone frame, no iPhone UI, no watermark, no text overlay, no cartoon style, no CGI sheen, no studio backdrop, no VHS filter, no date stamp, no extra fingers, no distorted hands, no floating objects, no elegant model posing, no studio lighting rigs.`,
  ].join(' ');
}

export interface BuildPromptInput {
  name: string;
  outfitKey?: string;
  sceneKey?: string;
  poseKey?: string;
  customOutfit?: string;
  customPose?: string;
  customPrompt?: string;
}

export interface PromptOutput {
  prompts: [string, string, string];
  caption: string;
}

export function buildPromptsForGeneration(
  name: string,
  outfit: string,
  sceneDesc: string,
  poses: [string, string, string],
  tattoosEnabled: boolean = false
): PromptOutput {
  const prompt1 = buildPrompt(name, outfit, sceneDesc, poses[0], 1, tattoosEnabled);
  const prompt2 = buildPrompt(name, outfit, sceneDesc, poses[1], 2, tattoosEnabled);
  const prompt3 = buildPrompt(name, outfit, sceneDesc, poses[2], 3, tattoosEnabled);

  const caption = `💰 **${name.toUpperCase()}** — PREMEDITATED FLEX\n\nThis is what it looks like when you move different. 🔥\n\n#PremeditatedMillionaire #WealthMindset #MoneyMoves`;

  return {
    prompts: [prompt1, prompt2, prompt3],
    caption,
  };
}
