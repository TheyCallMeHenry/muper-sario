# core/

Engine subsystems — no gameplay rules here.

| Module | Role |
|--------|------|
| `GameEngine.js` | Main loop, score/lives HUD, `addScore` / `setScore`, mute wiring |
| `SceneManager.js` | Scene registry: title, game, high_scores |
| `InputManager.js` | Keyboard; Left Shift run; name-entry queue |
| `AudioManager.js` | Web Audio SFX; HTMLAudio BGM; mute toggle + persistence |
| `Renderer.js` | Canvas clear + scene render dispatch |

Copied from v1 with trims per [`docs/EXTRACTION-MANIFEST.md`](../../docs/EXTRACTION-MANIFEST.md). Entry script cache bust: `GameEngine.js?v=5` in `index.html`.
