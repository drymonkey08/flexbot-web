
export function buildPrompt(
  personName: string,
  outfit: string,
  sceneDesc: string,
  pose: string,
  photoNum: number
): string {
  return [
    `HYPER-PHOTOREALISTIC AI-generated candid photo — photo ${photoNum} of 3 from the same session, completely indistinguishable from a real iPhone photograph.`,
    `CRITICAL: Part of a 3-photo set taken in the EXACT SAME LOCATION without moving. Background, lighting, camera angle, and distance are IDENTICAL across all 3 — only the pose changes.`,
    `STYLE: This is a RAW STREET PHOTO, NOT an elegant portrait or studio photoshoot. It must look like a real candid photo someone took on their phone in the moment — gritty, authentic, unposed energy. Never clean, polished, or editorial. Think trap house, block, hood, parking lot energy.`,
    `Subject: ${personName} — rendered with 100% accurate likeness: exact face structure, skin tone, hair texture, body type, any known tattoos or distinguishing physical features. Must be instantly recognizable as ${personName}.`,
    `Outfit (IDENTICAL in all 3 photos, do not change): ${outfit}.`,
    `MANDATORY JEWELRY (always visible): heavy diamond-encrusted Cuban link chain with a large diamond pendant hanging on chest, catching light with realistic sparkle. This chain and pendant must be visible in EVERY photo.`,
    `Action for THIS photo only: ${pose}`,
    `Scene (IDENTICAL in all 3 photos): ${sceneDesc}.`,
    `Camera: shot on iPhone 15 Pro Max, vertical 4:5 portrait crop, full body head-to-toe visible in frame, medium distance shot, natural bokeh depth of field, slight natural sensor grain.`,
    `ULTRA-REALISM REQUIREMENTS: fabric weave and stitching visible on clothing, natural wrinkles and creases in garments, skin pores and stubble texture on face, leather grain on shoes, individual $100 bill faces legible, metal chain links with realistic shine and weight, watch crystal reflecting light.`,
    `Cash must look like real dense rubber-banded brick stacks — worn paper edges, compression marks, natural weight sag, serial numbers faintly legible on outer bills, bands tight.`,
    `All graphics and logos on clothing must be razor sharp, perfectly legible, and correctly rendered — not blurred, smeared, or distorted.`,
    `CIGAR/CIGARETTE RULES: If a cigar or cigarette is present, it MUST be held naturally between the index and middle fingers in a realistic grip, or placed naturally in the corner of the mouth at a realistic angle. The lit end must glow with a realistic orange-red ember. NEVER place a cigar/cigarette floating near the face, clipping through fingers, sticking out of a fist, or in any physically impossible position. The hand holding it must have all 5 fingers visible in a natural relaxed grip.`,
    `If smoke is present — render thick volumetric white and grey smoke with realistic physical curl, wisps drifting, and a vivid orange-red ember glow at the burning tip.`,
    `ALCOHOL BOTTLE RULES: Any alcohol bottles (Hennessy, Jack Daniels, Don Julio, Patron, Ace of Spades, etc.) MUST have their label facing directly toward the camera so the brand name, logo, and all text on the label are fully readable, sharp, and clearly visible. The bottle shape, color, and label design must be accurate to the real product.`,
    `Background scene must be fully rendered with depth — all props, clutter, and background elements visible and photorealistic.`,
    `DO NOT INCLUDE: phone frame, iPhone UI, app overlay, watermark, text overlay on image, cartoon or illustrated style, CGI sheen, studio plain backdrop, VHS filter, date stamp, extra fingers, distorted hands, elegant posing, model-like expressions, studio lighting setups.`,
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
  poses: [string, string, string]
): PromptOutput {
  const prompt1 = buildPrompt(name, outfit, sceneDesc, poses[0], 1);
  const prompt2 = buildPrompt(name, outfit, sceneDesc, poses[1], 2);
  const prompt3 = buildPrompt(name, outfit, sceneDesc, poses[2], 3);

  const caption = `💰 **${name.toUpperCase()}** — PREMEDITATED FLEX\n\nThis is what it looks like when you move different. 🔥\n\n#PremeditatedMillionaire #WealthMindset #MoneyMoves`;

  return {
    prompts: [prompt1, prompt2, prompt3],
    caption,
  };
}
