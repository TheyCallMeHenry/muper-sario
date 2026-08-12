# Research Notes — Muper Sario 2.0

> Curated from v1 research + v2 validation (2026-08-12, updated evening Phases 8–10)  
> **Live:** https://theycallmehenry.github.io/muper-sario/  
> Full v1 log: `D:\Apps\Laguna-S-2.1-MuperSario\docs\RESEARCH-FINDINGS.md`  
> QA details: [`QA-FINDINGS.md`](QA-FINDINGS.md) · Architecture: [`DESIGN.md`](../DESIGN.md)

---

## KeyboardEvent.code

Gameplay keys (mixed-case): `Space`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`, `Backspace`, `Delete`, `ShiftLeft`.

Name entry also uses `KeyA`–`KeyZ`, `Digit0`–`Digit9` via `drainKeyPresses()`.

**Run key determination (2026-08-12 PM):** Left Shift only maps to SMB B-button. `KeyZ` and `ShiftRight` removed from run to avoid conflicting with other bindings.

Source: [MDN KeyboardEvent.code](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)

---

## One-way platforms

- **Top contact:** resolve when descending onto platform (feet within tolerance)
- **Side contact:** block horizontally on **body** hitbox; no damage
- **Ascending:** pass through when `vy < 0` (v1 failed here — D-004)
- **Cap vs body:** SMB pipes render 76 px cap on 60 px body — top landing must use wider cap bounds

Sources:

- [MDN 2D collision detection](https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection)
- [Bugnet one-way platforms](https://bugnet.io/blog/how-to-implement-a-one-way-platform)

---

## SMB pipe behavior

Cap = walkable platform. Sides = solid wall. No damage on contact.

---

## Jump physics (validated v2)

| Constant | Value |
|----------|-------|
| `PLAYER_JUMP_FORCE` | −12.5 px/frame |
| `GRAVITY` | 0.6 px/frame² |
| Max rise (full hold) | ~130 px |
| `PLAYER_WALK_SPEED` / `PLAYER_RUN_SPEED` | 3.5 / 5.75 |

**Determinations:**

1. **O-5 / D-004 reclassification:** “Can’t reach pipe” was collision + placement, not jump height.
2. **v1 variable jump bug:** Extra gravity while held shortened rise to ~74 px; v2 Phase 4 used `vy *= 0.5` on release — **superseded Phase 7** by tier rise/fall gravity when jump released.
3. **Phase 5:** Jump raised from −12 to **−12.5** for pipe clearance margin (~130 px apex tier 0).

SMB note: NTSC SMB1 jump vertical force varies slightly by horizontal speed at takeoff ([SMBpedia](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html)); v2 uses tiered rise/fall gravity (not initial vy) so walk-jump apex stays ~130 px while run jumps get a flatter arc.

---

## Run + jump (SMB1 NTSC — 2026-08-12 PM)

Sources: [SMBpedia Movement](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html) · [mitxela SMB1 port](https://mitxela.com/projects/console/mario) (Jdaster64 flowchart constants)

### SMB1 takeoff flags (persist entire jump until landing)

| Flag | SMB condition | v2 field / threshold |
|------|---------------|----------------------|
| `fastjump` | \|vx\| > maxWalkSpeed | `airRunJump` when \|vx\| > 3.5 |
| `fasterjump` | \|vx\| > airspeedCutoff (1 + 13/16 px) | `airFastMomentum` when \|vx\| > 4.06 |
| `fastVjump` | \|vx\| > jumpCutoff1 (1 px) | `jumpSpeedTier` ≥ 1 when \|vx\| > 2.24 |
| `fasterVjump` | \|vx\| > jumpCutoff2 (2 + 5/16 px) | `jumpSpeedTier` = 2 when \|vx\| > 5.18 |

### Air horizontal (while airborne)

| Condition | SMB accel | v2 constant |
|-----------|-----------|-------------|
| \|vx\| ≥ walk cap | `airFastGain` | `PLAYER_AIR_FAST_ACCEL` (0.55) |
| Forward, below walk cap | `airSlowGain` | `PLAYER_AIR_SLOW_ACCEL` (0.35) |
| Reverse + `fasterjump` | `airFastDrag` | `PLAYER_AIR_FAST_DRAG` (0.13) |
| Reverse otherwise | `airSlowDrag` | `PLAYER_AIR_SLOW_DRAG` (0.35) |
| Speed cap | run cap if `fastjump`, else walk | `airRunJump ? 5.75 : 3.5` |

### Vertical tiers (arc shape, not apex)

| Tier | Rise gravity (held) | Fall gravity | Feel |
|------|---------------------|--------------|------|
| 0 walk | 0.6 | 0.6 | Standard jump (~130 px) |
| 1 medium | 0.55 | 0.65 | Slightly flatter |
| 2 sprint | 0.52 | 0.77 | Run jump — low, long arc |

Early jump cut: releasing jump switches from rise to fall gravity (replaces old `vy *= 0.5`).

**Coyote (2026-08-12 PM):** Base 0.15 s; pipe caps 0.22 s. `grantCoyoteTime()` fires when leaving ground after collision; `setGroundContact('platform'|'ground')` on landing.

---

## Run / sprint (SMB1 NTSC)

Source: [SMBpedia Movement](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html) (slither, 2025-02-08; verified **2026-08-12**)

### SMB1 mechanics (original)

| Concept | NTSC behavior |
|---------|---------------|
| B + direction on ground | Sets **RunningTimer = 10** frames |
| RunningTimer set | Hard speed cap **±40** subpx/frame |
| RunningTimer clear | Soft cap **±24** subpx/frame |
| Timer decay | −1 frame whenever B+direction+ground conditions not met (including in air) |
| Turnaround | **Double acceleration** when facing opposite travel direction |
| Air friction | Lower deceleration when no directional input (momentum preserved while timer active) |

### Muper Sario v2 mapping

| SMB1 concept | v2 implementation |
|--------------|---------------------|
| B button | **Left Shift** (`InputManager.isRunPressed()`) |
| RunningTimer 10 frames | `PLAYER_RUNNING_TIMER: 10/60` |
| Soft cap ~24 subpx | `PLAYER_WALK_SPEED: 3.5` |
| Hard cap ~40 subpx | `PLAYER_RUN_SPEED: 5.75` |
| Walk/run accel | `PLAYER_WALK_ACCEL: 0.35` / `PLAYER_RUN_ACCEL: 0.55` |
| Turnaround 2× accel | `PLAYER_TURNAROUND_ACCEL_MULT: 2` |
| Ground vs air friction | `FRICTION: 0.82` / `AIR_FRICTION: 0.98` |
| Run animation | Faster cycle when `isRunning` (12 vs 8 fps) |

**Activation rule (matches SMB):** Shift held + on ground + arrow direction matches movement (or near standstill).

---

## Scoring (Phase 7 — updated 2026-08-12 PM)

| Source | Points |
|--------|--------|
| Coin collected | **1** |
| Buba stomped | **1** |
| Pipe passed | 0 |
| Level win time bonus | **Multiplier** on base score only |

**Final score (level complete):** `round(baseScore × clamp(parTime / elapsed, 0.5, 2.0))`  
`parTimeSeconds` from **generated layout** (Phase 10); legacy LEVEL_1 reference used **90 s**. Game over saves raw base score (no time modifier).

Leaderboard stores final score after level complete or base score after game over.

---

## SMB visual scale (Phase 9b — 2026-08-12 evening)

**Problem:** Comparing NES absolute pixels to v2 pixels without a scale factor causes contradictions (e.g. “Mario 16 px” vs “pipe 96 px” looks like 6×, not 2×).

**Determination:** v2 art uses ~**3×** NES tile scale. **Ratios** match SMB1 World 1-1 reference; absolute counts differ.

| Object | SMB1 (NES) | Ratio | Muper Sario v2 | v2 constant |
|--------|------------|-------|----------------|-------------|
| Small Mario | ~16 px (1 tile) | 1× | **48 px** | `PLAYER_HEIGHT` |
| Short pipe | ~32 px (2 tiles) | 2× Mario | **96 px** | `PIPE_HEIGHT` |
| Brick / ? block | 16 px tile | — | **32 px** | `BLOCK_SIZE` |
| Platform row | 3 tiles above ground | 3× block | top **y = 404** | `PLATFORM_Y` in levelData |
| Goomba analogue (Buba) | ~16 px | ~⅔–1× Mario | **32 px** | `BUBA_HEIGHT` |

**Check:** 96 ÷ 48 = **2** (pipe : player in v2). 96 ÷ 16 = **6** only when comparing v2 pipe to NES Mario — conflates coordinate systems.

**Coin height (Phase 9 → 9b):**

| Pass | `COIN_FLOAT_ABOVE` | Ground coin y | Rationale |
|------|-------------------|---------------|-----------|
| Phase 9 | 34 px (70% of 48) | 446 | Initial “⅔–¾ player height” attempt |
| Phase 9b | **20 px** (~⅖ player) | **460** | User: still too high; closer to SMB ground-coin feel |

**Coin/pipe spacing:** Chunk definitions and `validateLevel()` enforce **≥ 48 px** (`COIN_MIN_PIPE_GAP`) between coins and pipe cap edges. Legacy LEVEL_1 used hand-placed X positions with same rule.

---

## World coordinates — procedural runs (Phase 10)

Default run: **12 chunks × 400 px = 4800 px**.

```
Canvas viewport:     800 × 600
World width:         layout.width (4800 px default)
Finish flag:         finishX = width − 80
Player spawn:        x = 100 (start chunk)
Ground surface:      y = 500
Pipe height:         96 px · top y = 404
Platform row:        y = 404 (3 × 32 px blocks above ground)
Ground coin y:       460 (COIN_FLOAT_ABOVE 20 px)
Platform coin y:     364
Par time:            layout.parTimeSeconds (derived — not fixed)
Camera offset:       35% (CAMERA_PLAYER_OFFSET)
Jump reach:          ~130 px apex — clears 96 px pipe/platform height
Seed URL:            ?seed=42 → deterministic chunk sequence (see DOC-INDEX)
```

Assembly: `createRunLevel()` → `LevelGenerator.generateValidatedLevel()`.

---

## World coordinates — legacy LEVEL_1 (reference only)

Hand-placed layout preserved in `levelData.js` — **not loaded at runtime** after Phase 10.

```
Canvas viewport:     800 × 600
World width:         4800 px
Finish flag:         x = 4720
Player spawn:        x = 100, y = 452 (feet at ground y = 500)
Ground surface:      y = 500
Ground segments:     [0–1680], [1820–3480], [3600–4800]
Pits:                1680–1820 (140 px), 3480–3600 (120 px)
Pipe height:         96 px (2× player — SMB ratio)
Pipe top:            y = 404
Pipe positions (11): 520, 720, 1180, 1380, 2080, 2280, 2680, 2880, 3080, 3920, 4120
Floating blocks:     11 (under elevated coins; platform top y = 404)
Ground coins (14):   y = 460; X: 180, 260, 340, 630, 1090, 1500, 1980, 2580, 3180, 3380, 3720, 4200, 4360, 4520
Platform coins (11): y = 364; X: 450, 650, 980, 1280, 2210, 2410, 2810, 3010, 3840, 4050, 4640
Bubas (6):           [280,200–460,→] [920,760–1080,←] [1620,1480–1660,→]
                     [2420,2320–2620,←] [3260,3120–3420,→] [3780,3640–3880,←]
Par time:            90 s (time bonus multiplier on level win)
Camera offset:       player at 35% from left (CAMERA_PLAYER_OFFSET)
Jump reach:          ~130 px apex from ground — clears 96 px pipe/platform height
```

Parallax factors: mountains **0.1**, clouds **0.25** (soft), forests **0.5** (compositor α=1; sprite bake fix OPEN §10b), ground **1.0**.

---

## Update order (implemented)

See [`DESIGN.md`](../DESIGN.md) for authoritative frame order. Summary:

```
updatePhysics → onGround=false → buba.update(pipes, blocks, ground)
→ pipe + block platform collision → buba-player (two-pass stomp/hurt) → coins
→ fall-death → ground snap → grantCoyoteTime on ledge leave → animation → camera → win check
```

Coyote refresh while grounded uses `COYOTE_TIME` or `COYOTE_TIME_PLATFORM` via `lastGroundKind`.

---

## Storage

- **Score key:** `muperSario2Scores` (v1 dual-key bug — D-012)
- **Mute key:** `muperSario2Muted` (`"true"` / `"false"`)
- Top 10 scores, sorted descending, 3-letter names

---

## Name entry

| Input | Action |
|-------|--------|
| A–Z, 0–9 | Set letter; advance cursor |
| ← / → | Cursor |
| ↑ / ↓ | Cycle letter |
| Backspace | Cursor back; slot → `A` |
| Delete | Current slot → `A` |
| Space / Enter | Save (after confirm keys released once) |

Implementation: `InputManager.drainKeyPresses()` — not held-key polling.

---

## Background music

| Topic | Determination |
|-------|---------------|
| Path | `assets/music/background.wav` |
| Load timing | Lazy on `GameScene.enter()` |
| API | `HTMLAudioElement` with `loop: true` |
| Fallback | Procedural chord loop via Web Audio |
| Mute | Pause element + master gain 0; resume on unmute |
| IDM | Exclude `localhost:38473` if downloads intercepted locally |

**Pages (2026-08-12):** `background.wav` committed; loops on https://theycallmehenry.github.io/muper-sario/

---

## Menu UI readability (Phase 6)

**Problem:** White canvas text on procedural sky/clouds failed WCAG contrast informally.

**Solution:** `UiText.js`

- `drawPanel()` — `rgba(0,0,0,0.58)` rounded rects behind text blocks
- `drawText()` — fill + dark stroke outline (`lineWidth` 2–4)

Applied: TitleScene (title, menu, instructions), HighScoresScene (header, rows, footer), GameScene overlays.

High score row layout uses panel-relative `innerLeft` / `innerRight` padding — not canvas edge anchors.

---

## Visual assets

### Clouds (FlappyBird port)

**Source:** `D:\Apps\ThinkingCap-Qwen3.6-27B FlappyBird\js\game\Sky.js`

| Parameter | Value |
|-----------|-------|
| Puff count | `floor(random * 4) + 4` |
| Draw alpha | 0.85 |
| Phase 6 | World-placed; parallax 0.25× camera |

### Mountains (Phase 8 — low-poly)

**Reference:** `assets/examples/vector-generated-mountains-example.png`

| Aspect | Implementation |
|--------|----------------|
| Style | Flat-shaded facets; no gradients |
| Peaks | 1–3 per sprite (wider sprites → 2–3) |
| Silhouette | Unified polygon fill first (`fillMountainRangeSilhouette`) |
| Snow | White/light/shadow gray facets overlapping rock (~upper 25%) |
| Colors | `MOUNTAIN_COLORS` rock grays + snow whites |
| Parallax | 0.1× camera in `Background.js`; also TitleScene backdrop |

**Bug fixed:** Facet-only drawing left hollow A-frame gaps — resolved by solid underlay + connected multi-peak silhouette.

### Trees (Phase 8 — flat vector)

**Reference:** `assets/examples/hand-drawn-trees-collection-set-illustration-for-infographic-or-other-uses-vector.webp`

| Style ID | Description |
|----------|-------------|
| `fluffyOak` | Scalloped cloud canopy + split branches |
| `radialCircle` | Mint circle + radial branch spokes |
| `orchardPuffs` | Clustered puffs + yellow fruit dots |
| `lobedForest` | Large multi-lobe dark canopy |
| `pillDots` | Rounded pill canopy + fleck dots |
| `tealBush` | Low 3-lobe bush + white speckles |
| `geoConifer` | Teal circle + tapered trunk |
| `spikyEvergreen` | Stepped jagged pine silhouette |
| `slenderPoplar` | Tall teardrop oval canopy |
| `yellowAutumn` | Small yellow 3-lobe cloud |

Seeded random picks one style per `generateTree()` call. Used in `Background.generateForests()` and `TitleScene`. Compositor forest layer uses **`alpha: 1`**.

**Open issue (Phase 10b):** User still reports mountains visible through canopies. Phase 9 compositor fix alone insufficient. Interim `drawTreeOpaqueUnderlay()` + `flattenTreeAlpha()` in code — **rejected** (generic green ovals visible). Proper fix: per-style solid silhouettes, no `rgba()` in bake — see § Phase 10b parallax opacity research.

### Blocks (Phase 9)

**Generator:** `ProceduralGen.generateBlock()` — 32×32 SMB orange brick with mortar lines.

**Entity:** `Block.js` — one-way top collision (same rules as `Pipe.checkCollisionDetailed`).

### Player (Phase 6 + 9)

All sprite hex colors passed through `ProceduralGen.invertHex()`. Walk/run uses **vertical leg lift** (`leftLift` / `rightLift` alternating) — legs stay under torso; no horizontal splay.

---

## Bubas

| Rule | Implementation |
|------|----------------|
| Patrol | Reverse at bounds, world edge, ledge (segment check), pipe body, **block body** |
| Stomp band | `(feet − bubaTop) ≤ BUBA_STOMP_TOLERANCE + height × 0.5` |
| Stomp posture | Player upper 55% above Buba vertical midpoint |
| Descending | `vy ≥ 0`; GameScene uses **frame-start** `frameDescending` |
| Resolution | Pass 1: all stomps; Pass 2: hurt only if no stomp this frame |
| Defeat | `stomp()` → squish 8 px, bounce −8, **+1 score** |
| Side | `loseLife()` unless invincible (1.5 s) |

**Edge cases hardened (Phase 8):** fast-fall through head; same-frame multi-Buba hurt after bounce.

---

## Fall death

Life loss when `player.y + player.height > CANVAS_HEIGHT` (600). Pits (missing ground segments) allow natural fall; ground snap only on solid segments.

---

## Level completion

Trigger: `player.x + player.width >= finishX` (procedural: `width − 80`).

Flow:

1. `completeLevel()` — compute `timeMultiplier`, `finalScore = round(base × mult)`, `game.setScore(finalScore)`
2. Overlay: LEVEL COMPLETE, TIME, BASE × multiplier, FINAL SCORE
3. Name entry → `Storage.saveScore(finalScore, initials)` → HighScoresScene

Game over uses same name-entry UX but saves **base score** only (no time modifier).

---

## Procedural level generation (Phase 10 — 2026-08-12)

Research-backed approach for rogue-lite endless replayability. SMB 1-1 reference: `assets/examples/` (full horizontal panorama — segment buffers, pit/challenge/vertical modules).

### Evidence base (marketing-aware)

| Source | Finding used in v2 |
|--------|-------------------|
| [Summerville et al. — Procedural Content Generation in Games](https://www.procedural-content-generation.org/) | PCG increases replayability when **constraints** guarantee playability, not pure randomness |
| [Shaker et al. — Evaluating PCG Systems (2024)](https://arxiv.org/html/2404.18657v1) | Evaluate on **structural validity** + play metrics, not visual variety alone |
| [Smith et al. — Platformer Level Design (AIIDE 2021)](https://cdn.aaai.org/ojs/18755/18755-52-22428-1-10-20210929.pdf) | Platformer PCG is **constraint-sensitive** — small gap width changes can make levels impossible |
| [Green et al. — Mario Scene Stitching (IEEE CoG 2020)](https://ieee-cog.org/2020/papers/paper_34.pdf) | **Pre-authored scenes + socket stitching** beats naive tile noise for side-scrollers |
| [Spelunky / Dead Cells model](https://www.abratabia.com/procedural-generation/roguelike-levels.php) | Roguelites use **hand-crafted room templates** + procedural **sequencing** and placement |
| [Generalist Programmer PCG survey (2026)](https://generalistprogrammer.com/procedural-generation-games) | 2D platformers: **chunk assembly**, constraint solving, rhythm/pacing — not Perlin terrain |
| [WFC platformer experiment (De Giorgio)](https://www.giorgiomicheledegiorgio.com/projects/procedural-2d-platformer/) | WFC works with **designer-defined chunks + adjacency constraints** — heavier than needed for v2 |

**Avoided (hype / poor fit):** LLM level generators (unreliable physics), raw WFC on empty tiles (hard to tune jump reach), GAN level gen (training overhead, no bundler project), infinite Perlin heightmaps (wrong genre).

### v2 design decisions (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Unit | **400 px chunk** | Matches ground texture tile; ~½ viewport; SMB 1-1 “segment” scale |
| Interlock | **Left/right sockets** (`solid` / `open`) | Guarantees seamless ground/pit continuity at boundaries |
| Library | **26 unique chunks** | Exceeds 20 minimum; mix of flat, pipe, platform, pit, buba, gap-span |
| Assembly | **Weighted random + difficulty curve** | Later slots allow hard chunks; early run stays fair |
| Seed | **Mulberry32 PRNG** + **`?seed=` URL** | Deterministic regression; new seed each run when omitted |
| Validation | **Structural checks** | Ground exists, finish reachable, coin/pipe gap ≥ `COIN_MIN_PIPE_GAP` |
| Par time | **Derived from layout** | Scales with length, pits, collectibles — fair time bonus per run |

### SMB 1-1 structural mapping

From reference panorama analysis (image in `assets/examples/`):

- **Buffer zones:** 2–4 tiles flat ground between modules → `flat_empty`, `start` chunks
- **Challenge segments:** pits 2–3 tiles wide → `pit_small`, `pit_medium`, `gap_*` span trio
- **Vertical segments:** pipes, block stairs → `pipe_*`, `block_stair`, `platform_*`
- **Baseline:** constant ground Y → all chunk edges at same surface height when `solid`

### Chunk library (26)

| ID | Role |
|----|------|
| `start` / `finish` | Run bookends (fixed placement) |
| `flat_empty`, `flat_coins_3`, `flat_coins_5`, `reward_run` | Easy traversal / coin rewards |
| `pipe_single_center`, `pipe_single_offset`, `pipe_pair`, `pipe_triple` | Pipe platforms |
| `platform_single`, `platform_double`, `platform_pipe_combo`, `block_stair`, `coin_arc` | Elevated platforms |
| `pit_small`, `pit_medium`, `pit_wide`, `pit_platform_bridge` | Internal pit gaps |
| `gap_start`, `gap_span`, `gap_end` | Multi-chunk pit span (open sockets) |
| `buba_patrol`, `buba_pipe`, `buba_double`, `sparse_challenge` | Enemy encounters |

### Testing (Phase 10)

| Test | Result |
|------|--------|
| `test.html` imports | **23/23** pass |
| `node --check` all `src/**/*.js` | pass |
| 20-seed `validateLevel()` loop | pass |
| Regression seed **42** | Documented sequence in DOC-INDEX + QA-FINDINGS |
| User manual QA | `http://localhost:38473/?seed=42` |

### Implementation

| Module | Role |
|--------|------|
| `src/config/levelChunks.js` | Chunk definitions (local coords, sockets, weights) |
| `src/utils/LevelGenerator.js` | Seed → sequence → merged world layout |
| `src/config/levelData.js` | `createRunLevel()` factory; `LEVEL_1` legacy reference |
| `GameScene.enter()` | Calls `createRunLevel()` each run |

### Future tuning signals

- Automated reachability probe (simple AI walk/jump simulation)
- Player telemetry: death heatmaps per chunk ID
- **Dynamic par time** — ground-path hybrid formula (see § Phase 10b below)
- **Tree sprite opacity** — per-style solid silhouettes (see § Phase 10b below)

---

## Phase 10b — Parallax opacity research (2026-08-12 late evening)

> **Status:** Research complete · code fix **pending** (interim underlay hack in tree — **rejected**, must revert)  
> **Date verified before research:** Wednesday, August 12, 2026 (system clock)

User report: mountains still visible through tree canopies at `?seed=42` after Phase 9 `Background` alpha fix. Screenshot confirmed dark generic green ovals visible behind style-specific tree tops (undesirable).

### Two distinct “transparency” mechanisms

| Mechanism | What it is | Mountains/trees rule |
|-----------|------------|----------------------|
| **Compositor alpha** | `ctx.globalAlpha` or per-element `alpha` at `drawImage` time | Must be **1.0** for mountains and trees |
| **Sprite pixel alpha** | Transparent or fractional-alpha pixels in baked offscreen canvas | Canopy interior must be **fully opaque**; transparency only **outside** sprite bounds |

MDN: [`globalAlpha`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha) scales entire draw operation. Even at compositor alpha 1.0, any source pixel with `alpha < 255` composites with layers drawn earlier — parallax mountains at 0.1× scroll make holes read as “see-through foliage.”

Parallax depth in 2D platformers should use **scroll speed + palette/value**, not layer opacity ([FreePixel.art parallax guide](https://freepixel.art/blog/how-to-add-parallax-scrolling-backgrounds-pixel-art-game); [Godot 2D Parallax docs](https://docs.godotengine.org/en/stable/tutorials/2d/2d_parallax.html)). Foreground layers *may* use transparency intentionally — mountains and trees are locked **fully opaque** in v2.

### Root causes identified (code audit)

**Compositor (runtime draw):**

| Location | Issue | Status |
|----------|-------|--------|
| `Background.js` | Forest/mountain `alpha: 1` | ✅ Correct |
| `Background.js` | `ctx.save()` / `restore()` per parallax element | ✅ Added Phase 10b attempt |
| `TitleScene.js` | Trees drawn at `globalAlpha 0.6–0.9` | ✅ Removed Phase 10b attempt |
| `TitleScene.js` | Mountains drawn at `globalAlpha 0.5–0.8` | ✅ Removed Phase 10b attempt |
| Clouds / sun | Semi-transparent by design | ✅ Intentional — not mountains/trees |

**Sprite bake (`ProceduralGen.generateTree` / `generateMountain`):**

| Issue | Affected styles | Detail |
|-------|-----------------|--------|
| **Canopy gaps** | `orchardPuffs`, multi-scallop styles | Separate circles/scallops leave **alpha-0 holes** between shapes |
| **Fractional fringe** | All curved paths | Canvas anti-aliasing → edge pixels ~1–12/255 alpha |
| **`rgba()` highlights** | `tealBush` (was `rgba(255,255,255,0.75)`) | Semi-transparent fill in bake |
| **Mountains** | N/A at bake | `generateMountain()` uses solid `#RRGGBB` only; hollow-center bug fixed Phase 8 via silhouette |

Pixel test (browser, post-`flattenTreeAlpha`): painted pixels min alpha 255; interior canopy holes remain where circles do not overlap. Worst interior hole count across 100 seeds: **0** only after generic underlay — but underlay is visually wrong.

### Troubleshooting attempts (chronological)

| # | Approach | Result | Verdict |
|---|----------|--------|---------|
| 1 | Phase 9: `Background.generateForests()` `alpha: 1` | Partial — user still sees bleed-through | Necessary not sufficient |
| 2 | Remove `TitleScene` tree `globalAlpha 0.6–0.9` | Title improved | Necessary not sufficient |
| 3 | **`drawTreeOpaqueUnderlay()`** — generic dark-green ellipse before style draw | Blocks parallax holes | **Rejected** — visible wrong-color backing behind each style’s canopy |
| 4 | **`flattenTreeAlpha()`** — force any painted pixel to alpha 255 | Fixes fringe only | Band-aid; does not fix holes without underlay |
| 5 | Remove `TitleScene` mountain compositor alpha | Mountains opaque on title | Correct compositor fix |
| 6 | Bump `GameEngine.js?v=4` | Module cache bust | Required for local verification |

**Do not ship:** `drawTreeOpaqueUnderlay`, `flattenTreeAlpha` — revert before proper art fix.

### Correct fix (research consensus — not yet implemented)

1. **Revert** generic underlay + flatten pass.
2. **Per-style solid silhouettes** — each style draws a **style-native** closed canopy path in its own shadow/dark green **before** decorative layers (same pattern as `fluffyOak` shadow scallops, `fillMountainRangeSilhouette` for mountains).
3. **No `rgba()`** in tree/mountain bake — `#RRGGBB` fills/strokes only.
4. **`globalAlpha = 1`** for entire bake; reset explicitly in `generateTree` / `generateMountain`.
5. **Do not use** `getContext('2d', { alpha: false })` for tree sprites — need transparency **outside** tree bounds; opacity required **inside** silhouette only ([MDN getContext alpha attribute](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext)).
6. Flat-vector best practice: boolean-union / single silhouette ([SVGSketch boolean ops](https://svgsketch.com/svg-boolean-operations)) — construction circles must fully overlap or merge into one path.

**Style-specific notes:**

| Style | Fix |
|-------|-----|
| `orchardPuffs` | Solid blob in `#2E7D32` under puff circles, or single scallop path |
| `fluffyOak`, `lobedForest` | Verify shadow scallop fully under highlight |
| `tealBush` | Opaque highlight dots (`#B2DFDB`) — no rgba |
| Single-path styles (`radialCircle`, `spikyEvergreen`, etc.) | Already structurally sound; verify compositor alpha only |

### Research sources (parallax opacity)

| Source | Finding applied |
|--------|-----------------|
| [MDN globalAlpha](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha) | Compositor vs source pixel alpha |
| [MDN getContext alpha:false](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) | Opaque canvas for full-bleed only — wrong for sparse sprites |
| [MDN imageSmoothingEnabled](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled) | Optional crisp edges for pixel art — v2 uses vector, fringe acceptable at outer edge only |
| [Canvas alpha premultiplication](https://www.javascriptroom.com/blog/how-can-i-stop-the-alpha-premultiplication-with-canvas-imagedata/) | Explains fringe compositing; not a substitute for solid silhouettes |
| [FreePixel.art parallax](https://freepixel.art/blog/how-to-add-parallax-scrolling-backgrounds-pixel-art-game) | Depth via speed + desaturation, not layer opacity |
| [Godot 2D Parallax](https://docs.godotengine.org/en/stable/tutorials/2d/2d_parallax.html) | Layer ordering, sizing — no opacity requirement for depth |

---

## Phase 10b — Dynamic par time research (2026-08-12 late evening)

> **Status:** Analysis complete · implementation **pending**

With procedural layouts, a single fixed par (legacy LEVEL_1: 90 s) or coarse chunk-count heuristic does not track actual traversal difficulty.

### Current implementation (Phase 10 — interim)

```javascript
parTimeSeconds = round(55 + middleCount * 4 + pitCount * 6 + coins.length * 0.5)
```

Typical 12-chunk run: **~95–110 s**. Read by `GameScene` from `levelLayout.parTimeSeconds`.

### User proposal (evaluated)

> Walk-speed baseline: `(finishX − spawnX) / PLAYER_WALK_SPEED + 10 s` buffer

| Aspect | Assessment |
|--------|------------|
| Per-level dynamic par | ✅ Correct direction for rogue-lite PCG |
| Walk-only baseline | ✅ Reasonable “cruise floor” (not speedrun ceiling) |
| Straight-line distance | ❌ Ignores pit detours, vertical jumps, optional coin paths |
| Flat +10 s buffer | ❌ Does not scale with pit/platform count |
| Run speed (5.75) | Walk-based par is intentionally forgiving if player sprints |

### Recommended approach (hybrid — implement in `LevelGenerator`)

```
parSeconds =
    mandatoryGroundPathDistance / PLAYER_WALK_SPEED
  + pitCount × PIT_PENALTY           // ~4–6 s each
  + elevatedPlatformCount × PLATFORM_PENALTY  // ~1–2 s (pipes/blocks requiring hop)
  + bubaCount × BUBA_PENALTY           // ~0.5–1 s
  + BASE_BUFFER                        // ~6–8 s
```

Clamp to `[45, 180]` for default run length.

**Mandatory ground path:** Sum merged `ground[]` segment lengths from spawn (x=100) toward `finishX` — not raw `finishX − spawnX`.

**Scoring curve (unchanged):** `clamp(parTime / elapsed, 0.5, 2.0)` — optionally display PAR on level-complete overlay.

**Deferred:** Full pathfinding simulation, percentile calibration from playtest telemetry, run-speed-based par.

### Research sources (par time)

| Source | Relevance |
|--------|-----------|
| [Shaker et al. 2024 — PCG evaluation](https://arxiv.org/html/2404.18657v1) | Metrics should reflect structural difficulty |
| [Smith et al. AIIDE 2021 — platformer PCG](https://cdn.aaai.org/ojs/18755/18755-52-22428-1-10-20210929.pdf) | Small geometry changes alter completion time |
| SMB movement research (this doc § SMB run+jump) | Walk 3.5 vs run 5.75 px/frame — par assumes walk |

---

