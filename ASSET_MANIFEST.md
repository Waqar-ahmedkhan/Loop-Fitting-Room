# Active asset provenance

The active collection consists of 10 Offcut pieces from the user-supplied `offcut-clothing-rail/index.html` reference.

- `assets/product-art/offcut-*.webp`: garment cutouts extracted from the reference's shared sprite using its original outlines and alpha transparency. The photographs include their original wooden hangers. Names and euro prices follow the reference.
- `assets/garments/offcut-*.glb`: image-derived cloth meshes built with `scripts/build_offcut_models.py`. They have textured fronts, approximate plain backs, closed edges, and smooth vertex normals. These are approximate display models, not scans or clothing simulation assets.
- `assets/vendor/model-viewer.min.js`: Google model-viewer 4.1.0, obtained from jsDelivr's official npm package. Its Apache 2.0 license is included beside the module. The module loads only after switching to 3D view.
- Fonts: Inter and Instrument Serif, loaded through Google Fonts with local fallback families.
- UI icons: simple inline SVG geometry.

Earlier archive artwork, procedural GLBs, and fallback screenshots are retained as repository history/reference assets. They are not part of the active product data or the initial showroom download.

The experimental additional 10 archive cutouts were removed from the active collection and working tree after the user clarified that only the original 10 garments should remain.
