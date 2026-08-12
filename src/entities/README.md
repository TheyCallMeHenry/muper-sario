# entities/

Drawable and collidable game objects.

| Module | Role |
|--------|------|
| `Player.js` | SMB run+jump physics, coyote (ground/platform), jump buffer |
| `Pipe.js` | One-way platform collision (76 px cap / 60 px body) |
| `Buba.js` | Ground-patrol enemy; stomp (+1 score) / side-hit |
| `Coin.js` | Collectible (+1 score) |
| `Ground.js` | Segmented ground, pits, camera-scrolled texture |
| `Background.js` | Camera parallax sky, mountains, clouds, trees |

Entities do not own scene flow or final score rules (time bonus applied in `GameScene`).
