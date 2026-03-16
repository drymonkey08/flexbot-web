# FlexBot Web App — Claude.md

## Project Overview
**FlexBot** is a Next.js web app that generates hyper-realistic AI photos of figures in various outfits, scenes, and poses. Users enter a figure name (e.g., "Albert Einstein") and can customize outfit/scene/pose. The app generates 3 images via Google Gemini API and allows download/share.

**Deployed on**: Vercel (https://flexbot-web.vercel.app)
**GitHub**: https://github.com/drymonkey08/flexbot-web
**Tech Stack**: Next.js 14, React 18, TypeScript, Tailwind CSS
**API**: Google Gemini (nano-banana-pro-preview model)
**Target**: iPhone PWA (save to home screen)

---

## Code Style & Patterns

### TypeScript
- **Strict mode enabled** — always use proper types
- No `any` types unless absolutely necessary
- Use interfaces for component props

### React/Components
- All components are client-side (`'use client'`) in app directory
- Use React hooks (`useState`, `useEffect`, `useRef`)
- Avoid unnecessary re-renders with proper dependency arrays
- Keep components focused and small

### Styling
- **Tailwind CSS only** — no CSS-in-JS or external UI libraries
- **Minimalist black/white aesthetic** inspired by premium product showcase designs
- Color scheme: black (#1a1a1a), white (#ffffff), tan/cream for accents
- All text must be **black or dark gray** (text-black or text-gray-800) — never light gray
- Use `border-2 border-black` for emphasis
- Buttons: bordered style with `hover:bg-black hover:text-white` transition

### API Routes
- Export `export const maxDuration = 300` for Vercel timeout (image generation takes time)
- Always validate input before calling Gemini
- Use `Promise.all()` for parallel API calls (3 images at once)
- Handle errors gracefully with user-friendly messages

---

## Architecture

### File Structure
```
flexbot-web/
├── app/
│   ├── page.tsx              # Main page (scattered product-showcase layout)
│   ├── layout.tsx            # Root layout + PWA meta tags
│   ├── globals.css           # Base styling (white bg, black scrollbar)
│   └── api/generate/route.ts # Gemini API endpoint
├── components/
│   ├── FlexForm.tsx          # Form inputs (name, outfit, scene, pose)
│   ├── FallingMoney.tsx      # Canvas animation (realistic $100 bills)
│   └── ImageGrid.tsx         # Legacy component (not currently used)
├── lib/
│   ├── data.ts               # OUTFITS (35+), SCENES (33+), POSES (38+)
│   └── buildPrompt.ts        # Prompt builder logic
├── public/
│   ├── manifest.json         # PWA config
│   └── icon.png              # App icon
├── Claude.md                 # This file
└── .env.local                # GEMINI_API_KEY (never commit)
```

### Key Components

**page.tsx** — Scattered product-showcase layout:
- Top: Bordered nav buttons (GENERATE, ABOUT US, CONTACT US) + icons
- Left: FB logo, vertical "FLEX" text, floating callouts
- Center: Large hero image display (3:4 aspect ratio)
- Right: Stats, callout text, floating info cards
- Bottom: Headline "Your Ultimate Flex Against the Ordinary" + CTA button
- Form opens as a **slide-over panel** from the right
- Mobile: Everything stacks vertically, thumbnails in 3-column grid
- Contact modal with email/Discord/GitHub links

**FlexForm.tsx** — Form with:
- Text input for figure name (placeholder: "Einstein, Curry...")
- Dropdowns for outfit/scene/pose (all with "Random" option)
- Advanced toggle for custom outfit/pose/prompt textareas
- Generate button showing progress
- All inputs: `border-2 border-black text-black bg-white font-medium`

**FallingMoney.tsx** — Canvas animation of realistic US $100 bills:
- **Pre-rendered** to offscreen canvases for performance (drawn once, stamped many times)
- **Front side**: Tan/cream paper, green border frame, "FEDERAL RESERVE NOTE", "THE UNITED STATES OF AMERICA", Benjamin Franklin portrait (head, balding hair, eyebrows, eyes with pupils, nose, mouth, lips, chin, collar), blue 3D security ribbon with micro "100" text, gold inkwell, gold watermark "100", serial numbers "LL 87901308 C", "L12" district, large "100" in corners
- **Back side**: Light green paper, "IN GOD WE TRUST", Independence Hall (steeple, arched door, two rows of windows, columns), "ONE HUNDRED DOLLARS", large gold "100" right, green "100" left
- **Physics**: 15 bills, gravity (0.015/frame), terminal velocity 2.8, side-to-side wobble/flutter, rotation with damping
- **z-index: z-0** (behind all content)
- Bills respawn at top when they fall off bottom

---

## Important Context

### Environment Variables
- `GEMINI_API_KEY` — Required for image generation
- Set in Vercel dashboard (Settings > Environment Variables), NOT committed to git
- If 403 Forbidden: key is invalid or expired

### Image Generation
- Calls Gemini API 3 times in parallel via `Promise.all()`
- ~30-45 seconds total generation time
- Returns base64-encoded PNG images
- Caption includes figure name + outfit/scene/pose details

### UI/UX Design Philosophy
- **Inspired by premium product showcase layouts** (scattered elements, asymmetric positioning)
- Large hero image as focal point — not a grid or sidebar layout
- Floating callouts with pointer lines
- Bordered nav buttons (not plain text links)
- Form is a slide-over panel, not embedded in main layout
- Year badge "2026" as decorative element
- Info cards positioned asymmetrically
- All text **must be black or near-black** — never use light grays (text-gray-400, text-gray-300, text-gray-500)
- Mobile-first: stacked layout on phone, scattered on desktop

### Design Evolution
The UI has gone through several iterations:
1. Dark luxury (gold on black) — retired
2. Light luxury (white with gold) — retired
3. Futuristic neon (cyan/magenta) — retired
4. White with blue/purple gradients — retired
5. **Current: Minimalist black/white product showcase** — active

Do NOT revert to any previous design. The current design is intentional.

---

## What NOT to Do

- Add colored gradient themes (blue/purple, gold, neon — all retired)
- Use external UI libraries (Shadcn, Material-UI, etc.)
- Commit `.env.local` or API keys
- Add features beyond what's requested
- Use light gray text colors (text-gray-300, text-gray-400, text-gray-500)
- Change the scattered layout back to a rigid grid
- Make major styling changes without showing the user first
- Modify `lib/data.ts` outfits/scenes/poses without explicit request
- Change the Gemini API call logic (it's optimized with Promise.all)
- Modify PWA meta tags in layout.tsx (iPhone functionality depends on them)
- Change the $100 bill rendering without a reference image

---

## What TO Do

- Keep it simple and functional
- Test responsive design (mobile-first)
- Show progress during generation (progress indicator)
- Handle errors gracefully (don't crash)
- Use semantic HTML
- Ensure ALL text is readable (black on white)
- Check `npm run build` compiles without errors before committing
- Remove unused imports/variables (TypeScript strict mode will catch these)
- Ask before making major design changes
- Commit with clear messages
- Test on iPhone Safari when possible

---

## Development Workflow

1. **Make code changes** locally
2. **Test**: `npm run dev` → http://localhost:3000
3. **Check build**: `npm run build` (must succeed with zero errors)
4. **Commit**: `git add -A && git commit -m "Clear message"`
5. **Push**: `git push` (auto-deploys to Vercel)
6. **Test on Vercel**: https://flexbot-web.vercel.app
7. **Test on iPhone**: Open in Safari, add to home screen

---

## Current Status (March 16, 2026)

### Working:
- Form inputs (name, outfit, scene, pose, custom prompt)
- Image generation via Gemini (3 images, parallel)
- Download/Share buttons (iOS Web Share API)
- Falling money animation (realistic $100 bills with Franklin portrait)
- Responsive layout (mobile + desktop)
- PWA ready (iPhone home screen)
- Contact modal
- Slide-over form panel

### Known Limitations:
- Generation takes 30-45 seconds (Gemini API speed)
- No user accounts/history (stateless)
- No image storage (generated on-demand)
- Canvas-drawn bills are approximations (not photorealistic)

### Potential Future Work:
- Make bills even more photorealistic (use actual bill images instead of canvas drawing)
- Add more outfits/scenes/poses
- Add user accounts / generation history
- Improve mobile UX further
- Add loading progress streaming (SSE)

---

## Commands

```bash
npm run dev      # Start local dev server
npm run build    # Build for production (MUST pass before pushing)
npm run start    # Start production server
npm run lint     # Check for errors
```
