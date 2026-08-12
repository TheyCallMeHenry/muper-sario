# DESIGN.md — Muper Sario 2.0

> **Status:** Locked for v2 greenfield (2026-08-12, Phases 0–10)  
> **Supersedes:** Static-screen model (Phase 5); v1 Flappy-style spawn

This document is the **single source of truth** for architecture. Do not implement features that contradict it without updating this file first.

---

## Game model (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| World movement | **Side-scrolling world** | Player moves in world coords; camera follows (SMB-style) |
| Pipe placement | **Fixed level objects** | No spawn timer; no off-screen spawn at `player.x + 400` |
| Pipe role | **Platform + solid sides** | SMB-style: top = one-way platform; sides block; no damage |
| Floating blocks | **SMB brick platforms** | 32×32; one-way top (same rules as pipe cap); under elevated coins |
| Level structure | **Procedural chunk assembly** | `levelChunks.js` + `LevelGenerator.js` — 26 socket-matched segments; new seed each run |
| Scroll / camera | **Camera follows player** | `cameraX` clamped `[0, levelWidth − canvasWidth]`; parallax layers use `cameraX × factor` |
| Level completion | **Reach finish flag** | Crossing `finishX` triggers win flow → name entry → leaderboard |
| Scoring (base) | **1 pt per coin + 1 pt per Buba stomp** | Accumulated during level |
| Scoring (final) | **Base × time multiplier** | On level win only: `clamp(parTime / elapsed, 0.5, 2.0)` |
| Art / audio | **Procedural sprites** + `.wav` BGM | 10 tree styles + low-poly mountains (Phase 8); SFX procedural |
| Modules | **ES6 static imports** | No bundler unless explicitly added later |
| Storage | **Single leaderboard API** | `Storage.js` → `localStorage` key `muperSario2Scores` |
| Audio mute | **HUD Mute button** | Pauses/resumes BGM + silences SFX; persists `muperSario2Muted` |

---

## Collision specification

One-way platform rules for **pipe caps** and **block tops**:

1. **Descending onto cap** (`vy >= 0`, feet within landing tolerance): snap to top, `onGround = true`
2. **Ascending through cap/body zone**: **no collision** (pass through when `vy < 0`)
3. **Side contact at body** (feet below cap plane, horizontal overlap on **body** bounds): block movement; **no life loss**
4. **Life loss**: feet below canvas bottom (pits/gaps) — **never** from pipe contact

### Hitbox split (QA-validated)

| Part | Width | X origin (pipe anchor `x`) |
|------|-------|----------------------------|
| Cap (top landing) | 76 px | `x − PIPE_CAP_EXTENSION` (8 px) |
| Body (side block) | 60 px | `x + PIPE_CAP_EXTENSION` |

Visual sprite matches cap bounds (76 px canvas). Side collision uses narrower body so cap overhang allows landing from beside.

### Reference physics

- Jump force −12.5, gravity 0.6 → max rise ~130 px with full hold
- Walk speed 3.5, run speed 5.75 (Left Shift = SMB B-button); acceleration-based horizontal movement
- Ground surface (y=500) to pipe/block stand height (y=404): **96 px** — reachable (~130 px jump apex)

### Run / sprint (SMB-inspired, 2026-08-12)

| Input | Action |
|-------|--------|
| **Left Shift** | Run (SMB B-button equivalent) |
| Arrow keys | Move / jump |

Walk max ≈ SMB soft cap (24 subpx analogue); run max ≈ hard cap (40 subpx analogue). `RunningTimer` (10 frames NTSC) preserves run speed briefly after leaving ground when run was active on ground. Turnaround uses 2× acceleration when reversing direction on ground (SMB fast-acceleration model). Less horizontal friction in air preserves run momentum.

### Run + jump (SMB1 NTSC, 2026-08-12 PM)

When jumping at run speed, horizontal and vertical behavior diverges from walk jumps (SMB `fastjump` / `fasterjump` / gravity tiers):

| SMB flag | Trigger at takeoff | v2 behavior |
|----------|-------------------|-------------|
| `fastjump` | \|vx\| > walk cap | `airRunJump` — run speed cap for entire jump |
| `fasterjump` | \|vx\| > airspeedCutoff | `airFastMomentum` — faster air turnaround accel |
| Gravity tier 1–2 | \|vx\| > jumpCutoff1/2 | Flatter arc via tiered rise/fall gravity |

Air horizontal: fast accel at/above walk cap; slow accel when building speed forward; fast/slow drag when reversing (faster turnaround if `airFastMomentum`). Walk jumps stay capped at walk speed in air unless takeoff exceeded walk cap.

Source: [SMBpedia Movement](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html) · mitxela SMB1 port (Jdaster64 flowchart).

### Bubas (enemies)

| Rule | Behavior |
|------|----------|
| Movement | Ground patrol; reverse at ledges, walls, pipes, **blocks** |
| Stomp | Player descending onto head → defeat + bounce (**+1 score**) |
| Side hit | Costs one life (respects invincibility frames) |
| Life loss from pipes | **Never** — sides block only |

**Stomp detection (`Buba.checkPlayerCollision`):**

- Requires AABB overlap
- `descending`: `vy ≥ 0` (GameScene passes **frame-start** `frameDescending` before bounce mutates `vy`)
- `inStompBand`: `(playerBottom − bubaTop) ≤ BUBA_STOMP_TOLERANCE + height × 0.5`
- `playerAboveMid`: player upper 55% above Buba vertical midpoint (blocks side-walk false stomps)

**GameScene two-pass resolution (Phase 8):**

1. Stomp pass — all alive Bubas using `frameDescending`; apply bounce, score, squish
2. Hurt pass — only if **no** stomp this frame; any `'hurt'` → `loseLife()`

Prevents same-frame false hurt when stomp bounce sets `vy < 0` before adjacent Buba checks.

| Constant | Value |
|----------|-------|
| `BUBA_STOMP_TOLERANCE` | 10 px |
| `PLAYER_STOMP_BOUNCE` | −8 |
| Invincibility after hurt | 1.5 s |
| Squish height | 8 px flush at `groundY` |

---

## Scoring (locked)

### Base score (during level)

| Source | Points |
|--------|--------|
| Coin | +1 |
| Buba stomp | +1 |
| Pipe / flag | 0 |

### Final score (level win only)

Implemented in `GameScene.completeLevel()` via `MathUtils.computeTimeScoreMultiplier()`:

```
multiplier = clamp(parTimeSeconds / levelElapsed, TIME_SCORE_MIN_MULT, TIME_SCORE_MAX_MULT)
finalScore = round(baseScore × multiplier)
```

| Constant | Value |
|----------|-------|
| `parTimeSeconds` | From generated layout (typical ~95–110 s for 12-chunk run) |
| `TIME_SCORE_MIN_MULT` | 0.5 |
| `TIME_SCORE_MAX_MULT` | 2.0 |

Game over saves `baseScore` unchanged. Leaderboard stores whichever score is saved at name entry.

Level complete overlay shows: TIME, BASE × multiplier, FINAL SCORE.

**Par time (interim — Phase 10):** `LevelGenerator` derives `parTimeSeconds` from chunk/pit/coin counts. **Recommended revamp (Phase 10b research, not yet implemented):** ground-path horizontal distance ÷ walk speed + weighted pit/platform/buba penalties + buffer; see [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md) § Dynamic par time.

---

## Update order (locked)

Per frame in `GameScene.update()` while alive:

```
invincibility tick → levelElapsed += dt
→ player.updatePhysics() → player.onGround = false
→ buba.update(pipes, blocks, ground)
→ pipe + block collisions (setGroundContact on top land)
→ buba–player collisions (two-pass stomp/hurt; stomp adds SCORE_PER_BUBA)
→ coin collisions (SCORE_PER_COIN)
→ fall-death if feet > canvas height
→ ground snap (setGroundContact on ground land)
→ if wasOnGround && !onGround → player.grantCoyoteTime()
→ wasOnGround = player.onGround
→ ceiling clamp
→ player.updateAnimation() → updateCamera()
→ level-complete if player.x + width >= finishX
→ render
```

**Never** reset `onGround` before `updatePhysics()` (breaks coyote/jump) or before `updateAnimation()` (D-019).

---

## World layout constants

| Element | Value |
|---------|-------|
| Canvas | 800 × 600 |
| Ground height | 100 px (surface y = 500) |
| Pipe height | 96 px — 2× player (SMB ratio; top y = 404) |
| Pipe body width | 60 px (sprite canvas 76 px with cap) |
| Pipe cap extension | 8 px each side |
| Pipe landing tolerance | 20 px below cap/block top |
| Block size | 32 × 32 px (SMB brick) |
| Coin float above support | 20 px (`COIN_FLOAT_ABOVE`) |
| Coin min gap from pipe cap | 48 px (`COIN_MIN_PIPE_GAP`; level layout) |
| Player | 32 × 48 px |
| Coyote / jump buffer | 0.15 s ground / **0.22 s pipe cap** / 0.1 s jump buffer |
| Starting lives | 3 |

### Current level (procedural runs — Phase 10)

| Object | Detail |
|--------|--------|
| Generator | `LevelGenerator.generateValidatedLevel()` via `createRunLevel()` |
| Chunk library | **26** socket-matched segments in `levelChunks.js` (400 px each) |
| Run length | **12** chunks default → **4800** px (same scale as legacy LEVEL_1) |
| Sockets | `solid` ↔ `solid`, `open` ↔ `open` — seamless pit carry-over |
| Difficulty curve | easy → medium → hard by run index; weighted random pick |
| Seed | `Date.now()` per run (reproducible via explicit seed API) |
| Finish flag | `finishX = width − 80` |
| Par time | `round(55 + middleCount×4 + pitCount×6 + coins×0.5)` — **interim**; hybrid ground-path formula recommended (RESEARCH-NOTES §10b) |
| Legacy | `LEVEL_1` in `levelData.js` — hand-placed reference layout |

Each chunk may include ground segments (with optional internal pits), pipes, blocks, coins, bubas — all placed in **local coordinates** and offset at assembly time.

Player spawn: world x = **100** (start chunk buffer).

Buba patrol ranges must stay clear of adjacent pipe **body** bounds. Camera offset: player at 35% from left edge of viewport.

### Name entry (game over and level complete)

| Input | Action |
|-------|--------|
| A–Z, 0–9 | Set letter at cursor; advance cursor |
| ← / → | Move cursor |
| ↑ / ↓ | Cycle letter at cursor |
| Backspace | Cursor back; reset slot to `A` |
| Delete | Reset current slot to `A` |
| Space / Enter | Save → HighScoresScene (after confirm keys released) |

Uses `InputManager.drainKeyPresses()` one-shot queue — not held-key polling.

### Camera and parallax (Phase 6)

| Layer | Parallax factor | Notes |
|-------|-----------------|-------|
| Sky | 0 (fixed) | Gradient + sun in viewport space |
| Mountains | 0.1 | Low-poly faceted sprites; unified silhouette + snow facets |
| Clouds | 0.25 | FlappyBird puff model |
| Forests / trees | 0.5 | 10 flat vector styles; compositor **alpha = 1**; generic underlay **reverted** (Phase 10b); per-style solid silhouettes if parallax bleed returns — RESEARCH-NOTES §10b |
| Ground texture | 1.0 | Segmented solid tiles scroll with camera |
| Gameplay entities | 1.0 | `ctx.translate(−cameraX)` |

`cameraX = clamp(player.x − CANVAS_WIDTH × 0.35, 0, levelWidth − CANVAS_WIDTH)`

### Audio (Phase 6)

| Topic | Behavior |
|-------|----------|
| BGM load | Lazy on `GameScene.enter()` via `HTMLAudioElement` loop |
| Mute | `AudioManager.setMuted()` — master gain 0; pauses BGM element |
| Unmute | Restores gain; resumes BGM if `musicDesired` |
| Persistence | `localStorage` key `muperSario2Muted` |
| UI | `#mute-button` in `index.html`; wired in `GameEngine` constructor |

### Menu UI readability (Phase 6)

Canvas menu text uses `UiText.js`:

- Semi-transparent dark **panels** behind title/menu/score blocks
- **Stroked** fill text for contrast on bright sky/clouds
- High score rows aligned to panel inner padding (not canvas edge)

### Player visual (Phase 6 + 9)

`ProceduralGen.generatePlayer()` applies `invertHex()` to all sprite colors. Walk/run animation uses **vertical leg lift** under the torso (alternating `leftLift` / `rightLift`) — not horizontal leg splay.

### SMB visual scale (Phase 9b — locked)

v2 uses ~**3×** NES tile scale. **Ratios** match SMB1; do not compare absolute NES px to v2 px without the scale factor.

| Object | SMB1 ratio | v2 pixels |
|--------|------------|-------------|
| Player | 1× | 48 |
| Pipe | 2× player | 96 (top y = 404) |
| Block | 1 tile @ 2× scale | 32 |
| Platform row | 3 blocks above ground | y = 404 |

Full mapping: [`docs/RESEARCH-NOTES.md`](docs/RESEARCH-NOTES.md) § SMB visual scale.

### Visual assets (procedural)

| Asset | Source / notes |
|-------|----------------|
| Clouds | Exact algorithm from `D:\Apps\ThinkingCap-Qwen3.6-27B FlappyBird\js\game\Sky.js` |
| Mountains | **Low-poly faceted** — flat rock/snow colors, no gradients; 1–3 peaks per sprite; **unified silhouette fill** then facet overdraw (Phase 8). Ref: `assets/examples/vector-generated-mountains-example.png` |
| Trees | **10 flat vector styles** — seed-picked from `TREE_STYLES` in `ProceduralGen.js` (fluffyOak, radialCircle, orchardPuffs, lobedForest, pillDots, tealBush, geoConifer, spikyEvergreen, slenderPoplar, yellowAutumn). Ref: `assets/examples/hand-drawn-trees-collection-set-illustration-for-infographic-or-other-uses-vector.webp` |
| Player, pipes, coins, blocks, Bubas, ground | `ProceduralGen.js` |

**Design reference images** in `assets/examples/` are **not** loaded at runtime — they informed procedural art and **Phase 10 level chunk design** (SMB 1-1 panorama).

---

## Directory responsibilities

| Path | Owns |
|------|------|
| `src/config/` | `gameConfig.js` constants; `levelChunks.js` tile library; `levelData.js` run factory + legacy LEVEL_1 |
| `src/core/` | Engine loop, input, audio (incl. mute), render dispatch, scenes registry |
| `src/entities/` | Player, platforms, collectibles, Bubas, environment drawables |
| `src/scenes/` | Title, gameplay, high scores — thin orchestration |
| `src/utils/` | ProceduralGen, Storage, MathUtils, UiText, **LevelGenerator** |
| `src/styles/` | Layout, HUD overlay, mute button |
| `docs/` | Progress, research, QA, v1 pitfalls — not runtime code |

---

## v1 archive

Prototype source: `D:\Apps\Laguna-S-2.1-MuperSario` (read-only reference)

**v2 live:** https://theycallmehenry.github.io/muper-sario/ · **Repo:** https://github.com/TheyCallMeHenry/muper-sario

Do not patch v1 for v2 features. Copy proven modules per [`docs/EXTRACTION-MANIFEST.md`](docs/EXTRACTION-MANIFEST.md).

---

## Deploy (GitHub Pages)

| Setting | Value |
|---------|-------|
| Branch | `main` |
| Path | `/` (repository root) |
| Build | Static — no bundler; ES modules over HTTPS |
| Cache bust | `index.html` → `GameEngine.js?v=5` |
| BGM asset | `assets/music/background.wav` (committed; loops on Pages) |
| Module test | `/test.html` — 23 import smoke tests |

---

## Out of scope (future)

- Touch / mouse controls
- Bundler / npm build step
- Multiple hand-authored levels (LEVEL_2+) — superseded by procedural runs
- Level editor UI
- Multiplayer
- In-game elapsed-time HUD (timer tracked internally for scoring only)
