# trwells.com

Portfolio site. Pure HTML/CSS/vanilla JS. No build step, no dependencies. Hosted on GitHub Pages from `main` at the repo root.

## Rules
- All site files live at the repo root, never inside a wrapper subfolder.
- Subpages (e.g. par.html) use root-relative paths: `/assets/styles.css`, not `assets/styles.css`.
- Filenames are lowercase and must exactly match their `src`/`href`, because Pages is case-sensitive.
- Never delete or edit the `CNAME` file.
- `transform: scale()` doesn't change layout. Scaled iframes need an oversize width/height, `transform-origin: top left`, and a negative margin.
- Don't embed Power Apps. They show a sign-in wall to the public.

## Preview
`python3 -m http.server 8000`, then open http://localhost:8000
