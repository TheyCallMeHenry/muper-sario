# utils/

Shared non-entity helpers.

| Module | Role |
|--------|------|
| `ProceduralGen.js` | Canvas procedural graphics — see below |
| `UiText.js` | Menu panels + stroked canvas text |
| `Storage.js` | Single localStorage API (`muperSario2Scores`) |
| `MathUtils.js` | `clamp`, `computeTimeScoreMultiplier`, `formatTime` |
| `LevelGenerator.js` | Seeded chunk assembly → world layout (Phase 10) |

No gameplay constants here — use `config/`.

## ProceduralGen.js highlights

| Generator | Notes |
|-----------|-------|
| `generateTree()` | 10 flat vector styles (`TREE_STYLES`); seed-picked; generic underlay **reverted** (Phase 10b) |
| `generateMountain()` | Low-poly facets; unified silhouette; solid `#RRGGBB`; compositor α=1 |
| `generateBlock()` | 32×32 SMB orange brick (Phase 9) |
| `generateCloud()` / `makeCloudPuffs()` | FlappyBird `Sky.js` algorithm; semi-transparent **by design** |
| `generatePlayer()` | Inverted palette; **vertical leg walk cycle** (Phase 9) |
| `generatePipe()`, `generateCoin()`, `generateBuba()` | Gameplay entities |
| `generateGround()` | Grass + dirt texture tiles |

### Tree opacity (Phase 10b)

| Item | Status |
|------|--------|
| Compositor `alpha: 1` in `Background.js` / `TitleScene.js` | ✅ |
| Generic `drawTreeOpaqueUnderlay()` | ❌ **Removed** — rejected approach |
| `flattenTreeAlpha()` post-pass | ❌ **Removed** — band-aid only |
| Per-style solid canopy silhouettes | Pending **if** parallax bleed recurs |

- **Do not reintroduce** one-size green oval underlays.
- **Correct fix (if needed):** Per-style solid silhouettes; no `rgba()` in tree bake.
- See [`docs/RESEARCH-NOTES.md`](../../docs/RESEARCH-NOTES.md) § Phase 10b · [`docs/QA-FINDINGS.md`](../../docs/QA-FINDINGS.md) § #33–34.

## LevelGenerator.js (Phase 10)

- `generateValidatedLevel(seed)` → merged layout + `parTimeSeconds`
- **Interim par:** `55 + middleCount×4 + pitCount×6 + coins×0.5`
- **Planned:** Ground-path hybrid formula — RESEARCH-NOTES § Dynamic par time
- `getRunSeedFromUrl()` — `?seed=` URL param

Design references: [`assets/examples/`](../../assets/examples/)
