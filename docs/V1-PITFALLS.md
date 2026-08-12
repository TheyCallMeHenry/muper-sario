# v1 Pitfalls — Do Not Repeat in v2

> Derived from [`Laguna-S-2.1-MuperSario/docs/CODEBASE-REVIEW-DISCOVERIES.md`](../../Laguna-S-2.1-MuperSario/docs/CODEBASE-REVIEW-DISCOVERIES.md) (2026-08-12)  
> v2 QA validation: [`QA-FINDINGS.md`](QA-FINDINGS.md)

Use as a pre-merge checklist for v2.

---

## Architecture

| ID | Pitfall | v2 prevention | v2 status |
|----|---------|---------------|-----------|
| D-002 | `pipe.update()` never called; pipes accumulate | Fixed level in `levelData.js` | ✅ Fixed |
| D-003 | Spawn at `player.x + 400` off-screen | Hand-placed world positions | ✅ Fixed |
| D-004 | Ascending cap overlap → side push | One-way platform spec + cap hitbox | ✅ Fixed |
| D-012 | Dual localStorage keys desync | Single Storage module | ✅ Fixed |

---

## Code quality

| ID | Pitfall | v2 prevention | v2 status |
|----|---------|---------------|-----------|
| D-001/D-015 | test.html broken paths / invalid HTML | `./src/` paths, 20 modules | ✅ Fixed |
| D-008 | Unused gameConfig constants | Config documents only used keys | ✅ Fixed |
| D-009–D-011 | Dead state, unused imports, duplicate backgrounds | Copy manifest + trim | ✅ Fixed |
| D-019 | `onGround` reset before animation | Reset after physics, before collisions | ✅ Fixed |
| D-014/D-020 | Procedural regen every frame | Sprite frame cache | ✅ Fixed |

---

## Process / docs

| ID | Pitfall | v2 prevention | v2 status |
|----|---------|---------------|-----------|
| D-024 | Docs contradicted code ("jump verified") | QA tied to DESIGN.md before ✅ | ✅ Fixed |
| O-5 | Misdiagnosed "jump height" | Collision + cap hitbox + level x | ✅ Fixed |

---

## v2-only discoveries (Phase 4 QA)

| Issue | Symptom | Fix |
|-------|---------|-----|
| onGround before physics | Jump/coyote broken on ground | Move reset after `updatePhysics()` |
| Variable jump gravity | Max rise ~74 px | Early-release `vy *= 0.5` |
| Body-only pipe bounds | Can't land from beside | `getCapBounds()` 76 px |
| Pipe x=450 | Jump arc miss (static level) | Superseded by `levelData.js` |
| Fall after ground snap | `loseLife` unreachable | Check feet > canvas before ground snap |

---

## v2-only discoveries (Phase 5)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Name entry polling | No type/Backspace | `drainKeyPresses()` queue |
| BGM fetch on load | IDM prompt; procedural fallback | Lazy `HTMLAudioElement` |
| Buba in pipe body | Stuck oscillating | Level placement + pipe nudge |
| Squish below ground | Clipped flat sprite | 8 px squish at groundY − 8 |
| Mountain alpha | Semi-transparent peaks | Opaque + peak snow geometry |

---

## v2-only discoveries (Phase 6)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Static screen / no win | Level ends at canvas edge only via death | Side-scroll + finish flag + LEVEL COMPLETE |
| Full-width ground | No pit falls | Segmented ground in `levelData.js` |
| White menu text | Unreadable on clouds/sky | `UiText.js` panels + stroke |
| Score off panel | Numbers past backdrop edge | Panel inner padding layout |
| Run on Z / both Shifts | User key conflict | Left Shift only |

---

## v1 items already fixed (safe to copy behavior, not always code)

- Pipe side-block without death
- 76 px cap rendering
- Name entry with pre-filled initials
- KeyboardEvent.code mixed-case

## v2-only discoveries (Phase 7)

| Issue | Symptom | Fix |
|-------|---------|-----|
| No stomp score | User requirement | `SCORE_PER_BUBA: 1` |
| Coyote tight on pipe caps | Run off pipe edge felt harsh | 0.15 s / 0.22 s + `grantCoyoteTime()` |
| No speed scoring | Win score = collectibles only | Time multiplier on level complete |
| Walk jump = run jump in air | Missing SMB feel | SMB run+jump tiers in `Player.js` |
| Variable jump `vy *= 0.5` | Simplified vs SMB arcs | Tier rise/fall gravity by takeoff speed |

---

## Still do not

- Copy v1 `GameScene.js` or `Pipe.js` wholesale
- Reintroduce spawn timer or `player.x + 400` spawn
- Patch v1 repo for v2 features
- Use port 38472 for v2
