// Background - Sky, mountains, forests, clouds with camera-based parallax
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';

export class Background {
  constructor(levelWidth) {
    this.levelWidth = levelWidth;
    this.layers = [];
    this.generateLayers();
  }

  generateLayers() {
    this.layers.push({
      type: 'sky',
      parallax: 0,
      render: (ctx) => this.renderSky(ctx)
    });

    this.layers.push({
      type: 'mountains',
      parallax: 0.1,
      elements: this.generateMountains(Math.ceil(this.levelWidth / 280) + 2)
    });

    this.layers.push({
      type: 'clouds',
      parallax: 0.25,
      elements: this.generateClouds(Math.ceil(this.levelWidth / 200) + 8)
    });

    this.layers.push({
      type: 'forests',
      parallax: 0.5,
      elements: this.generateForests(Math.ceil(this.levelWidth / 120) + 4)
    });
  }

  generateMountains(count) {
    const mountains = [];
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      const w = 180 + Math.random() * 220;
      const h = 120 + Math.random() * 160;
      canvas.width = w;
      canvas.height = h;
      ProceduralGen.generateMountain(canvas, w, h, Math.random());

      mountains.push({
        canvas,
        worldX: i * 260 + Math.random() * 80 - 40,
        y: GAME_CONFIG.CANVAS_HEIGHT - 100 - h,
        w,
        h,
        alpha: 1
      });
    }
    return mountains;
  }

  generateClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
      const scale = Math.random() * 0.6 + 0.4;
      clouds.push({
        worldX: Math.random() * this.levelWidth * 1.1 - 50,
        y: Math.random() * 250 + 20,
        scale,
        puffs: ProceduralGen.makeCloudPuffs(scale)
      });
    }
    return clouds;
  }

  generateForests(count) {
    const trees = [];
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      const w = 30 + Math.random() * 50;
      const h = 60 + Math.random() * 80;
      canvas.width = w;
      canvas.height = h;
      ProceduralGen.generateTree(canvas, w, h, Math.random());

      trees.push({
        canvas,
        worldX: i * 110 + Math.random() * 40 - 20,
        y: GAME_CONFIG.CANVAS_HEIGHT - 100 - h,
        w,
        h,
        alpha: 1
      });
    }
    return trees;
  }

  renderSky(ctx) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#4FC3F7');
    skyGrad.addColorStop(0.45, GAME_CONFIG.COLORS.SKY_TOP);
    skyGrad.addColorStop(1, GAME_CONFIG.COLORS.SKY_BOTTOM);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT);

    const sunGrad = ctx.createRadialGradient(680, 70, 8, 680, 70, 55);
    sunGrad.addColorStop(0, 'rgba(255,248,220,0.95)');
    sunGrad.addColorStop(0.4, 'rgba(255,235,150,0.45)');
    sunGrad.addColorStop(1, 'rgba(255,235,150,0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(600, 0, 200, 160);
  }

  render(ctx, cameraX) {
    this.renderSky(ctx);

    for (const layer of this.layers) {
      if (layer.type === 'sky') continue;

      if (layer.type === 'clouds' && layer.elements) {
        for (const c of layer.elements) {
          const screenX = c.worldX - cameraX * layer.parallax;
          if (screenX < -120 || screenX > GAME_CONFIG.CANVAS_WIDTH + 120) continue;
          ProceduralGen.drawCloudPuffs(ctx, screenX, c.y, c.puffs);
        }
        continue;
      }

      if (layer.elements) {
        for (const el of layer.elements) {
          const screenX = el.worldX - cameraX * layer.parallax;
          if (screenX + el.w < -20 || screenX > GAME_CONFIG.CANVAS_WIDTH + 20) continue;
          ctx.save();
          ctx.globalAlpha = el.alpha ?? 1;
          ctx.drawImage(el.canvas, screenX, el.y);
          ctx.restore();
        }
      }
    }
  }
}
