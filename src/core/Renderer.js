// Renderer - Canvas render dispatch (v2: minimal surface)
import { GAME_CONFIG } from '../config/gameConfig.js';

export class Renderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.width = GAME_CONFIG.CANVAS_WIDTH;
    this.height = GAME_CONFIG.CANVAS_HEIGHT;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  render(scene) {
    this.clear();
    if (scene && typeof scene.render === 'function') {
      scene.render(this.ctx);
    }
  }
}
