# trwells.com

Portfolio site. Pure HTML/CSS/vanilla JS. No build step, no dependencies. Hosted on GitHub Pages from `main` at the repo root.

## Rules
- All site files live at the repo root, never inside a wrapper subfolder.
- Every page sits at the repo root and references assets and other pages with relative paths (`assets/styles.css`, `par.html`, `index.html#portfolio`), so pages also render when opened straight from disk. Root-relative paths (`/assets/...`) break that.
- Filenames are lowercase and must exactly match their `src`/`href`, because Pages is case-sensitive.
- Never delete or edit the `CNAME` file.
- `transform: scale()` doesn't change layout. Scaled iframes need an oversize width/height, `transform-origin: top left`, and a negative margin.
- Don't embed Power Apps. They show a sign-in wall to the public.
- Browsers cache `assets/styles.css` for 4 hours but the HTML for only 10 minutes. `styles.css` is shared by index.html, par.html and gspro-analytics.html, so whenever it changes, bump the `?v=` date on its `<link>` in all three, or visitors get the new HTML with the old CSS. The same goes for `assets/case-study.js` and its `<script>` in the two case-study pages.
- The logo is the Vertex mark: `assets/logo/mark-vertex.svg` (favicon), with `favicon.ico` and `apple-touch-icon.png` as raster fallbacks. The nav and footer inline the same SVG.

## Preview
`python3 -m http.server 8000`, then open http://localhost:8000
