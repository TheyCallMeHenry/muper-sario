// Buba - ground-patrol enemy (legally distinct from Goomba; SMB-style behavior)
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';

const SQUISH_HEIGHT = 8;

export class Buba {
  constructor(x, patrolMin, patrolMax, direction = -1) {
    this.width = GAME_CONFIG.BUBA_WIDTH;
    this.height = GAME_CONFIG.BUBA_HEIGHT;
    this.groundY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
    this.x = x;
    this.y = this.groundY - this.height;
    this.patrolMin = patrolMin;
    this.patrolMax = patrolMax;
    this.direction = direction;
    this.vx = direction * GAME_CONFIG.BUBA_SPEED;
    this.alive = true;
    this.squishTimer = 0;
    this.animationFrame = 0;
    this.animTimer = 0;

    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = this.width;
    this.spriteCanvas.height = this.height;
    this.squishCanvas = document.createElement('canvas');
    this.squishCanvas.width = this.width;
    this.squishCanvas.height = SQUISH_HEIGHT;
    ProceduralGen.generateBuba(this.spriteCanvas, this.width, this.height, 0);
    ProceduralGen.generateBubaSquished(this.squishCanvas, this.width, SQUISH_HEIGHT);
  }

  update(deltaTime, pipes, ground, worldWidth) {
    if (!this.alive) {
      this.squishTimer -= deltaTime;
      return;
    }

    this.animTimer += deltaTime;
    const frame = Math.floor(this.animTimer * 6) % 2;
    if (frame !== this.animationFrame) {
      this.animationFrame = frame;
      ProceduralGen.generateBuba(this.spriteCanvas, this.width, this.height, frame);
    }

    const nextX = this.x + this.vx;
    const footProbeX = this.vx < 0 ? nextX : nextX + this.width;
    const footY = this.y + this.height + 2;

    let reverse = false;
    let blockingPipe = null;

    if (nextX < this.patrolMin || nextX + this.width > this.patrolMax) {
      reverse = true;
    }

    if (nextX < 0 || nextX + this.width > worldWidth) {
      reverse = true;
    }

    if (!this._hasGroundAt(footProbeX, footY, pipes, ground)) {
      reverse = true;
    }

    for (const pipe of pipes) {
      const pb = pipe.getBounds();
      const futureBounds = { x: nextX, y: this.y, width: this.width, height: this.height };
      if (this._intersects(futureBounds, pb)) {
        reverse = true;
        blockingPipe = pb;
        break;
      }
    }

    if (reverse) {
      this.direction *= -1;
      this.vx = this.direction * GAME_CONFIG.BUBA_SPEED;
      if (blockingPipe) {
        this._nudgeAwayFromPipe(blockingPipe);
      }
    } else {
      this.x = nextX;
    }
  }

  _nudgeAwayFromPipe(pipeBounds) {
    const center = this.x + this.width / 2;
    const pipeCenter = pipeBounds.x + pipeBounds.width / 2;
    if (center < pipeCenter) {
      this.x = pipeBounds.x - this.width;
      this.direction = -1;
    } else {
      this.x = pipeBounds.x + pipeBounds.width;
      this.direction = 1;
    }
    this.vx = this.direction * GAME_CONFIG.BUBA_SPEED;
  }

  _hasGroundAt(x, footY, pipes, ground) {
    if (ground.hasSolidGroundAt(x) && footY <= this.groundY + 4) {
      return true;
    }
    for (const pipe of pipes) {
      const cap = pipe.getCapBounds();
      if (x >= cap.x && x <= cap.x + cap.width && footY <= cap.y + GAME_CONFIG.PIPE_LANDING_TOLERANCE) {
        return true;
      }
    }
    return false;
  }

  _intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  /**
   * @returns {'stomp'|'hurt'|null}
   */
  checkPlayerCollision(player) {
    if (!this.alive || this.squishTimer > 0) return null;

    const pb = player.getBounds();
    const bb = this.getBounds();

    if (!this._intersects(pb, bb)) return null;

    const playerBottom = pb.y + pb.height;
    const bubaTop = bb.y;
    const tolerance = GAME_CONFIG.BUBA_STOMP_TOLERANCE;
    const descending = player.vy >= 0;
    const stompZone = playerBottom <= bubaTop + tolerance;

    if (descending && stompZone && pb.y + pb.height * 0.5 < bubaTop + bb.height * 0.5) {
      return 'stomp';
    }

    return 'hurt';
  }

  stomp() {
    this.alive = false;
    this.squishTimer = 0.4;
    this.vx = 0;
  }

  getBounds() {
    if (!this.alive) {
      return {
        x: this.x,
        y: this.groundY - SQUISH_HEIGHT,
        width: this.width,
        height: SQUISH_HEIGHT
      };
    }
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getSquishY() {
    return this.groundY - SQUISH_HEIGHT;
  }

  render(ctx) {
    if (!this.alive) {
      if (this.squishTimer > 0) {
        ctx.drawImage(this.squishCanvas, this.x, this.getSquishY());
      }
      return;
    }
    if (this.direction < 0) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.spriteCanvas, -this.x - this.width, this.y);
      ctx.restore();
    } else {
      ctx.drawImage(this.spriteCanvas, this.x, this.y);
    }
  }
}
