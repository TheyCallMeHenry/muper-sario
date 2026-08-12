// Pipe - platform with one-way collision (v2 rewrite)
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';

export class Pipe {
  constructor(x, height) {
    this.x = x;
    this.width = GAME_CONFIG.PIPE_WIDTH;
    this.height = height;
    this.capExtension = GAME_CONFIG.PIPE_CAP_EXTENSION;
    this.bodyWidth = GAME_CONFIG.PIPE_WIDTH;

    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = this.bodyWidth + this.capExtension * 2;
    this.spriteCanvas.height = height;
    ProceduralGen.generatePipe(
      this.spriteCanvas,
      this.bodyWidth,
      height,
      false,
      Math.random(),
      this.capExtension
    );

    this.y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - height;
  }

  render(ctx) {
    ctx.drawImage(this.spriteCanvas, this.x - this.capExtension, this.y);
  }

  getBounds() {
    return {
      x: this.x + this.capExtension,
      y: this.y,
      width: this.bodyWidth,
      height: this.height
    };
  }

  /** Wider cap hitbox for one-way platform landing (76px sprite) */
  getCapBounds() {
    return {
      x: this.x - this.capExtension,
      y: this.y,
      width: this.bodyWidth + this.capExtension * 2,
      height: this.height
    };
  }

  /**
   * One-way platform collision per DESIGN.md
   * null = no collision | { type: 'top' } | { type: 'side', pushX }
   */
  checkCollisionDetailed(player) {
    const pb = player.getBounds();
    const bodyBounds = this.getBounds();
    const capBounds = this.getCapBounds();
    const pipeTop = bodyBounds.y;
    const pipeBottom = bodyBounds.y + bodyBounds.height;
    const tolerance = GAME_CONFIG.PIPE_LANDING_TOLERANCE;

    const playerBottom = pb.y + pb.height;
    const playerTop = pb.y;

    if (playerBottom <= pipeTop || playerTop >= pipeBottom) return null;

    const onOrAboveCap = playerBottom <= pipeTop + tolerance;
    const descendingOrGrounded = player.vy >= 0 || player.onGround;

    const overlapsCapX = pb.x < capBounds.x + capBounds.width &&
                         pb.x + pb.width > capBounds.x;
    if (overlapsCapX && onOrAboveCap && descendingOrGrounded) {
      return { type: 'top' };
    }

    // Ascending pass-through (v1 pitfall D-004 fix)
    if (player.vy < 0) {
      return null;
    }

    const overlapsBodyX = pb.x < bodyBounds.x + bodyBounds.width &&
                          pb.x + pb.width > bodyBounds.x;
    if (!overlapsBodyX || onOrAboveCap) return null;

    const playerCenterX = pb.x + pb.width / 2;
    const pipeCenterX = bodyBounds.x + bodyBounds.width / 2;
    const pushX = playerCenterX < pipeCenterX ? -1 : 1;
    return { type: 'side', pushX };
  }
}
