# Documentation Index — Muper Sario 2.0

> **Last synced:** 2026-08-12 (post-deploy)  
> **Live:** https://theycallmehenry.github.io/muper-sario/ · **Repo:** https://github.com/TheyCallMeHenry/muper-sario

This index maps every project document to its role and lists locked determinations in one place.

---

## Document map

| Document | Audience | Contents |
|----------|----------|----------|
| [`README.md`](../README.md) | Humans | Quick start, controls, gameplay summary, validation |
| [`DESIGN.md`](../DESIGN.md) | Implementers | **Locked architecture** — collision, physics, scoring, deploy |
| [`AGENTS.md`](../AGENTS.md) | AI agents | Session rules, paths, ports, doc read order |
| [`SESSION-HANDOFF.md`](../SESSION-HANDOFF.md) | AI agents | Current phase, shipped state, next steps (≤80 lines) |
| [`docs/PROGRESS.md`](PROGRESS.md) | Trackers | Phase checklist, module inventory, v2 fix IDs |
| [`docs/QA-FINDINGS.md`](QA-FINDINGS.md) | QA | Manual test results, bugs found/fixed by phase |
| [`docs/RESEARCH-NOTES.md`](RESEARCH-NOTES.md) | Design | SMB physics research, geometry, scoring, storage |
| [`docs/EXTRACTION-MANIFEST.md`](EXTRACTION-MANIFEST.md) | Migration | v1 copy vs rewrite checklist |
| [`docs/V1-PITFALLS.md`](V1-PITFALLS.md) | Prevention | Do-not-repeat checklist (D-001…D-024) |
| [`assets/README.md`](../assets/README.md) | Assets | BGM path, mute, Pages note |
| `src/*/README.md` | Module scope | Per-directory roles (config, core, entities, scenes, utils, styles) |

**v1 archive (read-only):** `D:\Apps\Laguna-S-2.1-MuperSario` · full research log in v1 `docs/RESEARCH-FINDINGS.md`

---

## Locked determinations (current)

### Runtime

| Item | Value |
|------|-------|
| Canvas | 800 × 600 viewport |
| World (LEVEL_1) | 4800 px wide |
| Local port | **38473** (v1 = 38472) |
| Modules | **20** ES6 files, no bundler |
| Fixed timestep | 60 Hz (`GameEngine`) |
| Cache bust | `GameEngine.js?v=3` |

### Scoring

| Event | Points |
|-------|--------|
| Coin collected | +1 (`SCORE_PER_COIN`) |
| Buba stomped | +1 (`SCORE_PER_BUBA`) |
| Level win time bonus | Multiplier on base only |

**Final score (level complete):**

```
multiplier = clamp(parTimeSeconds / levelElapsed, 0.5, 2.0)
finalScore = round(baseScore × multiplier)
```

- Level 1 par: **90 s** (`LEVEL_1.parTimeSeconds`)
- Max base on level 1: **31** (25 coins + 6 Bubas)
- Max final (all collectibles, ≤45 s): **62**
- Game over: saves **base score only**

### Physics (summary)

| System | Key values |
|--------|------------|
| Walk / run | 3.5 / 5.75 px/frame |
| Jump | −12.5 initial vy; tier rise/fall gravity |
| Coyote | 0.15 s ground · **0.22 s pipe cap** · 0.1 s jump buffer |
| Run key | **Left Shift only** |
| SMB run+jump | `airRunJump`, `airFastMomentum`, `jumpSpeedTier` 0–2 |

Full tables: [`RESEARCH-NOTES.md`](RESEARCH-NOTES.md) · [`DESIGN.md`](../DESIGN.md)

### Storage

| Key | Purpose |
|-----|---------|
| `muperSario2Scores` | Top 10 leaderboard `{score, name, date}[]` |
| `muperSario2Muted` | `"true"` / `"false"` audio mute |

### Deploy

| Setting | Value |
|---------|-------|
| Host | GitHub Pages |
| Source | `main` branch, `/` root |
| Static | `.nojekyll` present; ES modules over HTTPS |
| BGM on Pages | `assets/music/background.wav` **committed** |

---

## Phase history (shipped)

| Phase | Deliverable |
|-------|-------------|
| 0 | Scaffold, DESIGN, launch scripts |
| 1 | Copy proven v1 modules |
| 2 | Rewrite Player, Pipe, GameScene, config |
| 3 | index.html, test.html, wiring |
| 4 | Manual QA (static level era) |
| 5 | Run, Bubas, BGM, name entry, visuals |
| 6 | Side-scroll 4800 px, camera, parallax, UiText, mute |
| 7 | SMB run+jump, coyote, stomp score, time bonus |
| 4b | GitHub + Pages deploy |

---

## Research sources (cited in repo)

| Topic | Source |
|-------|--------|
| SMB1 movement | [SMBpedia Movement](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html) |
| SMB1 run+jump port | [mitxela SMB1](https://mitxela.com/projects/console/mario) (Jdaster64 flowchart) |
| One-way platforms | MDN collision · Bugnet article |
| Keyboard codes | MDN KeyboardEvent.code |
| Clouds | FlappyBird `Sky.js` (ThinkingCap port) |

---

## Validation commands

```powershell
cd D:\Apps\Muper_Sario_2.0
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

- Local test: http://localhost:38473/test.html → **20/20**
- Live test: https://theycallmehenry.github.io/muper-sario/test.html → **20/20**
