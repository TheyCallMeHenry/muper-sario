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

Gameplay sprites are **100% procedural** (`ProceduralGen.js`). Only BGM uses binary assets in v2.

## GitHub Pages

Served from repo root: https://theycallmehenry.github.io/muper-sario/

No build step — static files + ES modules. See [`docs/DOC-INDEX.md`](../docs/DOC-INDEX.md) deploy section.
