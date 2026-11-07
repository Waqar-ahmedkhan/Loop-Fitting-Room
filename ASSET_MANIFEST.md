# Asset manifest / provenance

| Asset group | Count | Status | Provenance | Fidelity |
|---|---:|---|---|---|
| Garment GLB models | 10 | Bundled, validated | Original procedural geometry generated with `scripts/build_garments.py` | Genuine mesh; approximate garment silhouettes |
| Garment textile textures | 10 | Bundled | Original procedural drawings/noise/textures | Approximate patterns |
| Product catalog previews | 10 | Bundled | Original procedural image generation | Stylized garment renders |
| Chrome clothing rack | 1 | Constructed in Three.js | Original generated primitives | Matches visual composition, not exact original mesh |
| Hangers | 10 | Constructed in Three.js | Original tube geometry | Original, approximate |
| Studio scene | 1 | Constructed in Three.js/CSS | Original background, lights, fog, floor | Inspired by user reference |
| Static preview intro | 1 | Bundled | Original generated fallback illustration | Reference-inspired |
| Static showroom/acid previews | 2 | Bundled | Edited frames from the user-supplied MP4 | Visually close, **not WebGL renders** |
| Three.js library | 1 CDN module + addon | Runtime dependency | jsDelivr, Three.js under MIT license | Exact known version 0.187.0 |
| Font | External with local fallback | Optional | Google Fonts Inter / system fallback | Close approximation |
| Premium reference garment assets | 0 | Not bundled | Third-party marketplace listings are only leads | Not available for verified redistribution |

## Model specification

Generated GLB assets use a consistent forward orientation (+Z), a neck reference close to `y=0`, width around 1.8–2.2 world units including sleeves, depth around 0.3 world units, and fabric bottom near `y=-1.6…-1.85`.

Geometry has a front and back cloth surface and sleeve panels with a textured physical/PBR material. It is not cloth simulation or rigged fabric. There are approximately 5,872 triangles per GLB, excluding dynamically constructed details.

## Reference licensing

The supplied video is used solely as a user-provided artistic reference and as the source of two explicitly labeled **static fallback screenshots**. The package should not be represented as the official LOOPS website. Permission from the relevant rights holder may be needed before public/commercial distribution of branding or user-supplied reference frames.
