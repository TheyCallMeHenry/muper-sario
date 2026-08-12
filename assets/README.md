# assets/

Static assets for Muper Sario 2.0.

## Background music

Place your looping `.wav` file at:

```
assets/music/background.wav
```

Music loads **only when gameplay starts**, via `HTMLAudioElement`. If missing, procedural BGM fallback runs.

**IDM note:** Add `localhost:38473` to Internet Download Manager exclusions if `.wav` is intercepted locally.

## Mute control

**Mute** button (top-left HUD) pauses/resumes BGM and silences SFX. Persists in `localStorage` key `muperSario2Muted`.

## Art

Gameplay sprites are **100% procedural** (`ProceduralGen.js`). Only BGM uses binary assets in v2.

## GitHub Pages

Optional: commit `assets/music/background.wav` to the repo for BGM on https://theycallmehenry.github.io/muper-sario/
