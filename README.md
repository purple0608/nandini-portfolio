# Nandini Thakur — Portfolio

A static, multi-page portfolio about software engineering, finance, and fintech. Built with HTML, CSS, JavaScript, WebGL, and a dependency-free Python page generator.

## Run locally

```sh
python3 scripts/build.py
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173.

## Deploy to Vercel

Import this repository as a new Vercel project. The included `vercel.json` sets Framework to Other, skips the build step, and serves `dist/`. No environment variables or install command are required.

The generated HTML is committed. After editing page copy, run `python3 scripts/build.py` and commit both the source and generated files before pushing. Vercel will deploy the updated output.

## Edit the website

- `scripts/build.py`: page structure and copy.
- `content/gsecs.html`: the G-secs case study.
- `dist/style.css` and `dist/contrast.css`: layout and palette.
- `dist/motion.js` and `dist/motion.css`: scroll and card animations.
- `dist/scene.js`: interactive WebGL sculpture.
- `dist/script.js`: contact drafts, filters, and product interactions.
- `dist/assets/`: portrait and icon.

## Pages

About, Projects, Finance, CS / Data Engineering, Ideas, and Digital Products, with individual article and product-preview pages.

## Resume and products

The resume button currently opens an email request. To enable a download, add the PDF to `dist/downloads/` and set `siteConfig.resumeUrl` in `dist/script.js`.

Paid products are in development. Add final files, pricing, and checkout links when available. Contact forms open an email draft; there is no backend message storage.

## Motion and accessibility

The site includes keyboard focus states, reduced-motion support, an optional page-motion control, and a pause button for the WebGL sculpture.
