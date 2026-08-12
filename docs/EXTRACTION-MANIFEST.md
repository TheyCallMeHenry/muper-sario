# Extraction Manifest — v1 → v2

> **Purpose:** Surgical copy vs rewrite checklist for greenfield extraction  
> **Source:** `D:\Apps\Laguna-S-2.1-MuperSario` (read-only)  
> **Target:** `D:\Apps\Muper_Sario_2.0`  
> **Updated:** 2026-08-12 — Phases 0–10 complete · Phase 10b research + underlay revert · docs synced

Execute in order. **Do not copy** files marked REWRITE.

---

## Phase 0 — Scaffold ✅

Directory tree, DESIGN.md, AGENTS.md, launch scripts (port **38473**), docs scaffold.

---

## Phase 1 — Copy (proven, low coupling) ✅

ProceduralGen, AudioManager, InputManager, SceneManager, GameEngine, Renderer, Background, Ground, Coin, TitleScene, HighScoresScene, style.css, launch scripts — see prior revision for full table.

---

## Phase 2 — Rewrite ✅

gameConfig, levelData, Player, Pipe, GameScene, Storage, MathUtils, UiText, index.html, test.html, Buba.js.

---

## Phases 3–6 ✅

Integration, QA, polish, side-scroll level, UX, mute, Left Shift run — see [`PROGRESS.md`](PROGRESS.md).

---

## Phase 7 — Scoring + SMB physics ✅

| Change | Module |
|--------|--------|
| Stomp score + time bonus | `gameConfig.js`, `GameScene.js`, `GameEngine.setScore` |
| Coyote platform extension | `Player.js`, `GameScene.js` |
| SMB run+jump tiers | `Player.js`, `gameConfig.js` |
| Time multiplier helpers | `MathUtils.js`, `levelData.js` (`parTimeSeconds`) |

---

## Phase 4b — Deploy ✅

- GitHub: https://github.com/TheyCallMeHenry/muper-sario
- Pages: https://theycallmehenry.github.io/muper-sario/ (branch `main`, path `/`)
- Cache bust: `GameEngine.js?v=5`

---

## Phase 8 — Art + Buba hardening ✅

| Change | Module |
|--------|--------|
| 10 flat vector tree styles | `ProceduralGen.js` |
| Low-poly mountains + silhouette fix | `ProceduralGen.js` |
| Buba stomp band + two-pass collision | `Buba.js`, `GameScene.js` |
| Design reference images | `assets/examples/` |
| Full doc sync | all `docs/`, README, DESIGN, AGENTS, SESSION-HANDOFF |

---

## Phase 9 — Level polish ✅

| Change | Module |
|--------|--------|
| Vertical leg walk cycle | `ProceduralGen.generatePlayer()` |
| Opaque parallax trees (compositor) | `Background.js` — generic underlay reverted Phase 10b |
| `Block.js` entity | `src/entities/Block.js` (new) |
| `generateBlock()` | `ProceduralGen.js` |
| Floating platforms in level | `levelData.js`, `GameScene.js` |
| Buba block patrol | `Buba.js` |
| test.html +1 module | `Block.js` → **21** modules |

---

## Phase 9b — SMB scale ✅

| Change | Module |
|--------|--------|
| Pipe height 96 px (2× player) | `gameConfig.js` |
| Coin float 20 px; min pipe gap 48 px | `gameConfig.js`, `levelData.js` |
| Platform row y = 404 (3 blocks) | `levelData.js` |
| Coin X reposition pass | `levelData.js` |
| SMB scale documentation | `RESEARCH-NOTES.md`, `DOC-INDEX.md`, `DESIGN.md` |

---

## Phase 10 — Procedural rogue-lite levels ✅

| Change | Module |
|--------|--------|
| 26 socket-matched chunks | `levelChunks.js` (new) |
| Seeded level assembly + validation | `LevelGenerator.js` (new) |
| Run factory + legacy LEVEL_1 | `levelData.js` |
| Procedural load on enter + seed URL | `GameScene.js` |
| PCG research documentation | `RESEARCH-NOTES.md`, `DOC-INDEX.md` |
| Architecture lock | `DESIGN.md` |
| test.html +2 imports | **23** modules |
| Full doc sync | all project markdown |

---

## Phase 10b — Parallax opacity + par-time research (2026-08-12 late evening)

| Change | Module / doc |
|--------|----------------|
| Web research + root-cause analysis | `RESEARCH-NOTES.md` §10b |
| QA bugs #33–35, troubleshooting log | `QA-FINDINGS.md` |
| Interim underlay attempt (**rejected**) | `ProceduralGen.js` — **reverted 2026-08-12** |
| TitleScene compositor alpha fix | `TitleScene.js` |
| Background save/restore | `Background.js` |
| Cache bust v=5 | `index.html` |
| Hybrid par-time spec (not coded) | `RESEARCH-NOTES.md`, `DESIGN.md` |
| Full doc sync | all project markdown (post-revert pass) |

**Pending implementation:** per-style tree silhouettes (if parallax bleed returns); ground-path `parTimeSeconds`.

---

## Verification gates

```powershell
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

http://localhost:38473/test.html → **23 passed, 0 failed**

Live: https://theycallmehenry.github.io/muper-sario/test.html
