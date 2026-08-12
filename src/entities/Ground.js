// Ground - segmented world ground with pits and camera-scrolled texture
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';

const TILE_WIDTH = 400;

export class Ground {
  constructor(segments) {
    this.height = GAME_CONFIG.GROUND_HEIGHT;
    this.y = GAME_CONFIG.CANVAS_HEIGHT - this.height;
    this.segments = segments;

    this.textureCanvas = document.createElement('canvas');
    this.textureCanvas.width = TILE_WIDTH;
    this.textureCanvas.height = this.height;
    ProceduralGen.generateGround(this.textureCanvas, TILE_WIDTH, this.height, 0.5);
  }

  hasSolidGroundAt(worldX) {
    for (const seg of this.segments) {
      if (worldX >= seg.start && worldX <= seg.end) return true;
    }
    return false;
  }

  getSurfaceY(worldX) {
    return this.hasSolidGroundAt(worldX) ? this.y : null;
  }

  render(ctx, cameraX) {
    const viewLeft = cameraX;
    const viewRight = cameraX + GAME_CONFIG.CANVAS_WIDTH;

    for (const seg of this.segments) {
      if (seg.end < viewLeft || seg.start > viewRight) continue;

      const drawStart = Math.max(seg.start, viewLeft);
      const drawEnd = Math.min(seg.end, viewRight);
      let x = drawStart;

      while (x < drawEnd) {
        const srcX = x % TILE_WIDTH;
        const sliceW = Math.min(TILE_WIDTH - srcX, drawEnd - x);
        const screenX = x - cameraX;

        ctx.drawImage(
          this.textureCanvas,
          srcX, 0, sliceW, this.height,
          screenX, this.y, sliceW, this.height
        );
        x += sliceW;
      }
    }
  }

  getY() {
    return this.y;
  }
}
