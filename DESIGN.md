# DESIGN.md — Muper Sario 2.0

> **Status:** Locked for v2 greenfield (2026-08-12, Phases 0–7 + deploy)  
> **Supersedes:** Static-screen model (Phase 5); v1 Flappy-style spawn

This document is the **single source of truth** for architecture. Do not implement features that contradict it without updating this file first.

---

## Game model (locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| World movement | **Side-scrolling world** | Player moves in world coords; camera follows (SMB-style) |
| Pipe placement | **Fixed level objects** | No spawn timer; no off-screen spawn at `player.x + 400` |
| Pipe role | **Platform + solid sides** | SMB-style: top = one-way platform; sides block; no damage |
| Level structure | **Hand-placed layout in code** | `src/config/levelData.js` — pipes, coins, bubas, ground segments, finish flag |
| Scroll / camera | **Camera follows player** | `cameraX` clamped `[0, levelWidth − canvasWidth]`; parallax layers use `cameraX × factor` |
| Level completion | **Reach finish flag** | Crossing `finishX` triggers win flow → name entry → leaderboard |
| Scoring (base) | **1 pt per coin + 1 pt per Buba stomp** | Accumulated during level |
| Scoring (final) | **Base × time multiplier** | On level win only: `clamp(parTime / elapsed, 0.5, 2.0)` |
| Art / audio | **Procedural sprites** + `.wav` BGM | SFX procedural; `assets/music/background.wav` loops (committed) |
| Modules | **ES6 static imports** | No bundler unless explicitly added later |
| Storage | **Single leaderboard API** | `Storage.js` → `localStorage` key `muperSario2Scores` |
| Audio mute | **HUD Mute button** | Pauses/resumes BGM + silences SFX; persists `muperSario2Muted` |

---

## Collision specification

One-way platform rules for pipe caps:

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

- Jump force −12.5, gravity 0.6 → max rise ~130 px with full hold (~10 px margin over pipe tops)
- Walk speed 3.5, run speed 5.75 (Left Shift = SMB B-button); acceleration-based horizontal movement
- Gap ground (y=452) to pipe stand height (y=333): 119 px — reachable after collision fixes (see [`docs/QA-FINDINGS.md`](docs/QA-FINDINGS.md))

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
| Movement | Ground patrol; reverse at ledges, walls, pipes |
| Stomp | Player descending onto head → defeat + bounce (**+1 score**) |
| Side hit | Costs one life (respects invincibility frames) |
| Life loss from pipes | **Never** — sides block only |

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
multiplier = clamp(LEVEL_1.parTimeSeconds / levelElapsed, TIME_SCORE_MIN_MULT, TIME_SCORE_MAX_MULT)
finalScore = round(baseScore × multiplier)
```

| Constant | Value |
|----------|-------|
| `parTimeSeconds` | 90 (level 1) |
| `TIME_SCORE_MIN_MULT` | 0.5 |
| `TIME_SCORE_MAX_MULT` | 2.0 |

Game over saves `baseScore` unchanged. Leaderboard stores whichever score is saved at name entry.

Level complete overlay shows: TIME, BASE × multiplier, FINAL SCORE.

---

## Update order (locked)

Per frame in `GameScene.update()` while alive:

```
invincibility tick → levelElapsed += dt
→ player.updatePhysics() → player.onGround = false
→ buba.update()
→ pipe collisions (setGroundContact on cap land)
→ buba–player collisions (stomp adds SCORE_PER_BUBA)
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
| Pipe height | 120 px (top y = 380) |
| Pipe body width | 60 px (sprite canvas 76 px with cap) |
| Pipe cap extension | 8 px each side |
| Pipe landing tolerance | 20 px below cap top |
| Player | 32 × 48 px |
| Coyote / jump buffer | 0.15 s ground / **0.22 s pipe cap** / 0.1 s jump buffer |
| Starting lives | 3 |

### Current level (`levelData.js` — LEVEL_1)

| Object | Detail |
|--------|--------|
| World width | **4800** px |
| Finish flag | x = **4720** |
| Ground | 3 segments with **2 pits** (1680–1820, 3480–3600) |
| Pipes | 11 hand-placed world positions |
| Coins | 25 collectibles (1 pt each) |
| Bubas | 6 patrol enemies (1 pt each stomp) |
| Par time | **90 s** — time bonus multiplier on level win |
| Player spawn | world x = **100** |

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
| Mountains | 0.1 | World-placed; `worldX − cameraX × 0.1` |
| Clouds | 0.25 | FlappyBird puff model |
| Forests / trees | 0.5 | Procedural trees |
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

### Player visual (Phase 6)

`ProceduralGen.generatePlayer()` applies `invertHex()` to all sprite colors (photographic RGB inversion of original Mario-like palette).

### Visual assets (procedural)

| Asset | Source / notes |
|-------|----------------|
| Clouds | Exact algorithm from `D:\Apps\ThinkingCap-Qwen3.6-27B FlappyBird\js\game\Sky.js` |
| Mountains | Opaque triangles; snow cap at peak (FlappyBird Background.js model) |
| Player, pipes, coins, Bubas, ground | `ProceduralGen.js` |

---

## Directory responsibilities

| Path | Owns |
|------|------|
| `src/config/` | `gameConfig.js` constants; `levelData.js` hand-placed layouts |
| `src/core/` | Engine loop, input, audio (incl. mute), render dispatch, scenes registry |
| `src/entities/` | Player, platforms, collectibles, Bubas, environment drawables |
| `src/scenes/` | Title, gameplay, high scores — thin orchestration |
| `src/utils/` | ProceduralGen, Storage, MathUtils, UiText |
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
| Cache bust | `index.html` → `GameEngine.js?v=3` |
| BGM asset | `assets/music/background.wav` (committed; loops on Pages) |
| Module test | `/test.html` — 20 import smoke tests |

---

## Out of scope (future)

- Touch / mouse controls
- Bundler / npm build step
- Multiple levels / level editor (LEVEL_2+)
- Multiplayer
- In-game elapsed-time HUD (timer tracked internally for scoring only)
