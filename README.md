# Muper Sario 2.0

Greenfield rebuild of **Muper Sario** — Super Mario Bros.–inspired HTML5 canvas platformer with procedural sprites/SFX, looping `.wav` BGM, and side-scrolling level design.

Extracts what worked in v1 and rewrites the gameplay layer that caused persistent bugs (spawn lifecycle, one-way platform collision, dual storage).

**Status (2026-08-12):** Phases 0–7 + GitHub Pages deploy complete. **Live:** https://theycallmehenry.github.io/muper-sario/

| | Local | Live |
|---|-------|------|
| Game | http://localhost:38473 | https://theycallmehenry.github.io/muper-sario/ |
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

After code changes: **Ctrl+F5** hard refresh. Entry cache bust: `GameEngine.js?v=3` in `index.html`.

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
| Level | **4800 px** world (`LEVEL_1` in `levelData.js`) |
| Win | Finish flag at **x = 4720** → LEVEL COMPLETE |
| Base score | **1 pt/coin** (25 max) + **1 pt/Buba stomp** (6 max) → **31 base max** |
| Final score (win only) | `round(base × clamp(parTime / elapsed, 0.5, 2.0))` — par **90 s** |
| Lives | 3; pits, fall off screen, or Buba side hit |
| Pits | **1680–1820**, **3480–3600** |
| Camera | 35% offset; parallax 0.1 / 0.25 / 0.5 / 1.0 |
| Physics | SMB run+jump tiers; coyote **0.15 s** ground / **0.22 s** pipe caps |
| Player sprite | Procedural; color-inverted via `ProceduralGen.invertHex()` |

**Example final scores (level 1, all collectibles):**

| Finish time | Multiplier | Final (base 31) |
|-------------|------------|-----------------|
| ≤ 45 s | 2.00× | 62 |
| 90 s (par) | 1.00× | 31 |
| ≥ 180 s | 0.50× | 16 |

Game over saves **base score only** (no time modifier).

---

## Architecture

All design decisions: [`DESIGN.md`](DESIGN.md)

- Side-scrolling world; fixed layout in `levelData.js` — no spawn timer
- One-way pipes: 76 px cap / 60 px body hitboxes
- **20** ES6 modules — no bundler
- Storage: `muperSario2Scores` (leaderboard), `muperSario2Muted` (audio)
- BGM: `assets/music/background.wav` (committed; procedural fallback if load fails)
- Menu UI: `UiText.js` panels + stroked text

---

## Project layout

```
Muper_Sario_2.0/
├── DESIGN.md · AGENTS.md · SESSION-HANDOFF.md
├── index.html · test.html
├── docs/          # DOC-INDEX, PROGRESS, QA, RESEARCH, MANIFEST, V1-PITFALLS
├── assets/music/  # background.wav (BGM, committed)
├── src/           # 20 JS modules
└── launch.bat / launch.sh
```

---

## Validation

```powershell
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

http://localhost:38473/test.html — expect **20 passed, 0 failed**.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/DOC-INDEX.md`](docs/DOC-INDEX.md) | **Master index** — all docs + locked determinations |
| [`DESIGN.md`](DESIGN.md) | Locked architecture |
| [`SESSION-HANDOFF.md`](SESSION-HANDOFF.md) | Phase status, commands |
| [`docs/PROGRESS.md`](docs/PROGRESS.md) | Task tracker + module inventory |
| [`docs/QA-FINDINGS.md`](docs/QA-FINDINGS.md) | QA bugs fixed |
| [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md) | SMB physics, scoring, geometry |
| [`docs/EXTRACTION-MANIFEST.md`](docs/EXTRACTION-MANIFEST.md) | v1 → v2 copy plan |
| [`docs/V1-PITFALLS.md`](docs/V1-PITFALLS.md) | Pitfalls checklist |
| [`assets/README.md`](assets/README.md) | BGM + mute |

---

## License

Fan-made clone for educational purposes. "Muper Sario" and "Bubas" are legally distinct names.
