# FlexBot — iPhone Web App

Generate hyper-realistic AI flex photos on your iPhone. Built with Next.js + Vercel, powered by Google Gemini API.

## Features

- **Three AI-generated flex photos** in one generation
- **Dark luxury UI** branded "FlexBot" with gold accents
- **iPhone PWA** — save to home screen, runs fullscreen
- **Smart defaults** — 25 outfits, 24 scenes, 25 poses, or fully custom
- **Download & Share** — save images locally or share via iOS share sheet
- **No n8n needed** — Gemini API directly from Next.js

## Quick Start

### Local Development

1. **Install dependencies**
   ```bash
   cd flexbot-web
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY (from fix_all.js)
   ```

3. **Run dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

4. **Test generation**
   - Enter name: "Albert Einstein"
   - Select outfit: "Jesus Tee"
   - Select scene: "Kitchen White"
   - Select pose: "Counter Sit"
   - Click "Generate 3 Flex Photos"
   - Confirm 3 images generate and display

## Project Structure

```
flexbot-web/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # POST API → Gemini calls
│   ├── layout.tsx                # Root layout + PWA meta tags
│   ├── page.tsx                  # Main UI page
│   └── globals.css               # Dark theme base styles
├── components/
│   ├── FlexForm.tsx              # Form + generate button
│   └── ImageGrid.tsx             # 3 images + save/share
├── lib/
│   ├── data.ts                   # All outfits, scenes, poses
│   └── buildPrompt.ts            # Prompt builder
├── public/
│   └── manifest.json             # PWA manifest
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local                    # GEMINI_API_KEY (not committed)
```

## Deployment to Vercel

### 1. Create GitHub Repo

```bash
cd flexbot-web
git init
git add .
git commit -m "Initial FlexBot web app"
git branch -M main
# Create empty repo on github.com/yourname/flexbot-web
git remote add origin https://github.com/yourname/flexbot-web.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to **vercel.com**
2. Sign up with GitHub (or log in)
3. Click **"New Project"**
4. Select **`flexbot-web`** repo from your GitHub
5. **Environment Variables:**
   - Add `GEMINI_API_KEY` = (your key from fix_all.js)
6. Click **"Deploy"**
7. Wait for build → get live URL like `https://flexbot-web.vercel.app`

### 3. Use on iPhone

1. Open Safari
2. Navigate to your Vercel URL
3. Tap **Share** (bottom menu)
4. Tap **"Add to Home Screen"**
5. Name it "FlexBot"
6. Tap **"Add"**
7. App saves to home screen — tap to launch fullscreen

## Configuration

### API Key

The Gemini API key must be set in `.env.local`:
```env
GEMINI_API_KEY=AIzaSyDlGGiwL9-2RFUPZErqv0eFHu7gRhl14Y0
```

Get this from `fix_all.js` line 8 (`GEMINI_URL` contains the key in the query string).

### Styling

- **Background:** `#0a0a0a` (black)
- **Accent:** `#C9A84C` (gold)
- **Font:** System font (Inter fallback)
- All dark theme, optimized for iPhone

## Available Options

### Outfits (25)
`jesus_tee`, `chrome_tee`, `hellstar_red`, `fur_flex`, `jordan_fit`, `tracksuit_fit`, `lv_monogram`, `mcm_boss`, `all_black`, `cactus_jack`, `fog_essentials`, `gucci_suit`, `versace_shirt`, `givenchy_fit`, `dior_casual`, `corteiz_fit`, `amiri_fit`, `bape_fit`, `supreme_fit`, `sp5der_fit`, `gallery_fit`, `vlone_fit`, `trapstar_set`, `palm_fit`, `off_white_fit`

### Scenes (24)
`kitchen_white`, `kitchen_oak`, `penthouse`, `gas_station`, `vegas_rooftop`, `dubai_rooftop`, `rolls_driveway`, `rolls_phantom`, `private_jet`, `jet_tarmac`, `yacht_deck`, `casino_vip`, `nightclub_vip`, `mansion_pool`, `ferrari_garage`, `hotel_lobby`, `miami_beach`, `penthouse_balcony`, `barbershop`, `walk_in_closet`, `parking_lot`, `city_street`, `basketball_court`

### Poses (25)
`kitchen_blunt`, `kitchen_lighter`, `kitchen_gun`, `kitchen_ak`, `kitchen_dual`, `counter_sit`, `floor_lay`, `arms_spread`, `floor_surround`, `car_hood_lay`, `car_hood_sit`, `car_lean`, `low_crouch`, `jet_seat`, `jet_lean`, `casino_table`, `yacht_bow`, `table_spread`, `wrist_check`, `pocket_stuff`, `mirror_flex`, `sneaker_check`, `nightclub_bottle`, `cash_bath`, `toss_money`, `bed_money`, `two_shot`, `pool_edge`, `balcony_fan`, `dual_hold`

## Advanced Usage

### Custom Outfit

Instead of picking from the dropdown, describe your own:
```
Black oversized Saint Michael hoodie, vintage Carhartt work pants in tan, Travis Scott Jordan 1 Low OG SP reverse mocha, thick 24k gold rope chain with large diamond pendant
```

### Custom Pose

Describe exactly how you want to be positioned:
```
Standing in front of a marble fireplace, left hand on mantelpiece, right hand holding a glass of Hennessy, looking directly at camera with confident expression, full body visible
```

### Full Custom Prompt

Completely override the default prompt generation and write your own. This bypasses all other inputs.

## Troubleshooting

### Images not generating

1. Check that `GEMINI_API_KEY` is set in `.env.local`
2. Verify the API key is valid (from fix_all.js)
3. Check Vercel logs: `vercel logs`
4. Ensure request payload is valid JSON

### PWA not saving to home screen

1. Use Safari (not Chrome)
2. Make sure you're on the HTTPS URL (not localhost)
3. Tap Share → scroll down to "Add to Home Screen"
4. If you don't see it, refresh the page and try again

### Images download but don't open

The images are base64-encoded PNG. Your device should auto-detect and open in Photos app when you download.

## Performance

- **Generation time:** ~30–60 seconds for 3 images (Gemini API)
- **Image size:** ~500KB each (base64 in response)
- **First load:** ~2–3 seconds (Next.js bundle)
- **Subsequent loads:** ~500ms (cached bundle)

## License

Built with love for the Premeditated Millionaire lifestyle. 💰
