# LOOPS® — Spatial Archive Store

A complete interactive storefront concept based on the user-supplied 6.5-second **LOOPS virtual-store** reference. It includes a real WebGL/Three.js showroom with **10 original procedural `.glb` clothing meshes**, metal clothes rail, studio lighting, camera approach, garment rotations, item selection, editorial overlays, responsive product catalog, details panel, size/colour selection, and a local-storage demo cart.

**Important:** This is a functioning, original, reference-inspired prototype, not the original LOOPS website or a pixel-perfect reconstruction. In particular the 3D clothing meshes are original procedural approximations, **not** the exact scanned/simulated garments shown in the video.

## Start it

1. Extract the ZIP.
2. Start a web server from the extracted folder:

   ```bash
   python3 -m http.server 8080
   ```

3. Open `http://localhost:8080` in a current Chrome, Edge, Safari, or Firefox browser with **internet access for the Three.js JavaScript module**.

If Python is unavailable, `npx serve .` works (requires Node/npm).

**Do not launch with `file://`**. ES modules and GLB loading need a local server.

### View the reference-inspired autoplay sequence

Open `http://localhost:8080/?demo=1` for the optional 6.5-second demo:
- Starts with blurred studio/large LOOPS wordmark.
- Camera approaches the rack.
- Harness Tee rotates into focus.
- Halftone Acid Tee becomes the final featured object.

The default website is fully user-controlled rather than autoplaying.

## Interactions

- Scroll or select **ENTER THE STORE** to enter the 3D showroom.
- Drag horizontally on the canvas to select garments.
- Click a garment in the 3D scene to select it; use arrow buttons or keyboard `←` / `→`.
- Click **Store**, **Man**, or **Woman** to filter the collection.
- Click **EXPLORE THIS PIECE** to open product details. Sizes and color swatches update the selection. Color variants apply an illustrative material tint, **not a separate authored texture**.
- Click **ADD TO ARCHIVE BAG**. Cart items, subtotal, quantity adjustment, and removal work. Cart state persists in local storage.
- Use **menu**, **← back**, and the catalog section.
- Checkout deliberately remains disabled; no payment provider or inventory database is connected.

## Technology

This is a lightweight static site with no build step:

- Semantic HTML, CSS, and vanilla JavaScript.
- **Three.js r187 / v0.187.0**, loaded via an official import-map convention from jsDelivr.
- Three.js `GLTFLoader` for bundled GLB assets.
- Eased camera motion, damped product transforms and per-frame 3D picking.
- High-DPI and mobile pixel-ratio caps, lowered visual complexity on small screens, and reduced-motion handling.
- Python `trimesh` + Pillow asset generator (for rebuilding the original demo meshes).
- Local SVG-based CSS grain, semantic controls, keyboard navigation, loading and error fallback.

The website needs internet access **to fetch Three.js from jsDelivr at runtime**; garment GLBs and all previews are stored locally. To make it fully offline, download a matching version of `three.module.js` and `GLTFLoader.js` (and their dependencies), and update the import map to your self-hosted module paths.

## Files

```text
index.html                Web page and browser import map
styles.css                Full visual system and responsive styles
ui.js                     Product state, scrolling, filtering, cart, panels, demo
scene.js                  Three.js showroom and 3D interactions
assets/garments/          10 original GLB garment meshes
assets/product-art/       10 original garment catalog images
assets/textures/          10 authored fabric and graphic textures
assets/fallback-*.jpg     Static cinematic preview if WebGL/Three.js can't load
scripts/build_garments.py Rebuild all garment meshes and product art
scripts/build_fallback.py Original generated backup poster tool
scripts/build_reference_preview.py Builds static preview from user-supplied video frames
ASSET_MANIFEST.md          Asset provenance and replacement instructions
QA_REPORT.md              Verified and unverified functionality
```

## Replace with premium 3D assets

The model references researched earlier are **not bundled** because downloads and reuse permissions could not be verified here:

- [Sketchfab shirt on hanger](https://sketchfab.com/3d-models/cc0-shirt-on-hanger-846d8f285fcb426498033ae67aee2d10) — listing has conflicting CC0/CC BY signals; check actual license.
- [CGTrader hanging garment pack](https://www.cgtrader.com/3d-models/character/clothing/sweatshirt-hoodie-polo-and-t-shirt-on-hanger-3d-model) — commercial asset; purchase/license may be required.
- [Sketchfab hanger and long-sleeve](https://sketchfab.com/3d-models/hangers-and-long-sleeve-shirt-14cc81980a06473a820f811596418fae) — verify license before use.

To replace one garment:
1. Obtain a model you have permission to use, with textures.
2. Export a valid **GLB** from Blender, orient the front toward **+Z**, origin at the hanger/neck line (`y=0`), and fabric extending to roughly `y=-1.7`. Scale width to around 1–2 world units.
3. Replace the corresponding file in `assets/garments/` with the existing filename.
4. Replace the associated product preview `.webp` in `assets/product-art/` if desired.
5. Test the fit and update the product details in `ui.js`.

## Visual QA note

The on-page static fallback uses preview frames derived from **the user-provided MP4** (not a rendered screenshot of our WebGL geometry). It is clearly labeled **STATIC PREVIEW** when Three.js cannot run.

The original 3D geometry and texture files were validated locally. UI behaviors were tested in headless Chromium via injected local resources. **Live CDN-dependent Three.js rendering could not be fully tested in this environment because external network requests in the test browser were blocked.** Perform a normal online browser verification after extracting and serving the package.

For a commercial deployment, license the production assets/branding appropriately, connect an actual catalog + checkout backend, and conduct additional cross-browser/assistive-technology testing.
