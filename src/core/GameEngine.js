// GameEngine - v2: unified storage, capped timestep
import { GAME_CONFIG } from '../config/gameConfig.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { Renderer } from './Renderer.js';
import { Storage } from '../utils/Storage.js';

const MAX_PHYSICS_STEPS = 5;

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedDeltaTime = 1000 / 60;
    this.isRunning = false;

    this.renderer = new Renderer(this.ctx, this.canvas);
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.sceneManager = new SceneManager(this);

    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.lives = GAME_CONFIG.STARTING_LIVES;

    this.gameLoop = this.gameLoop.bind(this);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    this.handleResize();
    this.audioManager.init();
    const muteBtn = document.getElementById('mute-button');
    if (muteBtn) {
      this.audioManager.bindMuteButton(muteBtn);
    }
    this.syncHighScoreDisplay();
  }

  handleResize() {
    const container = document.getElementById('game-container');
    const scale = Math.min(
      container.clientWidth / GAME_CONFIG.CANVAS_WIDTH,
      container.clientHeight / GAME_CONFIG.CANVAS_HEIGHT
    );
    this.canvas.style.width = `${GAME_CONFIG.CANVAS_WIDTH * scale}px`;
    this.canvas.style.height = `${GAME_CONFIG.CANVAS_HEIGHT * scale}px`;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  stop() {
    this.isRunning = false;
    this.audioManager.stopBackgroundMusic();
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.accumulator += deltaTime;

    let steps = 0;
    while (this.accumulator >= this.fixedDeltaTime && steps < MAX_PHYSICS_STEPS) {
      this.update(this.fixedDeltaTime / 1000);
      this.accumulator -= this.fixedDeltaTime;
      steps++;
    }
    if (steps >= MAX_PHYSICS_STEPS) {
      this.accumulator = 0;
    }

    this.renderer.render(this.sceneManager.currentScene);
    requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    this.sceneManager.update(deltaTime);
    this.inputManager.update();
  }

  changeScene(sceneName, data = null) {
    this.sceneManager.changeScene(sceneName, data);
  }

  addScore(points) {
    this.score += points;
    this.updateScoreDisplay();
  }

  resetScore() {
    this.score = 0;
    this.updateScoreDisplay();
  }

  setScore(score) {
    this.score = Math.max(0, Math.round(score));
    this.updateScoreDisplay();
  }

  resetLives() {
    this.lives = GAME_CONFIG.STARTING_LIVES;
    this.updateLivesDisplay();
  }

  loseLife() {
    this.lives--;
    this.updateLivesDisplay();
    return this.lives;
  }

  syncHighScoreDisplay() {
    this.highScore = Storage.getHighScore();
    this.updateScoreDisplay();
  }

  updateScoreDisplay() {
    const scoreEl = document.getElementById('score-display');
    const highScoreEl = document.getElementById('high-score-display');
    if (scoreEl) scoreEl.textContent = `SCORE: ${this.score}`;
    if (highScoreEl) highScoreEl.textContent = `HIGH SCORE: ${this.highScore}`;
  }

  updateLivesDisplay() {
    const livesEl = document.getElementById('lives-display');
    if (livesEl) livesEl.textContent = `LIVES: ${this.lives}`;
  }

  getInput() {
    return this.inputManager;
  }

  getAudio() {
    return this.audioManager;
  }
}

window.addEventListener('load', () => {
  const game = new GameEngine();
  window.game = game;
  game.start();
});

export default GameEngine;
