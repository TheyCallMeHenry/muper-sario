# Extraction Manifest — v1 → v2

> **Purpose:** Surgical copy vs rewrite checklist for greenfield extraction  
> **Source:** `D:\Apps\Laguna-S-2.1-MuperSario` (read-only)  
> **Target:** `D:\Apps\Muper_Sario_2.0`  
> **Updated:** 2026-08-12 — Phases 0–7 complete · deployed to GitHub Pages

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
- Cache bust: `GameEngine.js?v=3`

---

## Verification gates

```powershell
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

http://localhost:38473/test.html → **20 passed, 0 failed**

Live: https://theycallmehenry.github.io/muper-sario/test.html
