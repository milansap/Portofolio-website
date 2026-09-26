# Milan Sapkota — Portfolio

Static portfolio site for [sapkotamilan.com.np](https://www.sapkotamilan.com.np/).
No build step: plain HTML, CSS and JavaScript, deployed as-is.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All page content and section markup |
| `assets/newcss.css` | Design tokens + every component style |
| `assets/ptj.js` | All motion (GSAP + Lenis) plus menu, header theme, fit-to-width text and the static fallback |
| `assets/contact.js` | Contact form submission via EmailJS |
| `assets/img/` | Portraits (`hero-portrait.jpg` is the web-sized hero) and project screenshots |
| `assets/Milan_Sapkota_Resume.pdf` | File served by the "Resume" / "Download CV" buttons |

External dependencies are loaded from CDNs: Google Fonts (Archivo variable),
Unicons v4.0.8 for icons, GSAP 3.15 (core, ScrollTrigger, SplitText,
DrawSVGPlugin, CustomEase — all free), Lenis 1.3 for smooth scrolling, and the
EmailJS browser SDK.

## Theming

Base colours live on `:root` in `assets/newcss.css` (`--ink`, `--silver`,
`--blue`). Each section opts into `.theme-light`, `.theme-blue` or
`.theme-dark`, which set `--bg`, `--fg`, `--muted`, `--line` and `--accent`;
components only read those. The `data-nav` attribute on a section tells the
fixed header which colour scheme to use while that section is beneath it.

Type is all Archivo: `.display` is heavy + extra-wide uppercase (via the
`wdth` axis), the name is light weight, and `.fit` elements are sized by JS to
span their container exactly.

## Motion

Everything is scripted in `assets/ptj.js`; the CSS alone renders a complete
static page, and rules scoped to `html.gsap` only apply once animation boots.

| Effect | Where | Hook |
| --- | --- | --- |
| Signature intro + ribbon reveal (once per session) | `#loader` | `.loader__sig path`, `.loader__shape path`, `[data-reveal]` |
| Hero name shrinks into the header logo | `#brand` / `#hero-name` | scrubbed over the hero |
| Line / 3D-char / scattered-char text reveals | any element | `data-split-lines`, `data-split-roll`, `data-split-random` |
| Brackets slide in | headings | `data-bracket` with `.bracket__l` / `.bracket__r` |
| Parallax | images | `data-parallax="<percent>"` |
| Pinned stroke draw into blue | `#wipe` | pinned for 200% of the viewport |
| Pinned services accordion (≥ 992 px) | `#services` | adds `html.svc-pin` |
| Orbit carousel | `#orbit` | `.orbit__tile` / `.orbit__item`, same order |
| Flying "contact" words | `#contact-track` | words generated in JS |
| Footer slides out from under the page (≥ 768 px) | `#footer-inner` | |
| Cursor image trail (mouse only) | `[data-trail]` | `.trail img[data-src]` |

If GSAP fails to load or the visitor prefers reduced motion, none of this
runs: the loader is skipped, services stack statically and the orbit becomes
a scrollable strip with working prev/next buttons.

The intro signature is real SVG paths generated from the Mrs Saint Delafield
font, so it can be drawn stroke by stroke; regenerate them if the name changes.

## Editing content

Sections live in `index.html` in page order: hero, about, services intro
(`#wipe`), services, experience, projects, skills + education, contact.

- **Services** are `.svc` items: a `.svc__bar` row plus a `.svc__visual`
  holding the text and `.svc__media`.
- **Experience** entries are `.job` rows.
- **Projects**: add an `.orbit__tile` in `#orbit-ring` and an `.orbit__item`
  in `.orbit__details`, in the same order. The counter and carousel pick them
  up automatically.
- **Skills** are `.skill-col` lists.

Any element given `class="reveal"` rises in when scrolled into view.

## Deploying

The site is served by GitHub Pages behind Cloudflare. Cloudflare caches CSS
and JS for about 4 hours but HTML for 10 minutes, so without versioned URLs a
push can leave visitors with the new `index.html` and the old scripts, which
breaks the animations. Before every commit that touches `assets/`, run:

```powershell
npm run bump
```

`scripts/bump-assets.js` stamps each local asset URL in `index.html` with a
hash of the file's contents (`assets/ptj.js?v=06d84161`). Unchanged files keep
their URL (and stay cached); changed files get a new one and are fetched fresh.

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
