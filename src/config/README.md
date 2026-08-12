# config/

Runtime constants and level layout data.

| File | Role |
|------|------|
| `gameConfig.js` | Physics, coyote, SMB run+jump, scoring, time bonus, camera, colors |
| `levelData.js` | `LEVEL_1` — pipes, coins, bubas, ground segments, finish flag, **parTimeSeconds** |

**Scoring keys:** `SCORE_PER_COIN`, `SCORE_PER_BUBA`, `TIME_SCORE_MIN_MULT`, `TIME_SCORE_MAX_MULT`

**Coyote keys:** `COYOTE_TIME` (0.15 s), `COYOTE_TIME_PLATFORM` (0.22 s), `JUMP_BUFFER_TIME` (0.1 s)

**Rules:**

- Every `gameConfig` key must be referenced by at least one module
- Level edits go in `levelData.js` — keep Buba patrol ranges clear of pipe bodies
- See [`DESIGN.md`](../../DESIGN.md) for locked architecture
