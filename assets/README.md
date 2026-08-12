# assets/

Static assets for Muper Sario 2.0.

## Background music

**Current:** `assets/music/background.wav` is **committed** to the repo and plays on GitHub Pages.

Place/replace your looping `.wav` at:

```
assets/music/background.wav
```

Music loads **only when gameplay starts**, via `HTMLAudioElement` with `loop: true`. If missing or blocked, procedural BGM fallback runs.

**IDM note:** Add `localhost:38473` to Internet Download Manager exclusions if `.wav` is intercepted during local dev.

## Mute control

**Mute** button (top-left HUD) pauses/resumes BGM and silences SFX. Persists in `localStorage` key `muperSario2Muted`.

## Art

Gameplay sprites are **100% procedural** (`ProceduralGen.js`) — player, pipes, **blocks**, coins, Bubas, trees, mountains, clouds, ground. Only BGM uses binary assets in v2.

### Design reference images (`examples/`)

These files informed procedural art generation. They are **not** loaded at runtime.

| File | Used for |
|------|----------|
| `examples/hand-drawn-trees-collection-set-illustration-for-infographic-or-other-uses-vector.webp` | 10 flat vector tree styles in `generateTree()` |
| `examples/vector-generated-mountains-example.png` | Low-poly faceted mountains in `generateMountain()` |
| `examples/` SMB 1-1 full-level panorama | Segment/chunk reference for Phase 10 PCG (buffer zones, pits, pipes, stairs) |

When revising procedural art, compare against these references and update `ProceduralGen.js` — do not swap in raster sprites unless DESIGN.md is updated first.

**Phase 10b note:** Generic tree underlay reverted in `generateTree()` (2026-08-12). If parallax bleed recurs, use per-style solid silhouettes — not backing ovals. See [`docs/RESEARCH-NOTES.md`](../docs/RESEARCH-NOTES.md) § Phase 10b.

## GitHub Pages

Served from repo root: https://theycallmehenry.github.io/muper-sario/

No build step — static files + ES modules. See [`docs/DOC-INDEX.md`](../docs/DOC-INDEX.md) deploy section.
