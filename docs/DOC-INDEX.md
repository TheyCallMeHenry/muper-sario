# Documentation Index — Muper Sario 2.0

> **Last synced:** 2026-08-12 late evening (Phase 10b underlay revert + full doc sync)  
> **Live:** https://theycallmehenry.github.io/muper-sario/ · **Repo:** https://github.com/TheyCallMeHenry/muper-sario

This index maps every project document to its role and lists locked determinations in one place.

---

## Document map

| Document | Audience | Contents |
|----------|----------|----------|
| [`README.md`](../README.md) | Humans | Quick start, controls, gameplay summary, validation |
| [`DESIGN.md`](../DESIGN.md) | Implementers | **Locked architecture** — collision, physics, scoring, PCG, art, deploy |
| [`AGENTS.md`](../AGENTS.md) | AI agents | Session rules, paths, ports, doc read order |
| [`SESSION-HANDOFF.md`](../SESSION-HANDOFF.md) | AI agents | Current phase, shipped state, next steps (≤80 lines) |
| [`docs/PROGRESS.md`](PROGRESS.md) | Trackers | Phase checklist, module inventory, v2 fix IDs |
| [`docs/QA-FINDINGS.md`](QA-FINDINGS.md) | QA | Manual + automated test results, bugs found/fixed by phase |
| [`docs/RESEARCH-NOTES.md`](RESEARCH-NOTES.md) | Design | SMB physics, PCG research, geometry, scaling, scoring, art refs |
| [`docs/EXTRACTION-MANIFEST.md`](EXTRACTION-MANIFEST.md) | Migration | v1 copy vs rewrite checklist |
| [`docs/V1-PITFALLS.md`](V1-PITFALLS.md) | Prevention | Do-not-repeat checklist (D-001…D-029 + Phase 10) |
| [`assets/README.md`](../assets/README.md) | Assets | BGM path, mute, design reference images |
| `src/*/README.md` | Module scope | Per-directory roles (config, core, entities, scenes, utils, styles) |

**v1 archive (read-only):** `D:\Apps\Laguna-S-2.1-MuperSario` · full research log in v1 `docs/RESEARCH-FINDINGS.md`

---

## Locked determinations (current)

### Runtime

| Item | Value |
|------|-------|
| Canvas | 800 × 600 viewport |
| World (default run) | **4800 px** (12 × 400 px chunks) |
| Level generation | Procedural per run; optional `?seed=` URL param |
| Local port | **38473** (v1 = 38472) |
| Modules | **23** ES6 files, no bundler |
| Fixed timestep | 60 Hz (`GameEngine`) |
| Cache bust | `GameEngine.js?v=5` |

### Procedural level generation (Phase 10)

| Item | Value |
|------|-------|
| Chunk width | **400 px** |
| Chunk library | **26** definitions in `levelChunks.js` |
| Run length | **12** chunks (start + 10 middle + finish) |
| Sockets | `solid` ↔ `solid`, `open` ↔ `open` (pit continuity) |
| PRNG | Mulberry32 (`LevelGenerator.createRng`) |
| Seed source | `Date.now()` default; `?seed=` via `getRunSeedFromUrl()` |
| Par time | `round(55 + middleCount×4 + pitCount×6 + coins×0.5)` — **interim**; hybrid ground-path formula recommended (RESEARCH-NOTES §10b) |
| Finish flag | `finishX = width − 80` |
| Validation | Ground exists, finish in range, coin/pipe gap ≥ `COIN_MIN_PIPE_GAP` |
| Legacy | `LEVEL_1` hand layout preserved in `levelData.js` (not runtime) |

**Regression seed 42 chunk sequence:**

`start → pipe_single_offset → pipe_single_offset → buba_pipe → pit_small → flat_coins_5 → platform_pipe_combo → pipe_single_offset → pit_platform_bridge → block_stair → platform_double → finish`

### SMB scale (Phase 9b — ratios in v2 pixel space)

v2 draws at ~**3×** NES tile size (16 px → 48 px player). **Proportions** match SMB1; absolute NES pixel counts are not used directly.

| Object | SMB1 (NES) | Ratio | Muper Sario v2 |
|--------|------------|-------|----------------|
| Small Mario | ~16 px | 1× | **48 px** (`PLAYER_HEIGHT`) |
| Short pipe | ~32 px (2 tiles) | 2× Mario | **96 px** (`PIPE_HEIGHT`; top y = **404**) |
| Brick block | 16 px tile | — | **32 px** (`BLOCK_SIZE`) |
| Floating platform row | 3 tiles above ground | 3× block | **y = 404** (`PLATFORM_Y`) |
| Buba | ~1 tile | ~⅔ Mario | **32 px** |

See [`RESEARCH-NOTES.md`](RESEARCH-NOTES.md) § SMB visual scale · § Procedural level generation.

### Scoring

| Event | Points |
|-------|--------|
| Coin collected | +1 (`SCORE_PER_COIN`) |
| Buba stomped | +1 (`SCORE_PER_BUBA`) |
| Level win time bonus | Multiplier on base only |

**Final score (level complete):**

```
multiplier = clamp(parTimeSeconds / levelElapsed, 0.5, 2.0)
finalScore = round(baseScore × multiplier)
```

- `parTimeSeconds` from **generated layout** (not fixed 90 s)
- Base max **varies per run** (coin/Buba counts depend on chunk sequence)
- Game over: saves **base score only**

### Physics (summary)

| System | Key values |
|--------|------------|
| Walk / run | 3.5 / 5.75 px/frame |
| Jump | −12.5 initial vy; tier rise/fall gravity; ~130 px max rise |
| Coyote | 0.15 s ground · **0.22 s platform** · 0.1 s jump buffer |
| Stomp bounce | `PLAYER_STOMP_BOUNCE` −8 |
| Run key | **Left Shift only** |
| SMB run+jump | `airRunJump`, `airFastMomentum`, `jumpSpeedTier` 0–2 |

### Buba stomp collision (Phase 8)

| Rule | Detail |
|------|--------|
| Stomp band | `feetDepth ≤ BUBA_STOMP_TOLERANCE + height × 0.5` |
| Player position | Center-of-mass above Buba midline (`0.55` height fraction) |
| Descending | `vy ≥ 0` at **frame start** |
| Multi-Buba frame | Stomp pass first; skip hurt pass if any stomp this frame |
| Patrol | Reverses at pipes, blocks, ledges |

### Procedural art

| Asset | Generator | Style |
|-------|-----------|-------|
| Trees | `generateTree()` | 10 flat vector styles; compositor α=1; generic underlay **reverted**; per-style silhouettes if bleed returns (§10b) |
| Mountains | `generateMountain()` | Low-poly facets; solid `#RRGGBB`; compositor α=1 |
| Blocks | `generateBlock()` | SMB orange brick, 32×32 |
| Clouds | `makeCloudPuffs()` | FlappyBird `Sky.js` model |
| Player | `generatePlayer()` | Inverted palette; vertical leg walk cycle |
| Pipes, coins, Bubas, ground | `ProceduralGen.js` | Procedural sprites |

**Design references (not loaded at runtime):**

| File | Purpose |
|------|---------|
| `assets/examples/hand-drawn-trees-collection-set-illustration-for-infographic-or-other-uses-vector.webp` | Tree style guide |
| `assets/examples/vector-generated-mountains-example.png` | Mountain style guide |
| `assets/examples/` (SMB 1-1 panorama) | Level chunk / segment reference for Phase 10 PCG |

### Storage

| Key | Purpose |
|-----|---------|
| `muperSario2Scores` | Top 10 leaderboard `{score, name, date}[]` |
| `muperSario2Muted` | `"true"` / `"false"` audio mute |

### Deploy

| Setting | Value |
|---------|-------|
| Host | GitHub Pages |
| Source | `main` branch, `/` root |
| Static | `.nojekyll` present; ES modules over HTTPS |
| BGM on Pages | `assets/music/background.wav` **committed** |

---

## Phase history (shipped)

| Phase | Deliverable |
|-------|-------------|
| 0 | Scaffold, DESIGN, launch scripts |
| 1 | Copy proven v1 modules |
| 2 | Rewrite Player, Pipe, GameScene, config |
| 3 | index.html, test.html, wiring |
| 4 | Manual QA (static level era) |
| 5 | Run, Bubas, BGM, name entry, visuals |
| 6 | Side-scroll 4800 px, camera, parallax, UiText, mute |
| 7 | SMB run+jump, coyote, stomp score, time bonus |
| 4b | GitHub + Pages deploy |
| 8 | Flat vector trees, low-poly mountains, Buba stomp hardening |
| 9 | Vertical leg animation, opaque trees, Block entity, coin platforms |
| 9b | SMB scale: pipes 96 px, coin height/spacing, layout retune |
| **10** | **26 PCG chunks, LevelGenerator, rogue-lite runs, `?seed=` param** |
| **10b** | **Parallax opacity + par-time research; underlay reverted; doc sync** |

### Open work (Phase 10b)

| Item | Status | Doc |
|------|--------|-----|
| Revert `drawTreeOpaqueUnderlay` / `flattenTreeAlpha` | ✅ Reverted 2026-08-12 | QA #34 |
| Tree sprite opacity (per-style silhouettes) | Pending if bleed returns | RESEARCH-NOTES §10b, QA #33 |
| Hybrid ground-path `parTimeSeconds` | Pending code | RESEARCH-NOTES § Dynamic par time, QA #35 |

---

## Research sources (cited in repo)

| Topic | Source |
|-------|--------|
| SMB1 movement | [SMBpedia Movement](https://simplistic6502.github.io/smb1_tll/smbpedia_movement.html) |
| SMB1 run+jump port | [mitxela SMB1](https://mitxela.com/projects/console/mario) |
| PCG evaluation | [Shaker et al. 2024](https://arxiv.org/html/2404.18657v1) |
| Platformer PCG constraints | [Smith et al. AIIDE 2021](https://cdn.aaai.org/ojs/18755/18755-52-22428-1-10-20210929.pdf) |
| Mario scene stitching | [Green et al. IEEE CoG 2020](https://ieee-cog.org/2020/papers/paper_34.pdf) |
| Roguelite level design | [Abratabia roguelike levels](https://www.abratabia.com/procedural-generation/roguelike-levels.php) |
| PCG algorithms survey | [Generalist Programmer 2026](https://generalistprogrammer.com/procedural-generation-games) |
| SMB visual scale | SMB1 World 1-1 reference (2× pipe : 1× Mario ratio) |
| One-way platforms | MDN collision · Bugnet article |
| Canvas compositor alpha | [MDN globalAlpha](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha) |
| Canvas opaque context | [MDN getContext alpha](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) |
| Parallax depth (no layer opacity) | [FreePixel.art parallax guide](https://freepixel.art/blog/how-to-add-parallax-scrolling-backgrounds-pixel-art-game) |
| Flat vector silhouettes | [SVGSketch boolean ops](https://svgsketch.com/svg-boolean-operations) |
| Keyboard codes | MDN KeyboardEvent.code |
| Clouds | FlappyBird `Sky.js` (ThinkingCap port) |

Full PCG section: [`RESEARCH-NOTES.md`](RESEARCH-NOTES.md) § Procedural level generation.

---

## Validation commands

```powershell
cd D:\Apps\Muper_Sario_2.0
Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }
```

- Local test: http://localhost:38473/test.html → **23/23**
- Reproducible run: http://localhost:38473/?seed=42
- Generator smoke: `node --input-type=module -e "import { generateValidatedLevel } from './src/utils/LevelGenerator.js'; console.log(generateValidatedLevel(42).chunkSequence);"`
- Live test: https://theycallmehenry.github.io/muper-sario/test.html → **23/23** (after deploy)
