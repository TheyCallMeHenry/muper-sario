# v1 Pitfalls — Do Not Repeat in v2

> Derived from [`Laguna-S-2.1-MuperSario/docs/CODEBASE-REVIEW-DISCOVERIES.md`](../../Laguna-S-2.1-MuperSario/docs/CODEBASE-REVIEW-DISCOVERIES.md) (2026-08-12)  
> v2 QA validation: [`QA-FINDINGS.md`](QA-FINDINGS.md)

Use as a pre-merge checklist for v2.

---

## Architecture

| ID | Pitfall | v2 prevention | v2 status |
|----|---------|---------------|-----------|
| D-002 | `pipe.update()` never called; pipes accumulate | Fixed level objects (now procedural chunks) | ✅ Fixed |
| D-003 | Spawn at `player.x + 400` off-screen | Chunk library + generator — no spawn timer | ✅ Fixed |
| D-004 | Ascending cap overlap → side push | One-way platform spec + cap hitbox | ✅ Fixed |
| D-012 | Dual localStorage keys desync | Single Storage module | ✅ Fixed |

---

## Code quality

| ID | Pitfall | v2 prevention | v2 status |
|----|---------|---------------|-----------|
| D-001/D-015 | test.html broken paths / invalid HTML | `./src/` paths, 23 modules | ✅ Fixed |
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

## v2-only discoveries (Phase 8)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Hollow mountain sprites | Sky visible through mountain centers | Unified silhouette fill + facet overdraw |
| Multi-peak mountain gaps | Valleys between apexes in one sprite | `fillMountainRangeSilhouette()` connects peaks |
| Fast-fall Buba miss | Stomp window too narrow at high vy | Stomp band = tolerance + 50% Buba height |
| Same-frame Buba hurt | Stomp bounce vy<0 → adjacent Buba hurt | `frameDescending` + two-pass stomp/hurt |
| Transient stomp glitch | Occasional defeat failure (user report) | Addressed by Phase 8 collision hardening |

---

## v2-only discoveries (Phase 9)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Horizontal leg splay | Legs extend sideways when walking | Vertical `leftLift`/`rightLift` in `generatePlayer()` |
| Transparent trees | Mountains show through tree layer | Compositor `alpha: 1` in `Background` — **also** fix sprite bake gaps (Phase 10b) |
| Coins without platforms | Airborne coins between pipes | `Block.js` + `levelData.blocks[]` |
| Coin overlap pipes | Coins inside pipe cap bounds | Reposition X; `COIN_MIN_PIPE_GAP` |

---

## v2-only discoveries (Phase 9b)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Pipes too tall | ~2.5× player vs SMB 2× | `PIPE_HEIGHT: 96` |
| Coins still too high | Float read above chest/head | `COIN_FLOAT_ABOVE: 20` |
| NES/v2 pixel confusion | Wrong ratio when mixing 16 px and 96 px | Document 3× scale in RESEARCH-NOTES |

---

## v2-only discoveries (Phase 10)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Monolithic level replay | Same layout every run bored testers | 26 PCG chunks + `LevelGenerator` |
| Pit seams across chunks | Ground discontinuity at chunk joins | `solid`/`open` socket matching |
| `?seed=` no-op | User tested seed URL before wiring | `getRunSeedFromUrl()` + GameScene pass-through |
| Fixed par after PCG | 90 s par wrong for variable layouts | `parTimeSeconds` derived from generated layout |
| Unreachable block stairs | 3-block stair exceeded ~130 px jump | Reduced to 2-block stair in `block_stair` chunk |

---

## v2-only discoveries (Phase 10b — research 2026-08-12)

| Issue | Symptom | Do / Don't |
|-------|---------|------------|
| Compositor vs sprite alpha confusion | Setting `globalAlpha=1` but canopies still look transparent | Fix **baked canvas holes**, not just draw alpha |
| Generic tree underlay | Dark green ovals visible behind style-specific canopies | **Do not** use one-size oval; **reverted 2026-08-12**; use **per-style silhouettes** if bleed returns |
| `flattenTreeAlpha` band-aid | Fringe opaque; puff gaps remain | **Reverted** with underlay; fix art at source if needed |
| TitleScene compositor alpha | Mountains/trees drawn at 0.5–0.9 on menu | Draw at **1.0** |
| `rgba()` in tree bake | Semi-transparent highlight dots | Use solid `#RRGGBB` only for opaque parallax assets |
| Fixed par after PCG (heuristic) | Chunk-count formula may mis-rank runs | Plan hybrid ground-path par (RESEARCH-NOTES §10b) |
| `getContext('2d', { alpha: false })` for trees | Fills empty sprite bounds with opaque rect | **Wrong** for sparse sprites — need outside transparency |

---

## Still do not

- Copy v1 `GameScene.js` or `Pipe.js` wholesale
- Reintroduce spawn timer or `player.x + 400` spawn
- Patch v1 repo for v2 features
- Use port 38472 for v2
