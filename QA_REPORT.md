# QA report — 2026-11-07

## Passed

- [x] `ui.js` passes `node --check` syntax validation.
- [x] `scene.js` passes `node --check` syntax validation.
- [x] All **10 GLB files** load into `trimesh` as valid scenes with finite geometry bounds and a mesh.
- [x] 10 texture files + 10 product-art files are present.
- [x] Intro UI mounts in headless Chromium via injected CSS/JavaScript and local data assets.
- [x] Scroll state displays the showroom UI.
- [x] Arrow button selection changes the correct product name.
- [x] Details drawer opens.
- [x] Add-to-cart opens the cart drawer and increases count.
- [x] All 10 catalog products render; sample screenshots made.
- [x] No uncaught UI JavaScript errors in the injected tests.
- [x] Local HTTP server serves the site assets (`200 OK`).
- [x] Reduced-motion CSS rules present.

## Not verified

- [ ] The live, CDN-loaded Three.js scene was **not** visually verified due to restricted internet/browser routing in this test environment.
- [ ] WebGL 3D raycaster, lighting and live garment texture appearance need a normal online browser QA pass.
- [ ] Mobile GPU performance has not been measured on physical devices.
- [ ] Payment checkout intentionally not implemented.
- [ ] Third-party premium garments have not been bundled or redistributed.

## Browser verification checklist for deployment

1. Open `http://localhost:8080/` with network access. Confirm preloader disappears and the full 3D clothes rail appears.
2. Scroll until selected Harness Tee turns to face the camera.
3. Drag horizontally; confirm another garment rotates forward and the label changes.
4. Click a garment/hanger, switch categories, inspect details, change size/color, and add items to the cart.
5. Visit `/?demo=1` and check the intro/approach/Harness/Acid timing.
6. Test 1440×960, 1280×800, 768×1024 and 390×844 and check browser console.

## Additional mobile checks

- [x] 390 × 844 UI layout rendered in an injected headless Chromium test.
- [x] Touch-size navigation targets, product details and demo cart controls responded to simulated clicks.
- [x] Fixed a static-fallback warning layer that initially intercepted the garment navigation button on mobile (`pointer-events: none`).
