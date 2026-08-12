# Muper Sario 2.0 — Progress Tracker

> **Last Updated:** 2026-08-12 (PM — deploy)  
> **Manifest:** [`EXTRACTION-MANIFEST.md`](EXTRACTION-MANIFEST.md)  
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

---

## Phase 7 — Scoring + physics (complete 2026-08-12 PM)

- [x] **SCORE_PER_BUBA** — 1 pt per stomp (`GameScene.js`)
- [x] **Time bonus** — `final = round(base × clamp(par/elapsed, 0.5, 2.0))` on level win only
- [x] `LEVEL_1.parTimeSeconds` = 90; `MathUtils.computeTimeScoreMultiplier` + `formatTime`
- [x] Level complete overlay: TIME, BASE × multiplier, FINAL SCORE
- [x] **Coyote** — 0.15 s ground / 0.22 s pipe cap; `grantCoyoteTime()` on ledge leave
- [x] **SMB run+jump** — air run cap, tier gravity, air fast/slow accel (`Player.js`)
- [x] Docs synced: DESIGN, RESEARCH-NOTES, QA, README, AGENTS, SESSION-HANDOFF

---

## Phase 6 — Side-scroll + UX (complete 2026-08-12)

- [x] `levelData.js` — LEVEL_1: 4800 px, pits, 11 pipes, 25 coins, 6 Bubas, finish flag
- [x] Camera follow (35% offset) + parallax background + scrolling ground
- [x] Level completion at finish flag → LEVEL COMPLETE flow
- [x] Player sprite color inversion (`ProceduralGen.invertHex`)
- [x] `UiText.js` — readable menu panels + stroked canvas text
- [x] Mute button — `muperSario2Muted`; Left Shift run; RunningTimer 10 frames

---

## Phase 4b — Deploy (complete 2026-08-12 PM)

- [x] Git init + push to https://github.com/TheyCallMeHenry/muper-sario `main`
- [x] GitHub Pages from `main` / root (existing config)
- [x] ES module paths verified (no bundler)
- [x] Cache bust `GameEngine.js?v=3`
- [ ] Optional: commit `assets/music/background.wav` for BGM on Pages

---

## Module inventory (20)

| Module | Role |
|--------|------|
| `src/config/gameConfig.js` | Physics, camera, scoring, coyote, time bonus, colors |
| `src/config/levelData.js` | LEVEL_1 layout + `parTimeSeconds` |
| `src/utils/MathUtils.js` | clamp, time-score multiplier, formatTime |
| `src/utils/UiText.js` | Canvas menu panels + stroked text |
| `src/utils/ProceduralGen.js` | Procedural sprites; invertHex player |
| `src/utils/Storage.js` | `muperSario2Scores` leaderboard |
| `src/core/Renderer.js` | Canvas clear + dispatch |
| `src/core/InputManager.js` | Keyboard; Left Shift run; name-entry queue |
| `src/core/AudioManager.js` | Web Audio SFX; HTMLAudio BGM; mute |
| `src/core/SceneManager.js` | title / game / high_scores |
| `src/core/GameEngine.js` | Main loop, HUD, `addScore` / `setScore` |
| `src/entities/Player.js` | SMB physics, coyote, run+jump tiers |
| `src/entities/Pipe.js` | One-way platform collision |
| `src/entities/Buba.js` | Ground-patrol enemy |
| `src/entities/Ground.js` | Segmented ground + pits |
| `src/entities/Background.js` | Camera parallax |
| `src/entities/Coin.js` | Collectibles |
| `src/scenes/TitleScene.js` | Main menu |
| `src/scenes/GameScene.js` | Gameplay, scoring, level completion |
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
