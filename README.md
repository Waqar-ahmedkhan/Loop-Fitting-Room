# LOOPS — Offcut clothing rail

A static storefront with the 10 original Offcut garments. Each garment keeps its photographic hanger, artwork, name, and euro price from the supplied reference.

## Run locally

```sh
./start.sh 8080
```

Open `http://localhost:8080`. No build step or package installation is needed to browse the store.

## Browse

- Scroll the mouse wheel over the rail, swipe on touch, use the arrow buttons, or press Left/Right.
- The selected piece moves to the middle. Wheel input advances one garment per gesture, with a 1.45-second cooldown.
- Automatic browsing waits 8.5 seconds between pieces. Pause it with the playback control. Hovering a garment, opening details, switching to 3D, or hiding the tab pauses automatic browsing.
- Reduced-motion preferences disable automatic browsing and transitions by default.
- Select the central garment or “Explore this piece” for details, sizes, and the demo bag.
- Filter the collection by T-shirts, longsleeves, or layers.

## Optional 3D models

“3D view” loads the bundled Google model-viewer module only when requested. Drag to rotate the selected model; use “Download .glb model” to save it.

The models are closed, textured mesh approximations derived from the reference images. Their backs and cloth depth are approximate. They are not scanned garments, rigged clothing, or cloth simulations. The main carousel uses the original transparent garment images for visual fidelity.

Regenerate the Offcut models with Python, Pillow, and NumPy:

```sh
python scripts/build_offcut_models.py
```

## Files

- `index.html`: rail, collection, details, and bag.
- `products.js`: the 10 active Offcut products.
- `ui.js`: carousel, wheel/swipe handling, playback, filters, bag, and lazy 3D loading.
- `styles.css`: responsive layout, rail transforms, and reduced-motion styles.
- `assets/product-art/offcut-*.webp`: transparent reference cutouts with hangers.
- `assets/garments/offcut-*.glb`: downloadable model approximations.
- `assets/vendor/`: local model-viewer module and its license.

The earlier procedural scene and original archive assets remain in the repository for reference; the active page does not import that scene or display those garments.

The bag persists locally. Checkout remains disabled; this demonstration does not process payments.
