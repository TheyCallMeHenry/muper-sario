# Muper Sario 2.0

Greenfield rebuild of **Muper Sario** — Super Mario Bros.–inspired HTML5 canvas platformer with procedural sprites/SFX, looping `.wav` BGM, and side-scrolling level design.

Extracts what worked in v1 and rewrites the gameplay layer that caused persistent bugs (spawn lifecycle, one-way platform collision, dual storage).

**Status (2026-08-12):** Phases 0–10 complete. **Phase 10b** research complete; generic tree underlay **reverted**; per-style silhouettes + par-time hybrid **pending**. **Live:** https://theycallmehenry.github.io/muper-sario/

| | Local | Live |
|---|-------|------|
| Game | http://localhost:38473 | https://theycallmehenry.github.io/muper-sario/ |
| Reproducible run | http://localhost:38473/?seed=42 | same query on live URL |
| Module test | http://localhost:38473/test.html | https://theycallmehenry.github.io/muper-sario/test.html |
| Repo | `D:\Apps\Muper_Sario_2.0` | https://github.com/TheyCallMeHenry/muper-sario |

---

## Quick start

**Windows:**

```powershell
cd D:\Apps\Muper_Sario_2.0
.\launch.bat
```

**Linux/Mac:** `./launch.sh`

**Manual:** `python -m http.server 38473 --bind 127.0.0.1`

v1 archive uses port **38472** — do not use that port for v2.

After code changes: **Ctrl+F5** hard refresh. Entry cache bust: `GameEngine.js?v=5` in `index.html`.

---

## Controls

| Input | Action |
|-------|--------|
| ← / → | Move |
| **Left Shift** | Run (SMB B-button) |
| **Space** or **↑** | Jump |
| **Mute** (top-left) | Toggle all audio |
| Initials entry | A–Z / 0–9 · ←/→ · ↑/↓ · Backspace/Delete · Space/Enter save |

---

## Gameplay

| Feature | Detail |
|---------|--------|
| Level | **Procedural** — **12** chunks × **400 px** = **4800 px** per run (`LevelGenerator.js`) |
| Chunk library | **26** socket-matched segments in `levelChunks.js` (new layout every run) |
| Reproducible runs | `?seed=42` (numeric or string); logs chunk sequence to browser console |
| Win | Reach finish flag (`finishX = width − 80`) → LEVEL COMPLETE |
| Base score | **1 pt/coin** + **1 pt/Buba stomp** (counts vary per generated layout) |
| Final score (win only) | `round(base × clamp(parTime / elapsed, 0.5, 2.0))` — par **derived per run** (interim heuristic; hybrid formula planned — see RESEARCH-NOTES §10b) |
| Lives | 3; pits, fall off screen, or Buba side hit |
| Pits | Internal chunk gaps + multi-chunk `gap_start` / `gap_span` / `gap_end` sequences |
| Camera | 35% offset; parallax 0.1 / 0.25 / 0.5 / 1.0 |
| Physics | SMB run+jump tiers; coyote **0.15 s** ground / **0.22 s** platforms |
| SMB scale | Player **48 px**; pipes **96 px** (2×); blocks **32 px**; platform row **3 blocks** up |
| Coins | **20 px** above support; generator validates **≥ 48 px** from pipe caps |
| Legacy layout | Hand-placed `LEVEL_1` in `levelData.js` (reference only — not used at runtime) |
| Player sprite | Procedural; inverted palette; vertical leg walk cycle |
| Parallax art | Low-poly mountains (0.1×); flat vector trees (0.5×); compositor α=1; generic underlay reverted |
| Buba stomp | Two-pass collision; expanded stomp band; frame-start descending check |

Game over saves **base score only** (no time modifier). Use `?seed=N` to reproduce a layout for debugging (chunk sequence logged to console on run start).

---

## Architecture

All design decisions: [`DESIGN.md`](DESIGN.md)

- Side-scrolling world; **procedural chunk assembly** (`levelChunks.js` + `LevelGenerator.js`) — no spawn timer
- One-way platforms: pipes (76 px cap / 60 px body) + floating blocks (32×32 brick)
- **23** ES6 modules — no bundler
- Storage: `muperSario2Scores` (leaderboard), `muperSario2Muted` (audio)
- BGM: `assets/music/background.wav` (committed; procedural fallback if load fails)
- Menu UI: `UiText.js` panels + stroked text
- Art refs (design only): `assets/examples/` — tree + mountain reference images

---

## Project layout

```
Muper_Sario_2.0/
├── DESIGN.md · AGENTS.md · SESSION-HANDOFF.md
├── index.html · test.html
├── docs/          # DOC-INDEX, PROGRESS, QA, RESEARCH, MANIFEST, V1-PITFALLS
├── assets/
│   ├── music/     # background.wav (BGM, committed)
│   └── examples/  # design reference images + SMB 1-1 panorama (not runtime-loaded)
├── src/           # 23 JS modules
└── launch.bat / launch.sh
```

---

## Validation

```powershell
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

http://localhost:38473/test.html — expect **23 passed, 0 failed**.

Optional generator smoke test:

```powershell
node --input-type=module -e "import { generateValidatedLevel } from './src/utils/LevelGenerator.js'; console.log(generateValidatedLevel(42).chunkSequence.join(' -> '));"
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/DOC-INDEX.md`](docs/DOC-INDEX.md) | **Master index** — all docs + locked determinations |
| [`DESIGN.md`](DESIGN.md) | Locked architecture |
| [`SESSION-HANDOFF.md`](SESSION-HANDOFF.md) | Phase status, commands |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Task tracker + module inventory |
| [`docs/QA-FINDINGS.md`](docs/QA-FINDINGS.md) | QA bugs fixed |
| [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md) | SMB physics, PCG, **Phase 10b opacity + par-time research** |
| [`docs/EXTRACTION-MANIFEST.md`](docs/EXTRACTION-MANIFEST.md) | v1 → v2 copy plan |
| [`docs/V1-PITFALLS.md`](docs/V1-PITFALLS.md) | Pitfalls checklist |
| [`assets/README.md`](assets/README.md) | BGM + mute |

---

## License

Fan-made clone for educational purposes. "Muper Sario" and "Bubas" are legally distinct names.
