# scenes/

Scene state machines — thin orchestration only.

| Module | Role |
|--------|------|
| `TitleScene.js` | Main menu (UiText panels) |
| `GameScene.js` | Side-scroll gameplay, scoring, time bonus, level completion |
| `HighScoresScene.js` | Leaderboard (UiText panel layout) |

**Scoring flow (GameScene):** coins/Bubas → `addScore` during play; on win → `base × timeMultiplier` → `setScore`.

Collision resolution order must follow [`DESIGN.md`](../../DESIGN.md).
