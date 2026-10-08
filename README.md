# trwells.com

Portfolio site for Tom Wells: data and business analyst, Power Platform developer. Pure HTML / CSS / vanilla JS, no build step, hosted on GitHub Pages from `main` at the repo root.

---

## Files

```
.
├── index.html             # Home: hero, stack, work index, career track, contact (page JS inline)
├── par.html               # Case study: PAR+
├── contractor-dashboards.html  # Case study: Contractor Performance Dashboards, with the live report rebuild
├── gspro-analytics.html   # Case study: GSPro Shot Analytics
├── gspro/                 # The live GSPro app (separate React page)
├── assets/
│   ├── styles.css         # The only stylesheet, shared by every page
│   ├── case-study.js      # Behavior for the three case-study pages
│   ├── dashboard.js       # The Business Overview report on contractor-dashboards.html (Power BI rebuild, sample data)
│   ├── fonts/             # Mona Sans + Martian Mono, self-hosted
│   ├── img/               # Optimized screenshots used on the home page
│   ├── logo/              # The Vertex mark (favicon) and the other mark studies
│   └── par-*.png, gspro-*.png   # Case-study screenshots
├── favicon.ico, apple-touch-icon.png   # Raster fallbacks for the Vertex mark
├── resume.pdf
├── CNAME                  # Custom domain. Do not edit.
└── .nojekyll
```

`proto-1.html`, `proto-2.html`, `proto-3.html` and `logos.html` are design studies. They are marked `noindex` and are not linked from the site.

---

## Caching

GitHub Pages caches CSS and JS for longer than HTML. Whenever `assets/styles.css`, `assets/case-study.js` or `assets/dashboard.js` changes, bump the `?v=` date on every `<link>` / `<script>` that loads it (index.html, par.html, contractor-dashboards.html, gspro-analytics.html).

---

## Design

- **Black canvas, glass and soft light.** Off-white type on black, one red accent, rounded glass surfaces.
- **The track.** The logo is a beam, an event and a curling track (the Vertex mark). Faint seeded particle tracks sit behind the hero and the case-study headers.
- **Scroll-driven sections.** The stack pins and explodes into five layers; the career track draws itself as you scroll; case studies fill a process rail as you read.
- **Motion that respects people.** Everything has a static fallback, and `prefers-reduced-motion` turns animation off.
- **No dependencies.** The site pages use no frameworks or CDNs, and fonts are self-hosted. (The GSPro app in `gspro/` loads React and Recharts from a CDN.)

---

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.
