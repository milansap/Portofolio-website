# Portfolio (Refreshed)

This is an updated version of the portfolio site originally provided in this folder. I refreshed a few aspects to make it more accessible and modern while preserving the original design and content.

What I changed
- Removed the right-click block (improves usability and developer friendliness).
- Added a skip-to-content link for keyboard users.
- Pinned the header to the top and made the header area translucent for a modern feel.
- Centered the site container and widened it for larger screens.
- Improved the mobile menu positioning and animation.
- Hardened the JavaScript (`assets/ptj.js`) so the page won't throw errors if some DOM elements are missing.

How to preview locally
1. Open `index.html` in a browser. For best results serve it from a local static server:

   - With VS Code Live Server extension: right-click `index.html` and choose "Open with Live Server".
   - With Python (if installed):

```powershell
# Windows PowerShell (from the project folder)
python -m http.server 5500; # then open http://localhost:5500 in a browser
```

Notes & next steps
- The site is still a static HTML/CSS/JS bundle. If you'd like I can convert it into a React app, add a contact form backend, or set up automated deployment to GitHub Pages or Netlify.
- I preserved your assets and images. If you want a refreshed color scheme, new fonts, or additional sections (blog, projects, testimonials), tell me which and I'll extend it.

Enjoy — tell me one or two things you'd like changed next (colors, font, add projects, social links) and I'll implement them.