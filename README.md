# Portfolio Site

A scroll-driven, single-page portfolio for a Data Analyst / Business Analyst / Power Platform Developer. Editorial dark aesthetic. Pure HTML / CSS / vanilla JS. No build step. Drops straight onto GitHub Pages.

---

## File structure

```
.
├── index.html        # All content + structure
├── assets/
│   ├── styles.css    # All styling
│   └── script.js     # Scroll-driven interactions
├── CNAME             # Your custom domain (edit this)
├── .nojekyll         # Tells GitHub Pages to skip Jekyll
└── README.md
```

---

## Quick deploy to GitHub Pages

1. Create a new repo on GitHub. Two naming options:
   - `<your-username>.github.io` → site lives at `https://<your-username>.github.io/`
   - Any other name (e.g. `portfolio`) → site lives at `https://<your-username>.github.io/portfolio/`
2. Upload all files from this folder to the repo root. (Or `git push` if you prefer.)
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set source to **Deploy from a branch**, branch `main`, folder `/ (root)`.
5. Wait ~60 seconds. GitHub will give you the live URL.

### Custom domain

You said the domain is already purchased.

1. Edit `CNAME` and replace `yourdomain.com` with your actual domain (no `https://`, no trailing slash).
2. At your domain registrar, add these DNS records:
   - **Apex domain** (`yourdomain.com`): four A records pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - **www subdomain**: a CNAME record pointing to `<your-username>.github.io`
3. Back in GitHub **Settings → Pages**, enter your domain in the **Custom domain** field.
4. Tick **Enforce HTTPS** once the cert provisions (can take up to 24 hours, usually much less).

---

## Customization checklist

Open `index.html` and search-replace these placeholders:

| Find                          | Replace with                          |
| ----------------------------- | ------------------------------------- |
| `Your Name`                   | Your actual name                      |
| `you@yourdomain.com`          | Your real email                       |
| `your-handle`                 | Your LinkedIn / GitHub usernames      |
| `Chicago, IL`                 | Your city                             |
| `/resume.pdf`                 | Path to your résumé (drop it in root) |

### Project case studies

Each `.project` block in the **Chapter 04** section is a portfolio card. Edit the `<h3>`, description, tags, and link `href` to point at real case study pages. The visual mocks (`.project__viz--bi`, `--app`, `--flow`, `--sql`) are pure CSS — swap them for screenshots by replacing the inner markup with `<img src="assets/your-screenshot.png" alt="...">` and removing the relevant `.project__viz--*` class.

### Stats in Chapter 01

The numbers animate from 0 to whatever you set in `data-count`. Edit those values and labels to match your story.

### Color & typography

All design tokens live at the top of `assets/styles.css` under `:root`. Want a different accent? Change `--accent`. Want to swap fonts? Update the Google Fonts link in `index.html` and the `--serif` / `--sans` variables.

---

## Adding case study pages

When you're ready to link out to detailed write-ups, create them as separate HTML files in a `case-studies/` folder. Reuse `assets/styles.css` for consistency:

```
case-studies/
  revenue-cockpit.html
  field-inspection-app.html
  ...
```

Then point each project card's `href` at the matching file.

---

## Local preview

No build step needed. Either:

- Open `index.html` directly in a browser, **or**
- Run a quick local server for cleaner asset paths:
  ```bash
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

---

## What's intentional in the design

- **Scroll-pinned chapters** — Each major section is structured as a "chapter" of a story, modeled on the Logartis and Apple references you shared. Chapter 03 (How I work) uses true horizontal scroll-pinning on desktop.
- **Editorial typography** — Fraunces (variable serif) for headlines, Geist for UI, Geist Mono for tagging. The display font's optical size axis is set to 144 for big tracking-tight headlines.
- **Warm dark palette** — Off-black warm background with cream ink and amber accent, instead of the standard blue-purple developer-portfolio cliché.
- **Motion that earns its place** — Reveals are tied to scroll, not page load. Subtle pulses, count-ups, and a horizontal pinned section. Everything respects `prefers-reduced-motion`.
- **No dependencies** — Just HTML, CSS, and vanilla JS. Loads fast, ages well, easy for you to maintain.

---

## License

Yours. Modify freely.
