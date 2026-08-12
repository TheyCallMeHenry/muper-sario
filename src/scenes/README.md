# scenes/

Scene state machines — thin orchestration only.

| Module | Role |
|--------|------|
| `TitleScene.js` | Main menu (UiText panels); procedural backdrop — mountains/trees at compositor **α=1** |
| `GameScene.js` | Side-scroll gameplay; **procedural level on enter** (`createRunLevel`, optional `?seed=`); pipe + block collision; two-pass Buba; time bonus; level completion |
| `HighScoresScene.js` | Leaderboard (UiText panel layout) |

**Level load:** `enter()` → `getRunSeedFromUrl()` → `createRunLevel(seed)` → spawn entities from merged layout.

**Scoring flow (GameScene):** coins/Bubas → `addScore` during play; on win → `base × timeMultiplier` (layout `parTimeSeconds` — interim heuristic; hybrid formula planned).

**Buba flow:** capture `frameDescending` → stomp pass (score + bounce) → hurt pass only if no stomp.

**Platform flow:** unified loop over `[...pipes, ...blocks]` for one-way top + side collision; `setGroundContact('platform')` on land.

Collision resolution order must follow [`DESIGN.md`](../../DESIGN.md).
