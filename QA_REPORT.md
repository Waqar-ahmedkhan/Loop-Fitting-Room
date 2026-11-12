# Current QA — Offcut rail

The final active collection contains only the 10 original Offcut garments, with their original visible hangers. Additional archive pieces are excluded.

## Browser verification

Verified with isolated headless Chrome against the local static site at desktop 1440 × 1000 and mobile 390 × 844.

- All 10 products render and settle at the horizontal centre of the rail.
- Previous/next navigation wraps correctly through the collection.
- Vertical mouse-wheel scrolling moves one garment at a time and respects the 1.45-second cooldown.
- Horizontal trackpad scrolling works in both directions.
- Mouse dragging works in both directions without opening details after a drag.
- Automatic browsing advances exactly one garment after 8.5 seconds; the pause control stops it.
- Reduced-motion preferences disable autoplay and transitions by default.
- Size selection, adding to the bag, product images, euro subtotal, and panel closing work.
- The optional 3D viewer loads the selected GLB, and its download link matches the selection.
- Filtering returns 5 T-shirts and 10 total pieces.
- Mobile selected garment remains centred, with no horizontal page overflow.
- No JavaScript page errors or missing asset responses were recorded in the final browser checks.

## Source checks

JavaScript syntax checks, Prettier formatting checks, and `git diff --check` pass.

The Impeccable detector reported stylistic font warnings for the retained Inter / Instrument Serif pairing. This pairing follows the existing project and supplied Offcut reference; the warnings were reviewed and retained intentionally.

## Material limitations

The downloadable GLBs approximate clothing shape from the supplied images. They are not scanned, rigged, or simulation-ready garments. The photographic rail is the primary presentation.

Checkout is disabled. The bag is a local demonstration.

## Visual evidence

- `preview-rail-desktop.png`
- `preview-rail-mobile.png`
