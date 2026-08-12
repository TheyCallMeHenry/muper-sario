// Coin - collectible (v2: cached animation frames)
import { ProceduralGen } from '../utils/ProceduralGen.js';

export class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.collected = false;
    this.animationTimer = 0;
    this.animationFrame = 0;

    this.frames = [];
    for (let i = 0; i < 4; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = this.width;
      canvas.height = this.height;
      ProceduralGen.generateCoin(canvas, this.width, this.height, i);
      this.frames.push(canvas);
    }
  }

  update(deltaTime) {
    if (this.collected) return;
    this.animationTimer += deltaTime;
    this.animationFrame = Math.floor(this.animationTimer * 8) % 4;
  }

  render(ctx) {
    if (!this.collected) {
      ctx.drawImage(this.frames[this.animationFrame], this.x, this.y);
    }
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  collect() {
    this.collected = true;
  }
}
