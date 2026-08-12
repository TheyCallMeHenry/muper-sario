# entities/

Drawable and collidable game objects.

| Module | Role |
|--------|------|
| `Player.js` | SMB run+jump physics, coyote (ground/platform), jump buffer |
| `Pipe.js` | One-way platform collision (76 px cap / 60 px body); 96 px tall |
| `Block.js` | SMB floating brick (32×32); one-way top collision |
| `Buba.js` | Ground-patrol enemy; stomp / side-hit; pipe + block aware |
| `Coin.js` | Collectible (+1 score) |
| `Ground.js` | Segmented ground, pits (from generated layout), camera-scrolled texture |
| `Background.js` | Parallax — mountains 0.1×, clouds 0.25×, trees 0.5× |

## Background.js (parallax)

| Layer | Parallax | Compositor alpha | Notes |
|-------|----------|------------------|-------|
| Sky | 0 (fixed) | 1 | Gradient + sun |
| Mountains | 0.1 | **1** | Baked sprites from `generateMountain()` |
| Clouds | 0.25 | 0.85 (in drawCloudPuffs) | Intentionally soft |
| Forests | 0.5 | **1** | Baked sprites from `generateTree()` |

Uses `ctx.save()` / `restore()` per parallax element. Tree sprites: compositor α=1; generic underlay **reverted** (Phase 10b). Per-style solid silhouettes if parallax bleed recurs — see RESEARCH-NOTES §10b.

## Buba collision (see DESIGN.md)

- `checkPlayerCollision(player, { descending })` → `'stomp' | 'hurt' | null`
- Stomp band uses upper half of hitbox + player-above-midline test
- `update(deltaTime, pipes, blocks, ground, worldWidth)` — reverses at blocks + pipes
- Dead Bubas return `null`; 8 px squish sprite at `groundY`

Entities do not own scene flow or final score rules (time bonus applied in `GameScene`).
