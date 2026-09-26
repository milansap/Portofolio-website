# Milan Sapkota — Portfolio

Static portfolio site for [sapkotamilan.com.np](https://www.sapkotamilan.com.np/).
No build step: plain HTML, CSS and JavaScript, deployed as-is.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All page content and section markup |
| `assets/newcss.css` | Design tokens + every component style |
| `assets/ptj.js` | Intro loader, fit-to-width text, header theme, menu, services wipe, reveals, counters, projects carousel |
| `assets/contact.js` | Contact form submission via EmailJS |
| `assets/img/` | Portraits (`hero-portrait.jpg` is the web-sized hero) and project screenshots |
| `assets/Milan_Sapkota_Resume.pdf` | File served by the "Resume" / "Download CV" buttons |

External dependencies are loaded from CDNs: Google Fonts (Archivo variable, Mrs Saint Delafield for the intro signature),
Unicons v4.0.8 for icons, and the EmailJS browser SDK.

## Theming

Base colours live on `:root` in `assets/newcss.css` (`--ink`, `--silver`,
`--blue`). Each section opts into `.theme-light`, `.theme-blue` or
`.theme-dark`, which set `--bg`, `--fg`, `--muted`, `--line` and `--accent`;
components only read those. The `data-nav` attribute on a section tells the
fixed header which colour scheme to use while that section is beneath it.

Type is all Archivo: `.display` is heavy + extra-wide uppercase (via the
`wdth` axis), the name is light weight, and `.fit` elements are sized by JS to
span their container exactly.

## Editing content

Sections live in `index.html` in page order: hero, about, services intro
(`#wipe`), services, experience, projects, skills + education, contact.

- **Services** are `.svc` items; each needs an increasing `--i` inline so the
  sticky bars stack under one another.
- **Experience** entries are `.job` rows.
- **Projects**: add an `.orbit__card` (image or `.cover`) in `.orbit__stage`
  and an `.orbit__item` in `.orbit__details`, in the same order. The counter
  and carousel pick them up automatically.
- **Skills** are `.skill-col` lists.

Any element given `class="reveal"` fades in when scrolled into view. The
intro loader plays once per browser session and is skipped when the visitor
prefers reduced motion.

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

- The hero uses `hero-portrait.jpg` (1100 px, ~165 KB). The project
  screenshots are still unoptimised PNGs; converting them to WebP is the next
  easy performance win. `DSC_7498.jpg` (~3.9 MB) is only used as the social
  preview image.
- `assets/Milan_Sapkota_Resume.pdf` must be replaced by hand whenever the CV
  changes — the filename is referenced from the header pill and the menu in `index.html`.
