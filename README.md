# Milan Sapkota — Portfolio

Static portfolio site for [sapkotamilan.com.np](https://www.sapkotamilan.com.np/).
No build step: plain HTML, CSS and JavaScript, deployed as-is.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All page content and section markup |
| `assets/newcss.css` | Design tokens + every component style |
| `assets/ptj.js` | Nav, theme toggle, scroll-spy, scroll-to-top, reveal-on-scroll |
| `assets/contact.js` | Contact form submission via EmailJS |
| `assets/img/` | Portrait and project screenshots |
| `assets/LatestMilanResume.pdf` | File served by the "Resume" / "Download CV" buttons |

External dependencies are loaded from CDNs: Google Fonts (Inter, JetBrains Mono),
Unicons v4.0.8 for icons, and the EmailJS browser SDK.

## Theming

Colours, spacing, radii, shadows and type sizes are CSS custom properties
declared on `:root` in `assets/newcss.css`. Dark mode redeclares the same
tokens under `body.dark-theme`, so restyling means editing tokens, not
component rules.

The accent colour is `--accent` (plus `--accent-strong`, `--accent-soft`,
`--accent-on`, `--accent-tint`, `--accent-tint-2` and `--accent-ring`).
Change those and the whole site follows. There are no colour gradients —
every accent surface is a flat fill.

Theme selection order: the visitor's stored choice (`localStorage`), then the
OS `prefers-color-scheme`. An inline script in `<head>` applies the dark
background before first paint to avoid a white flash.

## Editing content

Sections live in `index.html` in page order: home, about, experience,
projects, skills (education is nested at the end of the skills section),
contact.

- **Experience / education** entries are `.timeline__item` blocks.
- **Projects** are `.project__card` blocks. A card either has an
  `<img class="project__img">` plus a `.project__overlay` with links, or a
  `.project__cover` placeholder (icon + label) when there is no public
  screenshot or URL.
- **Skills** are `.skills__card` groups of `.tag` spans.

Any element given `class="reveal"` fades in when scrolled into view.

## Running locally

```powershell
python -m http.server 5500
```

Then open <http://localhost:5500>. Opening `index.html` directly from disk
also works, though the contact form needs a real origin.

## Contact form

`assets/contact.js` holds the EmailJS public key, service ID and template ID.
The public key is safe to expose; submissions are rate-limited by EmailJS.
Failures surface inline in `#formStatus` rather than as browser alerts.

## Notes

- Images in `assets/img/` are unoptimised originals (~7 MB total; the hero
  portrait alone is ~3.9 MB while it renders at 384 px wide). Resizing and
  converting them to WebP is the single biggest available performance win.
- `assets/LatestMilanResume.pdf` must be replaced by hand whenever the CV
  changes — the filename is referenced in two places in `index.html`.
