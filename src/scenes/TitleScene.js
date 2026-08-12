// TitleScene - Main menu with Start Game, High Scores, Quit buttons
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';
import { UiText } from '../utils/UiText.js';

export class TitleScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.game = sceneManager.getGame();
    this.selectedOption = 0;
    this.options = ['Start Game', 'High Scores', 'Quit'];
    this.backgroundCanvas = null;
    this.titleAlpha = 0;
    this.titleFadeIn = true;
  }

  enter() {
    this.selectedOption = 0;
    this.titleAlpha = 0;
    this.titleFadeIn = true;
    this.generateBackground();
    this.updateScoreDisplay();
  }

  generateBackground() {
    this.backgroundCanvas = document.createElement('canvas');
    this.backgroundCanvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.backgroundCanvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    const ctx = this.backgroundCanvas.getContext('2d');

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
    skyGrad.addColorStop(0, GAME_CONFIG.COLORS.SKY_TOP);
    skyGrad.addColorStop(1, GAME_CONFIG.COLORS.SKY_BOTTOM);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Generate clouds
    for (let i = 0; i < 12; i++) {
      const cloudCanvas = document.createElement('canvas');
      const size = 40 + Math.random() * 80;
      cloudCanvas.width = size;
      cloudCanvas.height = size * 0.6;
      ProceduralGen.generateCloud(cloudCanvas, size, size * 0.6, Math.random());

      const x = Math.random() * (GAME_CONFIG.CANVAS_WIDTH - size);
      const y = 40 + Math.random() * 140;
      ctx.drawImage(cloudCanvas, x, y);
    }

    // Generate distant mountains
    for (let i = 0; i < 6; i++) {
      const mtnCanvas = document.createElement('canvas');
      const w = 180 + Math.random() * 220;
      const h = 120 + Math.random() * 160;
      mtnCanvas.width = w;
      mtnCanvas.height = h;
      ProceduralGen.generateMountain(mtnCanvas, w, h, Math.random());

      const x = i * (GAME_CONFIG.CANVAS_WIDTH / 6) + Math.random() * 50;
      const y = GAME_CONFIG.CANVAS_HEIGHT - 100 - h;
      ctx.globalAlpha = 0.5 + Math.random() * 0.3;
      ctx.drawImage(mtnCanvas, x, y);
      ctx.globalAlpha = 1;
    }

    // Generate forests
    for (let i = 0; i < 20; i++) {
      const treeCanvas = document.createElement('canvas');
      const w = 30 + Math.random() * 50;
      const h = 60 + Math.random() * 80;
      treeCanvas.width = w;
      treeCanvas.height = h;
      ProceduralGen.generateTree(treeCanvas, w, h, Math.random());

      const x = i * (GAME_CONFIG.CANVAS_WIDTH / 20) + Math.random() * 20;
      const y = GAME_CONFIG.CANVAS_HEIGHT - 100 - h;
      ctx.globalAlpha = 0.6 + Math.random() * 0.3;
      ctx.drawImage(treeCanvas, x, y);
      ctx.globalAlpha = 1;
    }

    // Generate ground
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = GAME_CONFIG.CANVAS_WIDTH;
    groundCanvas.height = GAME_CONFIG.GROUND_HEIGHT;
    ProceduralGen.generateGround(groundCanvas, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.GROUND_HEIGHT, 0.5);
    ctx.drawImage(groundCanvas, 0, GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT);
  }

  update(deltaTime) {
    // Handle title fade in
    if (this.titleFadeIn) {
      this.titleAlpha += deltaTime * 2;
      if (this.titleAlpha >= 1) {
        this.titleAlpha = 1;
        this.titleFadeIn = false;
      }
    }

    // Handle input
    const input = this.game.getInput();

    if (input.isMenuSelect()) {
      this.selectOption();
    }

    // Keyboard navigation
    if (input.keys['ArrowUp']) {
      this.selectedOption = Math.max(0, this.selectedOption - 1);
      input.keys['ArrowUp'] = false;
      this.game.getAudio().playMenuSelect();
    }
    if (input.keys['ArrowDown']) {
      this.selectedOption = Math.min(this.options.length - 1, this.selectedOption + 1);
      input.keys['ArrowDown'] = false;
      this.game.getAudio().playMenuSelect();
    }
  }

  selectOption() {
    this.game.getAudio().playMenuConfirm();
    const option = this.options[this.selectedOption];

    if (option === 'Start Game') {
      this.game.resetScore();
      this.game.changeScene('game');
    } else if (option === 'High Scores') {
      this.game.changeScene('high_scores');
    } else if (option === 'Quit') {
      this.game.stop();
    }
  }

  updateScoreDisplay() {
    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    const livesEl = document.getElementById('lives-display');
    if (scoreEl) scoreEl.style.display = 'none';
    if (highScoreEl) highScoreEl.style.display = 'none';
    if (livesEl) livesEl.style.display = 'none';
  }

  render(ctx) {
    ctx.drawImage(this.backgroundCanvas, 0, 0);

    UiText.drawPanel(ctx, 110, 72, 580, 108, 10);
    UiText.drawPanel(ctx, 210, 252, 380, 172, 10);
    UiText.drawPanel(ctx, 175, 462, 450, 62, 8, 'rgba(0, 0, 0, 0.72)');

    ctx.globalAlpha = this.titleAlpha;
    UiText.drawText(ctx, 'MUPER SARIO', GAME_CONFIG.CANVAS_WIDTH / 2, 118, {
      font: 'bold 48px "Courier New", monospace',
      lineWidth: 4
    });
    UiText.drawText(ctx, 'A Super Platformer Adventure', GAME_CONFIG.CANVAS_WIDTH / 2, 158, {
      font: 'bold 20px "Courier New", monospace',
      lineWidth: 3
    });
    ctx.globalAlpha = 1;

    const menuY = 280;
    const menuSpacing = 50;

    this.options.forEach((option, index) => {
      const y = menuY + index * menuSpacing;

      if (index === this.selectedOption) {
        UiText.drawText(ctx, '> ' + option + ' <', GAME_CONFIG.CANVAS_WIDTH / 2, y, {
          fill: '#FFD700',
          stroke: '#3d2e00',
          font: 'bold 28px "Courier New", monospace',
          lineWidth: 4
        });
      } else {
        UiText.drawText(ctx, option, GAME_CONFIG.CANVAS_WIDTH / 2, y, {
          font: 'bold 24px "Courier New", monospace',
          lineWidth: 3
        });
      }
    });

    UiText.drawText(ctx, 'Use ARROW KEYS to navigate', GAME_CONFIG.CANVAS_WIDTH / 2, 478, {
      font: '16px "Courier New", monospace',
      lineWidth: 2
    });
    UiText.drawText(ctx, 'SPACE to select', GAME_CONFIG.CANVAS_WIDTH / 2, 508, {
      font: '16px "Courier New", monospace',
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
