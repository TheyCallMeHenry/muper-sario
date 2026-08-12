# Research Notes — Muper Sario 2.0

> Curated from v1 research + v2 validation (2026-08-12)  
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
Level 1 par time: **90 s** (`levelData.js`). Game over saves raw base score (no time modifier).

Leaderboard stores final score after level complete or base score after game over.

---

## World coordinates (LEVEL_1 — `levelData.js`)

```
Canvas viewport:     800 × 600
World width:         4800 px
Finish flag:         x = 4720
Player spawn:        x = 100, y = 452 (feet at 500)
Ground surface:      y = 500
Ground segments:     [0–1680], [1820–3480], [3600–4800]
Pits:                1680–1820 (140 px), 3480–3600 (120 px)
Pipe top:            y = 380 (height 120 px)
Pipe positions (11): 520, 720, 1180, 1380, 2080, 2280, 2680, 2880, 3080, 3920, 4120
Coins:               25 positions (see levelData.js)
Bubas (6):           [280,200–460,→] [920,760–1080,←] [1620,1480–1660,→]
                     [2420,2320–2620,←] [3260,3120–3420,→] [3780,3640–3880,←]
Par time:            90 s (time bonus multiplier on level win)
Camera offset:       player at 35% from left (CAMERA_PLAYER_OFFSET)
```

Parallax factors: mountains **0.1**, clouds **0.25**, forests **0.5**, ground **1.0**.

---

## Update order (implemented)

See [`DESIGN.md`](../DESIGN.md) for authoritative frame order. Summary:

```
updatePhysics → onGround=false → buba.update → pipe → buba-player → coins
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

### Mountains

Opaque; snow cap triangle from peak — FlappyBird `Background.js` model. Parallax 0.1×.

### Player (Phase 6)

All sprite hex colors passed through `ProceduralGen.invertHex()` (255−R, 255−G, 255−B).

---

## Bubas

| Rule | Implementation |
|------|----------------|
| Patrol | Reverse at bounds, world edge, ledge (segment check), pipe body |
| Stomp | Descending + feet near head → defeat, bounce −8, **+1 score** |
| Side | `loseLife()` unless invincible |
| Squish | 8 px sprite flush with groundY |

---

## Fall death

Life loss when `player.y + player.height > CANVAS_HEIGHT` (600). Pits (missing ground segments) allow natural fall; ground snap only on solid segments.

---

## Level completion

Trigger: `player.x + player.width >= LEVEL_1.finishX` (4720).

Flow:

1. `completeLevel()` — compute `timeMultiplier`, `finalScore = round(base × mult)`, `game.setScore(finalScore)`
2. Overlay: LEVEL COMPLETE, TIME, BASE × multiplier, FINAL SCORE
3. Name entry → `Storage.saveScore(finalScore, initials)` → HighScoresScene

Game over uses same name-entry UX but saves **base score** only (no time modifier).
