# VirtualFit — Spatial Try-On

A single-page, responsive virtual try-on storefront built with HTML, CSS, vanilla JavaScript and Three.js.

## Run locally

Because the page uses an ES module import for Three.js, serve the folder through a local web server (rather than opening the file directly):

```bash
cd virtualfit-website
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Included

- Three.js 3D garment-card arc with perspective, depth, rotation, floating motion and parallax.
- Drag, flick, wheel, arrow-key and on-screen arrow navigation.
- Garment selection with scan-to-reveal outfit transition.
- Glass navigation, tool rail, product details, size chips, colour swatches and custom cursor.
- Responsive mobile layout and reduced-motion support.
- Original VirtualFit room, model and garment asset URLs and crop coordinates.

## Asset / 3D note

The supplied model and garment assets are transparent 2D image sheets. The garment carousel is rendered as real Three.js 3D geometry; the human try-on figure is rendered as a layered 2.5D image plane and swaps between the supplied outfit crops. A fully volumetric avatar with physically draped 3D clothing requires rigged GLB/GLTF avatar and garment assets.

The page loads Three.js from jsDelivr and images/fonts from their original remote hosts, so an internet connection is required.
