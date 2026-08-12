# Muper Sario 2.0 — Progress Tracker

> **Last Updated:** 2026-08-12 late evening (Phase 10b underlay revert + full doc sync)  
> **Index:** [`DOC-INDEX.md`](DOC-INDEX.md) · **Manifest:** [`EXTRACTION-MANIFEST.md`](EXTRACTION-MANIFEST.md)  
> **QA report:** [`QA-FINDINGS.md`](QA-FINDINGS.md)  
> **Live:** https://theycallmehenry.github.io/muper-sario/

---

## Phase overview

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Directory scaffold + foundation docs | ✅ Complete |
| 1 | Copy proven v1 modules | ✅ Complete |
| 2 | Rewrite gameplay core | ✅ Complete |
| 3 | Entry points + test.html + syntax check | ✅ Complete |
| 4 | Manual QA (static level) | ✅ Complete (2026-08-12) |
| 5 | Gameplay polish + post-QA fixes | ✅ Complete (2026-08-12) |
| 6 | Side-scroll level + UX/audio polish | ✅ Complete (2026-08-12) |
| 7 | SMB run+jump + scoring + coyote | ✅ Complete (2026-08-12 PM) |
| 4b | GitHub repo + Pages deploy | ✅ Complete (2026-08-12 PM) |
| 8 | Art pass (trees/mountains) + Buba stomp hardening | ✅ Complete (2026-08-12 evening) |
| **9** | **Level polish: legs, trees, blocks, coin platforms** | ✅ Complete (2026-08-12 evening) |
| **9b** | **SMB scale: pipe height, coin height/spacing** | ✅ Complete (2026-08-12 evening) |
| **10** | **Procedural rogue-lite levels (26 chunks, generator, seed URL)** | ✅ Complete (2026-08-12 evening) |
| **10b** | **Parallax opacity + par-time research; underlay revert; doc sync** | 🔬 Research complete · underlay reverted · silhouettes/par-time pending |

---

## Phase 10b — Research + underlay revert (2026-08-12 late evening)

- [x] Verify date before web research (2026-08-12)
- [x] Web research — canvas compositor vs sprite alpha, parallax depth, flat-vector silhouettes
- [x] Root-cause analysis — tree canopy gaps, TitleScene compositor alpha, anti-aliased fringe
- [x] Troubleshooting log — underlay attempt documented as **rejected**
- [x] Dynamic par-time analysis — user proposal + recommended hybrid formula
- [x] **Revert** `drawTreeOpaqueUnderlay` / `flattenTreeAlpha` in `ProceduralGen.js` (user request 2026-08-12)
- [x] Cache bust `GameEngine.js?v=5`
- [x] Full project doc sync (17 markdown files — post-revert pass)
- [ ] **Implement** per-style solid tree silhouettes if parallax bleed persists (RESEARCH-NOTES §10b)
- [ ] **Implement** ground-path hybrid `parTimeSeconds` in `LevelGenerator.js`

---

## Phase 10 — Procedural levels (complete 2026-08-12 evening)

- [x] **`levelChunks.js`** — 26 socket-matched 400 px segments (`solid` / `open` edges)
- [x] **`LevelGenerator.js`** — Mulberry32 seed, weighted pick, difficulty curve, merge + validate
- [x] **`createRunLevel()`** — factory in `levelData.js`; legacy `LEVEL_1` preserved
- [x] **`GameScene.enter()`** — new layout each run; `getRunSeedFromUrl()` for `?seed=`
- [x] **Console log** — chunk sequence when seed param present
- [x] **Research** — PCG section in RESEARCH-NOTES (scene stitching, Spelunky model, cited sources)
- [x] **DESIGN.md** — level structure locked to procedural assembly
- [x] **test.html** — +2 modules (`levelChunks.js`, `LevelGenerator.js`) → **23** total
- [x] **Automated smoke** — 20 seeds pass `validateLevel()`; seed 42 regression sequence documented
- [x] **User QA** — manual test via `http://localhost:38473/?seed=42`

---

## Phase 9b — SMB scale (complete 2026-08-12 evening)

- [x] **Pipe height** 120 → **96 px** (2× player; SMB ratio)
- [x] **Coin float** 34 → **20 px** above support (`COIN_FLOAT_ABOVE`)
- [x] **Platform row** at y = **404** (3 × 32 px blocks above ground)
- [x] **Coin/pipe spacing** — repositioned coins; `COIN_MIN_PIPE_GAP` = 48 px
- [x] Documented NES ↔ v2 scale mapping in RESEARCH-NOTES + DOC-INDEX

---

## Phase 9 — Level polish (complete 2026-08-12 evening)

- [x] **Player legs** — vertical walk-cycle lift (no horizontal splay) in `generatePlayer()`
- [x] **Trees** — compositor `alpha: 1` in `Background.js` (Phase 9); generic underlay **reverted** (Phase 10b)
- [x] **`Block.js`** — 32×32 SMB brick; one-way top collision
- [x] **`generateBlock()`** in ProceduralGen
- [x] **11 floating blocks** under elevated coins in `levelData.js`
- [x] **GameScene** — block collision + render; unified pipe/block platform loop
- [x] **Buba** — patrol respects block tops + side collision
- [x] **test.html** — Block.js import (21 modules)

---

## Phase 8 — Art + Buba hardening (complete 2026-08-12 evening)

- [x] **Trees** — 10 flat vector styles in `ProceduralGen.generateTree()` (seed-picked)
- [x] **Mountains** — low-poly faceted `generateMountain()`; unified silhouette fill
- [x] Design refs under `assets/examples/` (webp + png; not runtime-loaded)
- [x] **Buba stomp** — expanded stomp band; `frameDescending`; two-pass stomp/hurt
- [x] Docs synced

---

## Phase 7 — Scoring + physics (complete 2026-08-12 PM)

- [x] **SCORE_PER_BUBA** — 1 pt per stomp
- [x] **Time bonus** — `final = round(base × clamp(par/elapsed, 0.5, 2.0))` on level win only
- [x] **Coyote** — 0.15 s ground / 0.22 s platform
- [x] **SMB run+jump** — air run cap, tier gravity, air fast/slow accel

---

## Phase 6 — Side-scroll + UX (complete 2026-08-12)

- [x] `levelData.js` — LEVEL_1 reference layout (superseded at runtime by Phase 10 generator)
- [x] Camera follow (35% offset) + parallax + scrolling ground
- [x] Level completion at finish flag
- [x] Player sprite color inversion; UiText; mute; Left Shift run

---

## Phase 4b — Deploy (complete 2026-08-12 PM)

- [x] Cache bust `GameEngine.js?v=5`
- [x] `background.wav` committed; test.html on Pages

---

## Module inventory (23)

| Module | Role |
|--------|------|
| `src/config/gameConfig.js` | Physics, camera, scoring, coyote, SMB scale constants |
| `src/config/levelData.js` | `createRunLevel()` factory; legacy `LEVEL_1` reference |
| `src/config/levelChunks.js` | 26 interlocking 400 px chunk definitions (sockets, weights) |
| `src/utils/LevelGenerator.js` | Seeded assembly, validation, `getRunSeedFromUrl()` |
| `src/utils/MathUtils.js` | clamp, time-score multiplier, formatTime |
| `src/utils/UiText.js` | Canvas menu panels + stroked text |
| `src/utils/ProceduralGen.js` | Sprites; trees (10 styles; underlay reverted); mountains; blocks; leg cycle |
| `src/utils/Storage.js` | `muperSario2Scores` leaderboard |
| `src/core/Renderer.js` | Canvas clear + dispatch |
| `src/core/InputManager.js` | Keyboard; Left Shift run; name-entry queue |
| `src/core/AudioManager.js` | Web Audio SFX; HTMLAudio BGM; mute |
| `src/core/SceneManager.js` | title / game / high_scores |
| `src/core/GameEngine.js` | Main loop, HUD, scoring |
| `src/entities/Player.js` | SMB physics, coyote, run+jump tiers |
| `src/entities/Pipe.js` | One-way platform collision (76 px cap / 60 px body) |
| `src/entities/Block.js` | SMB floating brick platform (32×32) |
| `src/entities/Buba.js` | Ground-patrol; stomp detection; block-aware patrol |
| `src/entities/Ground.js` | Segmented ground + pits |
| `src/entities/Background.js` | Parallax; compositor α=1; save/restore per element |
| `src/entities/Coin.js` | Collectibles |
| `src/scenes/TitleScene.js` | Main menu |
| `src/scenes/GameScene.js` | Gameplay; procedural level load; pipe+block collision; time bonus |
| `src/scenes/HighScoresScene.js` | Leaderboard |

---

## v2 fixes vs v1 (shipped)

| ID | Fix |
|----|-----|
| D-001 | test.html valid HTML + `./src/` paths |
| D-002/D-003 | Fixed level objects — no spawn timer |
| D-004 | One-way platform (ascending pass-through, cap landing) |
| D-012 | Unified Storage (`muperSario2Scores`) |
| D-019 | onGround reset after physics, before animation |
| — | Side-scroll, pits, level win, parallax, UiText, mute |
| — | SMB run+jump, coyote, stomp score, time bonus |
| — | Flat vector trees, low-poly mountains, Buba stomp hardening |
| — | Floating blocks, SMB pipe/coin scale, leg animation, opaque trees |
| — | Procedural chunk levels, LevelGenerator, `?seed=` reproducible runs |
| — | Phase 10b: parallax opacity research; underlay reverted; par-time hybrid pending |
