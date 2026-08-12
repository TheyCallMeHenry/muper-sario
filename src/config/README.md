# config/

Runtime constants and level layout data.

| File | Role |
|------|------|
| `gameConfig.js` | Physics, coyote, SMB run+jump, scoring, SMB scale, camera, colors |
| `levelData.js` | `createRunLevel()` factory, legacy `LEVEL_1` reference |
| `levelChunks.js` | **26** socket-matched 400 px segments for procedural assembly |

**Scoring keys:** `SCORE_PER_COIN`, `SCORE_PER_BUBA`, `TIME_SCORE_MIN_MULT`, `TIME_SCORE_MAX_MULT`

**SMB scale keys:** `PLAYER_HEIGHT` (48), `PIPE_HEIGHT` (96), `BLOCK_SIZE` (32), `COIN_FLOAT_ABOVE` (20), `COIN_MIN_PIPE_GAP` (48)

**Buba keys:** `BUBA_STOMP_TOLERANCE` (10), `PLAYER_STOMP_BOUNCE` (−8)

**Coyote keys:** `COYOTE_TIME` (0.15 s), `COYOTE_TIME_PLATFORM` (0.22 s), `JUMP_BUFFER_TIME` (0.1 s)

**Rules:**

- Every `gameConfig` key must be referenced by at least one module
- Level content: edit **`levelChunks.js`** (new segments) or weights in chunk defs
- Generator logic: **`src/utils/LevelGenerator.js`**
- **Par time (interim):** `55 + middleCount×4 + pitCount×6 + coins×0.5` — hybrid ground-path formula planned (RESEARCH-NOTES §10b)
- Legacy hand layout: `LEVEL_1` in `levelData.js`
- See [`DESIGN.md`](../../DESIGN.md) for locked architecture
