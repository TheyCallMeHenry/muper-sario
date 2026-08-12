// HighScoresScene - v2: no fake placeholder rows
import { GAME_CONFIG } from '../config/gameConfig.js';
import { Storage } from '../utils/Storage.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';
import { UiText } from '../utils/UiText.js';

export class HighScoresScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.game = sceneManager.getGame();
    this.backgroundCanvas = null;
    this.scores = [];
  }

  enter() {
    this.scores = Storage.getAllScores();
    this.game.syncHighScoreDisplay();
    this.generateBackground();
    this.hideHud();
  }

  hideHud() {
    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    const livesEl = document.getElementById('lives-display');
    if (scoreEl) scoreEl.style.display = 'none';
    if (highScoreEl) highScoreEl.style.display = 'none';
    if (livesEl) livesEl.style.display = 'none';
  }

  generateBackground() {
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.backgroundCanvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    const ctx = this.backgroundCanvas.getContext('2d');

    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
    skyGrad.addColorStop(0, GAME_CONFIG.COLORS.SKY_TOP);
    skyGrad.addColorStop(1, GAME_CONFIG.COLORS.SKY_BOTTOM);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    for (let i = 0; i < 8; i++) {
      const cloudCanvas = document.createElement('canvas');
      const size = 40 + Math.random() * 80;
      cloudCanvas.width = size;
      cloudCanvas.height = size * 0.6;
      ProceduralGen.generateCloud(cloudCanvas, size, size * 0.6, Math.random());
      ctx.drawImage(cloudCanvas, Math.random() * (GAME_CONFIG.CANVAS_WIDTH - size), 40 + Math.random() * 100);
    }

    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = GAME_CONFIG.CANVAS_WIDTH;
    groundCanvas.height = GAME_CONFIG.GROUND_HEIGHT;
    ProceduralGen.generateGround(groundCanvas, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT, 0.5);
    ctx.drawImage(groundCanvas, 0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT);
  }

  update() {
    if (this.game.getInput().isMenuSelect()) {
      this.game.getAudio().playMenuConfirm();
      this.game.changeScene('title');
    }
  }

  render(ctx) {
    ctx.drawImage(this.backgroundCanvas, 0, 0);

    const panel = { x: 70, y: 62, w: 660, h: 468, pad: 28 };
    const innerLeft = panel.x + panel.pad;
    const innerRight = panel.x + panel.w - panel.pad;

    UiText.drawPanel(ctx, panel.x, panel.y, panel.w, panel.h, 12);

    UiText.drawText(ctx, 'HIGH SCORES', GAME_CONFIG.CANVAS_WIDTH / 2, 100, {
      font: 'bold 42px "Courier New", monospace',
      lineWidth: 4
    });

    if (this.scores.length === 0) {
      UiText.drawText(ctx, 'No scores yet — play a game!', GAME_CONFIG.CANVAS_WIDTH / 2, 280, {
        font: '20px "Courier New", monospace',
        fill: '#E8EEF5',
        lineWidth: 2
      });
    } else {
      const startY = 180;
      for (let i = 0; i < Math.min(this.scores.length, 10); i++) {
        const entry = this.scores[i];
        const y = startY + i * 40;
        UiText.drawText(ctx, `${i + 1}.`, innerLeft, y, {
          fill: '#FFD700',
          stroke: '#3d2e00',
          font: 'bold 24px "Courier New", monospace',
          align: 'left',
          lineWidth: 3
        });
        UiText.drawText(ctx, entry.name, innerLeft + 50, y, {
          font: 'bold 24px "Courier New", monospace',
          align: 'left',
          lineWidth: 3
        });
        UiText.drawText(ctx, String(entry.score), innerRight, y, {
          fill: '#FFD700',
          stroke: '#3d2e00',
          font: 'bold 24px "Courier New", monospace',
          align: 'right',
          lineWidth: 3
        });
      }
    }

    UiText.drawText(ctx, 'Press SPACE to go back', GAME_CONFIG.CANVAS_WIDTH / 2, 500, {
      font: '18px "Courier New", monospace',
      fill: '#E8EEF5',
      lineWidth: 2
    });
  }

  exit() {
    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    const livesEl = document.getElementById('lives-display');
    if (scoreEl) scoreEl.style.display = 'block';
    if (highScoreEl) highScoreEl.style.display = 'block';
    if (livesEl) livesEl.style.display = 'block';
  }
}
