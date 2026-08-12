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
| test.html module load | ✅ PASS (20/20 Phase 6+) |
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

## Verified behaviors (current)

| Behavior | Detail |
|----------|--------|
| Side scroll | Camera follows player; world width 4800 px |
| Parallax | Mountains 0.1×, clouds 0.25×, trees 0.5×, ground 1.0× |
| Pits | Ground gaps 1680–1820, 3480–3600 → fall death |
| Level win | `player.x + width >= finishX` (4720) → LEVEL COMPLETE |
| Base score | 1 pt/coin (max 25) + 1 pt/Buba stomp (max 6) |
| Final score (win) | `base × clamp(90/elapsed, 0.5, 2.0)` rounded |
| Coyote | 0.15 s ground / 0.22 s pipe cap; jump buffer 0.1 s |
| Run+jump | `airRunJump` preserves run cap; tier gravity by takeoff speed |
| Run | Left Shift; max 5.75; RunningTimer 10 frames |
| Buba stomp | Defeat + bounce + **1 pt** |
| Buba side | Lose life (invincibility respected) |
| Storage | `muperSario2Scores`; top 10 |
| Mute | `muperSario2Muted`; pauses BGM + silences SFX |
| Deploy | GitHub Pages from `main` root |

---

## Cache note

`index.html` cache-busts `GameEngine.js?v=3`. Submodule edits require **Ctrl+F5**. Bump `?v=` when changing the entry script.
