# FlexBot Web App — Claude.md

## Project Overview
**FlexBot** is a Next.js web app that generates hyper-realistic AI photos of figures in various outfits, scenes, and poses. Users enter a figure name (e.g., "Albert Einstein") and can customize outfit/scene/pose. The app generates 3 images via Google Gemini API and allows download/share.

**Deployed on**: Vercel
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
- **Tailwind CSS only** — no CSS-in-JS or external libraries
- Focus on: black borders, white/gray backgrounds, minimal aesthetics
- Current color scheme: black (#1a1a1a), white (#ffffff), gray (#f5f5f5)
- NO blue/purple gradients (old theme)
- Use `border-2 border-black` for emphasis

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
│   ├── page.tsx              # Main page (3-column layout)
│   ├── layout.tsx            # Root layout + PWA meta tags
│   ├── globals.css           # Base styling
│   └── api/generate/route.ts # Gemini API endpoint
├── components/
│   ├── FlexForm.tsx          # Form inputs (name, outfit, scene, pose)
│   └── FallingMoney.tsx      # Canvas animation ($100 bills)
├── lib/
│   ├── data.ts               # OUTFITS, SCENES, POSES objects
│   └── buildPrompt.ts        # Prompt builder logic
├── public/
│   ├── manifest.json         # PWA config
│   └── icon.png             # App icon
└── .env.local               # GEMINI_API_KEY (never commit)
```

### Key Components

**page.tsx** — 3-column layout:
- Left: Navigation dots + image thumbnails
- Center: Large image display + info cards
- Right: Form panel + action buttons

**FlexForm.tsx** — Form with:
- Text input for figure name
- Dropdowns for outfit/scene/pose (all with "Random" option)
- Advanced toggle for custom outfit/pose/prompt textareas
- Generate button showing progress

**FallingMoney.tsx** — Canvas animation:
- Renders falling $100 bills with realistic gradients
- No trail effect (clearRect each frame)
- z-index: z-0 (behind content)
- Smooth 60fps animation

---

## Important Context

### Environment Variables
- `GEMINI_API_KEY` — Required for image generation
- Set in Vercel dashboard, NOT committed to git
- If 403 Forbidden: key is invalid or expired

### Image Generation
- Calls Gemini API 3 times (once per image)
- Uses `Promise.all()` for parallel execution (~30-45 seconds total)
- Returns base64-encoded PNG images
- Caption includes figure name + outfit/scene/pose details

### UI/UX Design
- Minimalist black/white aesthetic (inspired by premium product showcases)
- Large image as focal point
- Scattered info cards and callouts
- Clean borders (border-2 border-black)
- Monospace fonts for technical text
- NO complex gradients or animations (except falling money)

---

## What NOT to Do

❌ **Don't**:
- Add blue/purple gradient themes (old design)
- Use external UI libraries (Shadcn, Material-UI, etc.)
- Commit `.env.local` or API keys
- Add features beyond what's requested
- Modify the API response structure without reason
- Change the 3-column layout without asking
- Add color to the design (keep it black/white/gray)
- Make major styling changes without showing the user first

❌ **Don't touch**:
- `lib/data.ts` outfits/scenes/poses without explicit request
- The Gemini API call logic (it's optimized with Promise.all)
- PWA meta tags in layout.tsx (iPhone functionality depends on them)

---

## What TO Do

✅ **Do**:
- Keep it simple and functional
- Test responsive design (mobile-first)
- Show progress during generation (progress indicator)
- Handle errors gracefully (don't crash)
- Use semantic HTML
- Optimize bundle size
- Check console for TypeScript/ESLint errors before committing
- Ask before making major design changes
- Commit with clear messages
- Test on iPhone Safari when possible

✅ **DO check before deploying**:
- `npm run build` compiles without errors
- No unused imports or variables
- Image generation works end-to-end
- Download button saves PNG correctly
- Share button opens iOS share sheet

---

## Development Workflow

1. **Make code changes** locally
2. **Test**: `npm run dev` → http://localhost:3000
3. **Check build**: `npm run build` (must succeed)
4. **Commit**: `git add . && git commit -m "Clear message"`
5. **Push**: `git push` (auto-deploys to Vercel)
6. **Test on Vercel**: https://flexbot-web.vercel.app
7. **Test on iPhone**: Open in Safari, add to home screen

---

## Current Status

✅ Functional:
- Form inputs (name, outfit, scene, pose, custom)
- Image generation via Gemini (3 images, parallel)
- Download/Share buttons (iOS Web Share API)
- Falling money animation ($100 bills)
- Responsive layout
- PWA ready (iPhone home screen)

🔄 Known limitations:
- Generation takes 30-45 seconds (Gemini API speed)
- No user accounts/history (stateless)
- No image storage (generated on-demand)

---

## Commands

```bash
npm run dev      # Start local dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Check for errors
```

---

## Questions Before Making Changes

If unsure, ask yourself:
- Does this improve user experience on iPhone?
- Is this functionality essential or nice-to-have?
- Will this increase bundle size significantly?
- Does this follow the minimalist black/white design?
- Will this break any existing features?

If answer is unclear → **ask the user before proceeding**.
