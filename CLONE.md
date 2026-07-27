# Cloning this site for a new prospect

This project is templated: business details live in one config file, the
page is generated from a template, and a build script stitches them
together. Cloning it for a new car detailer takes minutes, not a manual
find-and-replace.

## How it fits together

| File | What it is |
|---|---|
| `site.config.json` | The only file you edit for business details (name, phone, service area, price, copyright year, SEO title/description). |
| `index.template.html` | The real source of the page markup. Has `{{TOKEN}}` placeholders where business details go. Edit this (not `index.html`) if you're changing layout, copy, or adding a new section. |
| `build.py` | Reads the config, fills in the template, and writes `index.html` + `assets/js/site-config.js`. |
| `index.html` | **Generated output.** Has a comment at the top saying so. Don't hand-edit it — your changes will be overwritten next time someone runs the build. |
| `assets/js/site-config.js` | **Generated output.** Exposes `window.SITE_CONFIG` so `main.js` (the quote-quiz SMS builder) can use the same business name/phone without its own copy of the data. |
| `assets/js/main.js` | Animation + quote-form logic. Reads `window.SITE_CONFIG` for the phone number and business name — no business-specific values hardcoded here. |

## Clone workflow

1. **Duplicate the folder.** Copy the whole project directory and rename it for the new prospect, e.g. `Elite Auto Detailing`.

2. **Edit `site.config.json`** with the new business's details:
   ```json
   {
     "businessName": "Elite Auto Detailing",
     "pageTitle": "Elite Auto Detailing — Mobile Auto Detailing | Rocklin, CA",
     "metaDescription": "...",
     "phoneDisplay": "916-555-0100",
     "phoneE164": "+19165550100",
     "serviceAreaCity": "Rocklin",
     "serviceAreaState": "CA",
     "startingPrice": "$60",
     "copyrightYear": "2026"
   }
   ```

3. **Swap the logo + favicon.** Replace these two files with the new business's artwork, keeping the same filenames (or update the `<img>`/`<link>` paths in `index.template.html` if you'd rather rename them):
   - `assets/img/logo-full.png`
   - `assets/img/favicon-512.png`

4. **Swap the media.** Replace these files in `Media/` with the new business's own footage/photos, keeping the same filenames so nothing else needs to change:
   - `AdobeStock_309826195.mp4` — hero background video
   - `Unknown-2.jpg`, `Unknown.jpg`, `Unknown-3.jpg`, `Unknown-4.jpg` — the four "Process" section photos (foam pre-soak → hand wash → interior → showroom finish)
   - `Unknown-2.mp4`, `Unknown.mp4` — the two "See It In Action" video clips (their poster thumbnails reuse `Unknown-2.jpg`/`Unknown.jpg` above)
   - `Unknown-3.jpg` is also reused as the final-CTA background image

   If a prospect only has a handful of usable photos/clips, it's fine to reuse one in two spots — that's already what this site does.

5. **Rebuild:**
   ```bash
   python3 build.py
   ```
   It'll error out if any `{{TOKEN}}` in the template didn't get filled in, so you can't accidentally ship a page with a placeholder still showing.

6. **Preview locally** before sending it anywhere:
   ```bash
   python3 -m http.server 4173
   ```
   then open `http://localhost:4173/`.

7. **Deploy it.** For a throwaway sales demo you don't need git at all — the fastest path is dragging the whole project folder onto **[netlify.com/drop](https://app.netlify.com/drop)**, which gives you a live URL in seconds with no account setup required for the recipient. If you want it properly source-controlled (e.g. a lead actually signs), create a **new** GitHub repo for that client (don't push clones to the `2-brothers-detailing` repo) and connect it to Netlify/Vercel for continuous deploy the same way this project is set up.

## Adding a new swappable field later

If you find yourself hand-editing the same value in multiple places in a
future clone, that's a sign it should become a token:

1. Add the key to `site.config.json`.
2. Add it to the `tokens` dict in `build.py`.
3. Replace the literal text in `index.template.html` with `{{YOUR_TOKEN}}`.
4. If `main.js` also needs it, reference `window.SITE_CONFIG.yourKey` there instead of hardcoding it.
