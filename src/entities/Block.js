// Block - SMB-style floating brick platform (one-way top collision)
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';

export class Block {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.BLOCK_SIZE;
    this.height = GAME_CONFIG.BLOCK_SIZE;

    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = this.width;
    this.spriteCanvas.height = this.height;
    ProceduralGen.generateBlock(this.spriteCanvas, this.width, Math.random());
  }

  render(ctx) {
    ctx.drawImage(this.spriteCanvas, this.x, this.y);
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  /** Same one-way rules as Pipe cap — land on top, pass through when ascending */
  checkCollisionDetailed(player) {
    const pb = player.getBounds();
    const bb = this.getBounds();
    const blockTop = bb.y;
    const blockBottom = bb.y + bb.height;
    const tolerance = GAME_CONFIG.PIPE_LANDING_TOLERANCE;

    const playerBottom = pb.y + pb.height;
    const playerTop = pb.y;

    if (playerBottom <= blockTop || playerTop >= blockBottom) return null;

    const onOrAboveTop = playerBottom <= blockTop + tolerance;
    const descendingOrGrounded = player.vy >= 0 || player.onGround;

    const overlapsX = pb.x < bb.x + bb.width && pb.x + pb.width > bb.x;
    if (overlapsX && onOrAboveTop && descendingOrGrounded) {
      return { type: 'top' };
    }

    if (player.vy < 0) return null;

    if (!overlapsX || onOrAboveTop) return null;

    const playerCenterX = pb.x + pb.width / 2;
    const blockCenterX = bb.x + bb.width / 2;
    return { type: 'side', pushX: playerCenterX < blockCenterX ? -1 : 1 };
  }
}
