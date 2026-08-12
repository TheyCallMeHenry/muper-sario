# QA Findings — Muper Sario 2.0

> **Environment:** Windows, Python `http.server` 38473, Chrome  
> **Spec:** [`DESIGN.md`](../DESIGN.md) · Tracker: [`PROGRESS.md`](PROGRESS.md)  
> **Live:** https://theycallmehenry.github.io/muper-sario/

---

## Phase 4 — Manual QA (2026-08-12, static level)

### Summary

| Test | Result |
|------|--------|
| Walk into pipe from ground | ✅ PASS |
| Jump onto pipe from beside | ✅ PASS (after fixes) |
| Walk off pipe edge | ✅ PASS |
| Fall off screen → lose life | ✅ PASS (code path) |
| Game over → name entry → leaderboard | ✅ PASS |
| test.html module load | ✅ PASS (23/23 Phase 10+) |
| `node --check` all `src/**/*.js` | ✅ PASS |

### Bugs found during QA (fixed)

#### 1. `onGround` reset before physics (critical)

**Symptom:** Jump never triggered from ground; coyote time always drained.  
**Fix:** Reset `onGround` **after** `updatePhysics()`, **before** collision resolution.

#### 2. Variable jump inverted (critical)

**Symptom:** Max jump rise ~74 px.  
**Fix:** Early-release cut (later superseded by SMB tier rise/fall gravity in Phase 7).

#### 3. Pipe cap hitbox too narrow (critical)

**Fix:** `getCapBounds()` 76 px for top landing; `getBounds()` 60 px body for sides.

#### 4. First pipe unreachable (static era)

**Fix:** Superseded by `levelData.js` in Phase 6.

#### 5. Fall death order (minor)

**Fix:** Check feet > canvas **before** ground snap.

---

## Phase 5 — Post-QA fixes (2026-08-12)

Run/sprint, jump −12.5, Bubas, BGM `.wav`, name entry keyboard, cloud/mountain port, Buba patrol fixes — all shipped. See Phase 5 log in prior revisions.

---

## Phase 6 — Side-scroll + UX (2026-08-12)

Side-scroll 4800 px, camera, parallax, level completion, coin scoring, player invert, mute, Left Shift run, UiText readability — all shipped.

### Bugs 12–14 (fixed)

- White menu text unreadable → `UiText.js` panels
- High score column outside panel → inner padding layout
- Run bound to Z / both Shifts → **Left Shift only**

---

## Phase 7 — Scoring + physics (2026-08-12 PM)

### Summary

| Area | Result |
|------|--------|
| Buba stomp score (+1) | ✅ Shipped |
| Time bonus on level win | ✅ Shipped |
| Extended coyote (pipe caps) | ✅ Shipped |
| SMB run+jump air physics | ✅ Shipped |
| Docs + deploy sync | ✅ Shipped |

### Determinations

#### 15. Stomp scoring reinstated

**Requirement:** 1 pt per enemy defeated.  
**Fix:** `SCORE_PER_BUBA: 1` in `gameConfig.js`; `addScore` on stomp in `GameScene.js`.

#### 16. Coyote too tight on pipe cap edges

**Symptom:** Walk/run off pipe tops felt unforgiving at run speed.  
**Fix:** `COYOTE_TIME` 0.15 s (ground), `COYOTE_TIME_PLATFORM` 0.22 s (pipe caps); `grantCoyoteTime()` when leaving ground after collision; `setGroundContact('platform'|'ground')`.

#### 17. Time-based final score

**Requirement:** Faster level completion → higher score multiplier.  
**Fix:** `finalScore = round(baseScore × clamp(parTime/elapsed, 0.5, 2.0))` in `completeLevel()`; par 90 s; game over saves base only.

---

## Phase 8 — Art pass + Buba hardening (2026-08-12 evening)

### Summary

| Area | Result |
|------|--------|
| Flat vector trees (10 styles) | ✅ Shipped |
| Low-poly faceted mountains | ✅ Shipped |
| Mountain hollow-center fix | ✅ Shipped |
| Buba stomp edge-case hardening | ✅ Shipped |
| Docs full sync | ✅ Shipped |

### Bugs / edge cases (fixed)

#### 18. Hollow mountain centers

**Symptom:** Sky visible through mountain middles and under snow caps (A-frame gaps).  
**Fix:** `fillMountainRangeSilhouette()` + per-peak solid triangle underlay.

#### 19. Buba stomp false-negative (fast fall)

**Fix:** Stomp band uses upper half of Buba hitbox: `feetDepth ≤ tolerance + height × 0.5`.

#### 20. Buba stomp false-positive hurt (same frame)

**Fix:** `frameDescending` + two-pass stomp then hurt.

#### 21. Transient stomp failure (user report)

**Determination:** Addressed by Phase 8 collision hardening.

---

## Phase 9 — Level polish (2026-08-12 evening)

### Summary

| Area | Result |
|------|--------|
| Player leg walk cycle (vertical) | ✅ Shipped |
| Opaque parallax trees | ✅ Shipped |
| Block entity + floating platforms | ✅ Shipped |
| Elevated coins on bricks | ✅ Shipped (11 blocks) |
| test.html Block.js | ✅ 21/21 modules |

### Bugs / issues (fixed)

#### 22. Horizontal leg splay while walking

**Symptom:** Legs extended sideways during walk/run (`legSwing` on X axis).  
**Fix:** `generatePlayer()` uses alternating vertical `leftLift` / `rightLift` under torso.

#### 23. Semi-transparent parallax trees

**Symptom:** Mountains visible through tree canopies (`alpha: 0.6–0.9`).  
**Fix:** `Background.generateForests()` sets `alpha: 1`.

#### 24. Elevated coins without platforms

**Symptom:** Coins floating in air between pipes (no SMB-style blocks below).  
**Fix:** `Block.js` + `levelData.blocks[]`; one-way top collision in `GameScene`.

#### 25. Coins too high above characters

**Symptom:** Coins above head height; user wanted ~⅔–¾ player-height feel.  
**Fix (interim):** `COIN_FLOAT_ABOVE: 34` (70% of 48 px) — superseded Phase 9b.

---

## Phase 9b — SMB scale + layout (2026-08-12 evening)

### Summary

| Area | Result |
|------|--------|
| Pipe height 96 px (2× player) | ✅ Shipped |
| Coin float 20 px above support | ✅ Shipped |
| Platform row y = 404 (3 blocks) | ✅ Shipped |
| Coin/pipe min gap 48 px | ✅ Shipped |
| Level X reposition pass | ✅ Shipped |

### Bugs / issues (fixed)

#### 26. Coins overlapping / hugging pipes

**Symptom:** Ground coin at x=780 overlapped pipe 720 cap; elevated coins within ~16 px of pipes.  
**Fix:** Repositioned coin X in `levelData.js`; documented `COIN_MIN_PIPE_GAP: 48`.

#### 27. Pipes visually too tall vs SMB reference

**Symptom:** 120 px pipes (~2.5× player) vs SMB ~2× Mario.  
**Fix:** `PIPE_HEIGHT: 96`; pipe top y = **404**.

#### 28. Coins still too high (user feedback)

**Symptom:** Even at 34 px float, coins read too high relative to player.  
**Fix:** `COIN_FLOAT_ABOVE: 20` (~⅖ player height); ground coins y=**460**, platform y=**364**.

#### 29. NES vs v2 pixel math confusion

**Determination:** SMB1 Mario ≈ 16 px, pipe ≈ 32 px on NES. v2 player 48 px = 3× scale; pipe 96 px = 2× **v2** player = 32×3 NES. Documented in RESEARCH-NOTES § SMB visual scale.

---

## Phase 10 — Procedural rogue-lite levels (2026-08-12 evening)

### Summary

| Area | Result |
|------|--------|
| 26 chunk library + socket matching | ✅ Shipped |
| LevelGenerator (Mulberry32, merge, validate) | ✅ Shipped |
| New layout every run (`createRunLevel`) | ✅ Shipped |
| `?seed=` URL reproducibility | ✅ Shipped |
| Legacy LEVEL_1 preserved (reference) | ✅ Shipped |
| test.html levelChunks + LevelGenerator | ✅ 23/23 modules |
| `node --check` all src | ✅ PASS |
| 20-seed automated validation loop | ✅ PASS |
| User manual test `?seed=42` | ✅ Reported |

### Determinations

#### 30. `?seed=` suggested before implementation

**Symptom:** User tested `http://localhost:38473/?seed=42` when param was not yet wired — runs were still random (`Date.now()`).  
**Fix:** `getRunSeedFromUrl()` in `LevelGenerator.js`; `GameScene.enter()` passes seed to `createRunLevel()`; console logs chunk sequence when seed present.

#### 31. Procedural par time vs fixed 90 s

**Determination:** Hand-placed LEVEL_1 used par **90 s**. Generated runs use `round(55 + chunks×4 + pits×6 + coins×0.5)` — typically **~95–110 s** for default 12-chunk runs. `GameScene` reads `layout.parTimeSeconds`.

#### 32. Regression seed 42 (automated)

**Expected sequence:**  
`start → pipe_single_offset → pipe_single_offset → buba_pipe → pit_small → flat_coins_5 → platform_pipe_combo → pipe_single_offset → pit_platform_bridge → block_stair → platform_double → finish`

**Verification:**

```powershell
node --input-type=module -e "import { generateValidatedLevel } from './src/utils/LevelGenerator.js'; console.log(generateValidatedLevel(42).chunkSequence.join(' -> '));"
```

---

## Phase 10b — Parallax opacity + par-time research (2026-08-12 late evening)

### Summary

| Area | Result |
|------|--------|
| Date verified before web research | ✅ Wednesday, August 12, 2026 |
| Root-cause analysis (compositor vs sprite alpha) | ✅ Documented |
| Web research (MDN, Godot, FreePixel, canvas compositing) | ✅ Documented in RESEARCH-NOTES §10b |
| Interim underlay + flattenTreeAlpha | ⚠️ Attempted · **rejected by user** · **reverted 2026-08-12** |
| TitleScene mountain/tree compositor alpha | ✅ Fixed (draw at alpha 1) |
| Background save/restore per element | ✅ Shipped |
| Cache bust `GameEngine.js?v=5` | ✅ Shipped |
| Dynamic par-time hybrid formula | 🔬 Researched · **not implemented** |
| User manual test `?seed=42` (post-Phase 10) | ✅ Layout verified |
| User request: remove green oval underlay | ✅ Reverted in `ProceduralGen.generateTree()` |
| Full doc sync (17 markdown files) | ✅ Complete (post-revert pass) |

### Bugs / issues

#### 33. Semi-transparent trees / parallax bleed (partially addressed)

**Symptom:** Mountains visible through tree canopies during gameplay and title backdrop; reads as semi-transparent foliage.  
**Initial diagnosis (Phase 9):** `Background` forest draw used reduced alpha — fixed with `alpha: 1`.  
**Re-test (Phase 10b):** Sprite bake gaps persist on puff/scallop styles; user screenshot also showed dark-green oval backings from interim fix.  
**Root cause:** (1) **Sprite pixel alpha** — gaps between puff/scallop circles in baked canvas; anti-aliased fringe pixels; (2) was also **TitleScene compositor alpha** on trees/mountains. Compositor-only fix insufficient.  
**Interim attempt (#34):** Generic underlay blocked holes but looked wrong — reverted.  
**Research:** See RESEARCH-NOTES § Phase 10b parallax opacity.  
**Status:** **OPEN (conditional)** — per-style solid silhouettes **only if** bleed-through recurs after underlay revert; compositor hygiene complete.

#### 34. Interim fix rejected — generic green oval underlay (reverted)

**Attempt:** `drawTreeOpaqueUnderlay()` + `flattenTreeAlpha()` in `ProceduralGen.generateTree()`.  
**Symptom:** Fully opaque dark-green ellipse visible behind each style’s distinct canopy colors/shapes — not acceptable art.  
**Verdict:** **Rejected.** User explicitly requested removal of green round/oval background while preserving style-specific tree tops.  
**Fix (2026-08-12):** Removed both helpers and their calls from `generateTree()`; deleted from `ProceduralGen.js`. Cache bust `v=5`.  
**Long-term (if bleed returns):** Style-native solid silhouettes (same pattern as mountain `fillMountainRangeSilhouette`).  
**Documented:** RESEARCH-NOTES §10b troubleshooting table.  
**Status:** **FIXED (reverted)** — do not reintroduce generic underlay.

#### 35. Par time heuristic vs procedural difficulty (research)

**Symptom:** Fixed-ish par from chunk counts may not match actual traversal time on random layouts.  
**User proposal:** `(finishX − spawnX) / walkSpeed + 10 s`.  
**Determination:** Directionally correct; insufficient alone (ignores pits, vertical cost, detours).  
**Recommendation:** Hybrid ground-path formula in `LevelGenerator` — RESEARCH-NOTES § Dynamic par time.  
**Status:** **OPEN** — not implemented.

### Troubleshooting log (tree opacity)

| Step | Action | Outcome |
|------|--------|---------|
| 1 | Set `Background` forest `alpha: 1` (Phase 9) | Partial improvement |
| 2 | Browser screenshot + pixel sampling at `?seed=42` | Confirmed holes + fringe in tree canvas |
| 3 | Generic `drawTreeOpaqueUnderlay` ellipse | Blocks holes; ugly visible backing |
| 4 | `flattenTreeAlpha()` post-pass | Fringe → 255; holes remain without underlay |
| 5 | TitleScene remove tree/mountain compositor alpha | Correct compositor hygiene |
| 6 | `GameEngine.js?v=4` cache bust | Ensures module reload locally |
| 7 | **Revert** underlay + flatten; delete helpers (user request) | Green ovals removed; style tops preserved |
| 8 | `GameEngine.js?v=5` cache bust | Post-revert module reload |

### Verification (post-revert)

| Check | Result |
|-------|--------|
| `drawTreeOpaqueUnderlay` in served `ProceduralGen.js` | ✅ Absent |
| `flattenTreeAlpha` in served `ProceduralGen.js` | ✅ Absent |
| `node --check` all `src/**/*.js` | ✅ PASS |
| Browser import test (`typeof drawTreeOpaqueUnderlay`) | ✅ `undefined` |

---

## Verified behaviors (current)

| Behavior | Detail |
|----------|--------|
| Level generation | **Procedural** each run; 12 chunks × 400 px = 4800 px default |
| Seed URL | `?seed=42` → deterministic layout; console logs chunk sequence |
| Side scroll | Camera follows player; world width from generated layout |
| Parallax | Mountains 0.1×, clouds 0.25×, trees 0.5×, ground 1.0× |
| Pits | Per-chunk ground gaps + optional `gap_start`/`gap_span`/`gap_end` |
| Level win | `player.x + width >= finishX` (`width − 80`) → LEVEL COMPLETE |
| Base score | 1 pt/coin + 1 pt/Buba stomp (counts vary per run) |
| Final score (win) | `base × clamp(parTime/elapsed, 0.5, 2.0)` — par from layout |
| Coyote | 0.15 s ground / 0.22 s pipe cap; jump buffer 0.1 s |
| Run+jump | `airRunJump` preserves run cap; tier gravity by takeoff speed |
| Run | Left Shift; max 5.75; RunningTimer 10 frames |
| Buba stomp | Defeat + bounce + **1 pt**; two-pass collision; expanded stomp band |
| Buba side | Lose life (invincibility respected) |
| Parallax trees | 10 flat vector styles at 0.5×; compositor **alpha = 1**; generic underlay **reverted**; per-style silhouettes if bleed returns (§ Phase 10b) |
| Floating blocks | SMB bricks; one-way top; in chunk definitions |
| Pipes | 96 px tall (2× player); top y = 404 |
| Coins | 20 px above support; generator validates ≥48 px from pipe caps |
| Parallax mountains | Low-poly faceted at 0.1×; opaque silhouette |
| Storage | `muperSario2Scores`; top 10 |
| Mute | `muperSario2Muted`; pauses BGM + silences SFX |
| Deploy | GitHub Pages from `main` root |
| Module test | **23/23** imports in test.html |

---

## Cache note

`index.html` cache-busts `GameEngine.js?v=5`. Submodule edits require **Ctrl+F5**. Bump `?v=` when changing the entry script.
