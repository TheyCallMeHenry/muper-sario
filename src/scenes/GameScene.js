// GameScene - v2: side-scrolling level, camera follow, level completion
import { GAME_CONFIG } from '../config/gameConfig.js';
import { createRunLevel } from '../config/levelData.js';
import { Player } from '../entities/Player.js';
import { Pipe } from '../entities/Pipe.js';
import { Block } from '../entities/Block.js';
import { Buba } from '../entities/Buba.js';
import { Ground } from '../entities/Ground.js';
import { Background } from '../entities/Background.js';
import { Coin } from '../entities/Coin.js';
import { Storage } from '../utils/Storage.js';
import { UiText } from '../utils/UiText.js';
import { MathUtils } from '../utils/MathUtils.js';
import { getRunSeedFromUrl } from '../utils/LevelGenerator.js';

const SPAWN_X = 100;

export class GameScene {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.game = sceneManager.getGame();
    this.player = null;
    this.pipes = [];
    this.blocks = [];
    this.coins = [];
    this.bubas = [];
    this.ground = null;
    this.background = null;

    this.levelLayout = null;
    this.levelWidth = 0;
    this.finishX = 0;
    this.parTimeSeconds = 90;
    this.cameraX = 0;

    this.isAlive = true;
    this.levelComplete = false;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.invincibleDuration = 1.5;
    this.gameOverNameEntryActive = false;

    this.enteringName = false;
    this.playerName = 'AAA';
    this.nameEntryIndex = 0;
    this.nameMaxLength = 3;
    this.nameEntryConfirmReady = false;

    this.levelElapsed = 0;
    this.wasOnGround = false;
    this.baseScore = 0;
    this.timeMultiplier = 1;
    this.finalScore = 0;
  }

  enter() {
    const runSeed = getRunSeedFromUrl();
    this.levelLayout = createRunLevel(runSeed);
    if (runSeed != null) {
      console.info('[Muper Sario] run seed:', this.levelLayout.seed, '→', this.levelLayout.chunkSequence.join(' → '));
    }
    this.levelWidth = this.levelLayout.width;
    this.finishX = this.levelLayout.finishX;
    this.parTimeSeconds = this.levelLayout.parTimeSeconds;

    const startY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT;
    this.player = new Player(SPAWN_X, startY);
    this.player.setGame(this.game);

    this.pipes = this.levelLayout.pipes.map(x => {
      const pipe = new Pipe(x, GAME_CONFIG.PIPE_HEIGHT);
      pipe.passed = false;
      return pipe;
    });

    this.coins = this.levelLayout.coins.map(c => new Coin(c.x, c.y));
    this.blocks = (this.levelLayout.blocks || []).map(b => new Block(b.x, b.y));
    this.bubas = this.levelLayout.bubas.map(([x, min, max, dir]) => new Buba(x, min, max, dir));
    this.ground = new Ground(this.levelLayout.ground);
    this.background = new Background(this.levelWidth);

    this.cameraX = 0;
    this.isAlive = true;
    this.levelComplete = false;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.gameOverNameEntryActive = false;
    this.enteringName = false;
    this.playerName = 'AAA';
    this.nameEntryIndex = 0;
    this.nameEntryConfirmReady = false;
    this.levelElapsed = 0;
    this.wasOnGround = false;
    this.baseScore = 0;
    this.timeMultiplier = 1;
    this.finalScore = 0;

    this.game.resetLives();
    this.game.resetScore();
    this.game.syncHighScoreDisplay();
    this.game.updateLivesDisplay();
    this.game.getAudio().playBackgroundMusic();
  }

  exit() {
    this.game.getAudio().stopBackgroundMusic();
  }

  updateCamera() {
    const offset = GAME_CONFIG.CANVAS_WIDTH * GAME_CONFIG.CAMERA_PLAYER_OFFSET;
    const target = this.player.x - offset;
    const maxCam = Math.max(0, this.levelWidth - GAME_CONFIG.CANVAS_WIDTH);
    this.cameraX = Math.max(0, Math.min(maxCam, target));
  }

  loseLife() {
    const remaining = this.game.loseLife();
    this.invincible = true;
    this.invincibleTimer = this.invincibleDuration;
    this.game.getAudio().playPipeHit();

    if (remaining <= 0) {
      this.endGame(false);
    } else {
      const startY = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT - GAME_CONFIG.PLAYER_HEIGHT;
      this.player.reset(SPAWN_X, startY);
      this.cameraX = 0;
    }
  }

  completeLevel() {
    if (this.levelComplete) return;
    this.baseScore = this.game.score;
    this.timeMultiplier = MathUtils.computeTimeScoreMultiplier(
      this.levelElapsed,
      this.parTimeSeconds,
      GAME_CONFIG.TIME_SCORE_MIN_MULT,
      GAME_CONFIG.TIME_SCORE_MAX_MULT
    );
    this.finalScore = Math.round(this.baseScore * this.timeMultiplier);
    this.game.setScore(this.finalScore);
    this.levelComplete = true;
    this.endGame(true);
  }

  endGame(won) {
    this.isAlive = false;
    this.invincible = false;
    this.gameOverNameEntryActive = true;
    this.levelComplete = won;
    if (won) {
      this.game.getAudio().playMenuConfirm();
    } else {
      this.game.getAudio().playGameOver();
    }
    this.enteringName = true;
    this.playerName = 'AAA';
    this.nameEntryIndex = 0;
    this.nameEntryConfirmReady = false;
    this.game.getInput().clearConfirmKeys();
  }

  update(deltaTime) {
    if (!this.isAlive) {
      if (this.enteringName) {
        this.handleNameEntry();
        return;
      }
      if (this.game.getInput().isJumpPressed()) {
        this.game.changeScene('title');
      }
      return;
    }

    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) this.invincible = false;
    }

    this.levelElapsed += deltaTime;

    this.player.updatePhysics(deltaTime, this.game.getInput(), this.levelWidth);
    this.player.onGround = false;

    for (const buba of this.bubas) {
      buba.update(deltaTime, this.pipes, this.blocks, this.ground, this.levelWidth);
    }

    if (!this.invincible) {
      for (const platform of [...this.pipes, ...this.blocks]) {
        const collision = platform.checkCollisionDetailed(this.player);
        if (collision) {
          if (collision.type === 'top') {
            const platformTop = platform.getBounds().y;
            this.player.y = platformTop - this.player.height + 1;
            this.player.vy = 0;
            this.player.onGround = true;
            this.player.isJumping = false;
            this.player.setGroundContact('platform');
          } else if (collision.type === 'side') {
            const platformBounds = platform.getBounds();
            if (collision.pushX < 0) {
              this.player.x = platformBounds.x - this.player.width;
            } else {
              this.player.x = platformBounds.x + platformBounds.width;
            }
            this.player.vx = 0;
          }
        }
      }
    }

    if (!this.invincible) {
      const frameDescending = this.player.vy >= 0;
      let stompedThisFrame = false;

      for (const buba of this.bubas) {
        const hit = buba.checkPlayerCollision(this.player, { descending: frameDescending });
        if (hit === 'stomp') {
          buba.stomp();
          this.game.addScore(GAME_CONFIG.SCORE_PER_BUBA);
          this.player.vy = GAME_CONFIG.PLAYER_STOMP_BOUNCE;
          this.player.onGround = false;
          if (!stompedThisFrame) {
            this.game.getAudio().playStomp();
          }
          stompedThisFrame = true;
        }
      }

      if (!stompedThisFrame) {
        for (const buba of this.bubas) {
          if (buba.checkPlayerCollision(this.player) === 'hurt') {
            this.loseLife();
            return;
          }
        }
      }
    }

    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update(deltaTime);
      if (!coin.collected && this.intersects(this.player.getBounds(), coin.getBounds())) {
        coin.collect();
        this.game.addScore(GAME_CONFIG.SCORE_PER_COIN);
        this.game.getAudio().playCoin();
        this.coins.splice(i, 1);
      }
    }

    if (this.player.y + this.player.height > GAME_CONFIG.CANVAS_HEIGHT) {
      this.loseLife();
      return;
    }

    const footCenterX = this.player.x + this.player.width / 2;
    const footLeft = this.player.x + 4;
    const footRight = this.player.x + this.player.width - 4;
    const onGroundSegment =
      this.ground.hasSolidGroundAt(footLeft) ||
      this.ground.hasSolidGroundAt(footCenterX) ||
      this.ground.hasSolidGroundAt(footRight);

    if (onGroundSegment) {
      const groundY = this.ground.getY();
      if (this.player.y + this.player.height > groundY) {
        this.player.y = groundY - this.player.height;
        this.player.vy = 0;
        this.player.onGround = true;
        this.player.isJumping = false;
        this.player.setGroundContact('ground');
      }
    }

    if (this.wasOnGround && !this.player.onGround) {
      this.player.grantCoyoteTime();
    }
    this.wasOnGround = this.player.onGround;

    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.vy = 0;
    }

    this.player.updateAnimation(deltaTime);
    this.updateCamera();

    if (this.player.x + this.player.width >= this.finishX) {
      this.completeLevel();
    }
  }

  handleNameEntry() {
    const input = this.game.getInput();

    if (!this.nameEntryConfirmReady) {
      if (input.isConfirmReleased()) {
        this.nameEntryConfirmReady = true;
      }
      return;
    }

    for (const { code, key } of input.drainKeyPresses()) {
      if (code === 'ArrowLeft') {
        this.nameEntryIndex = Math.max(0, this.nameEntryIndex - 1);
        this.game.getAudio().playMenuSelect();
      } else if (code === 'ArrowRight') {
        this.nameEntryIndex = Math.min(this.nameMaxLength - 1, this.nameEntryIndex + 1);
        this.game.getAudio().playMenuSelect();
      } else if (code === 'ArrowUp') {
        this.cycleLetter(1);
        this.game.getAudio().playMenuSelect();
      } else if (code === 'ArrowDown') {
        this.cycleLetter(-1);
        this.game.getAudio().playMenuSelect();
      } else if (code === 'Backspace') {
        if (this.nameEntryIndex > 0) {
          this.nameEntryIndex--;
        }
        this.setLetterAtCursor('A');
        this.game.getAudio().playMenuSelect();
      } else if (code === 'Delete') {
        this.setLetterAtCursor('A');
        this.game.getAudio().playMenuSelect();
      } else {
        const typed = this.charFromKey(code, key);
        if (typed) {
          this.setLetterAtCursor(typed);
          if (this.nameEntryIndex < this.nameMaxLength - 1) {
            this.nameEntryIndex++;
          }
          this.game.getAudio().playMenuSelect();
        }
      }
    }

    if (input.isMenuSelect()) {
      this.playerName = this.playerName.padEnd(this.nameMaxLength, 'A');
      Storage.saveScore(this.game.score, this.playerName);
      this.game.syncHighScoreDisplay();
      this.enteringName = false;
      this.game.getAudio().playMenuConfirm();
      this.game.changeScene('high_scores');
    }
  }

  charFromKey(code, key) {
    const allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    if (/^Key[A-Z]$/.test(code)) {
      return code.slice(3);
    }
    if (/^Digit[0-9]$/.test(code)) {
      return code.slice(5);
    }
    if (key && key.length === 1) {
      const upper = key.toUpperCase();
      if (allowed.includes(upper)) return upper;
    }
    return null;
  }

  setLetterAtCursor(letter) {
    const padded = this.playerName.padEnd(this.nameMaxLength, 'A');
    this.playerName =
      padded.substring(0, this.nameEntryIndex) +
      letter +
      padded.substring(this.nameEntryIndex + 1);
  }

  cycleLetter(direction) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const current = this.playerName[this.nameEntryIndex] || 'A';
    let idx = chars.indexOf(current);
    idx = (idx + direction + chars.length) % chars.length;
    this.playerName =
      this.playerName.substring(0, this.nameEntryIndex) +
      chars[idx] +
      this.playerName.substring(this.nameEntryIndex + 1);
  }

  intersects(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
  }

  renderFinishFlag(ctx) {
    const x = this.finishX;
    const groundY = this.ground.getY();
    const poleH = 100;
    const poleTop = groundY - poleH;

    ctx.fillStyle = '#228B22';
    ctx.fillRect(x, poleTop, 6, poleH);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x + 6, poleTop + 8);
    ctx.lineTo(x + 46, poleTop + 28);
    ctx.lineTo(x + 6, poleTop + 48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 4, groundY - 4, 14, 8);
  }

  render(ctx) {
    this.background.render(ctx, this.cameraX);
    this.ground.render(ctx, this.cameraX);

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    this.renderFinishFlag(ctx);
    for (const pipe of this.pipes) pipe.render(ctx);
    for (const block of this.blocks) block.render(ctx);
    for (const buba of this.bubas) buba.render(ctx);
    for (const coin of this.coins) coin.render(ctx);

    if (!this.gameOverNameEntryActive) {
      if (this.invincible) {
        const flash = Math.abs(Math.sin(this.invincibleTimer * 20)) * 0.5 + 0.5;
        ctx.globalAlpha = flash;
        this.player.render(ctx);
        ctx.globalAlpha = 1;
      } else {
        this.player.render(ctx);
      }
    }

    ctx.restore();

    if (!this.isAlive) {
      ctx.fillStyle = this.enteringName ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

      if (this.levelComplete) {
        UiText.drawText(ctx, 'LEVEL COMPLETE!', GAME_CONFIG.CANVAS_WIDTH / 2, 150, {
          fill: '#FFD700',
          stroke: '#3d2e00',
          font: 'bold 42px "Courier New", monospace',
          lineWidth: 4
        });
        UiText.drawText(ctx, `TIME: ${MathUtils.formatTime(this.levelElapsed)}`, GAME_CONFIG.CANVAS_WIDTH / 2, 210, {
          font: 'bold 22px "Courier New", monospace',
          lineWidth: 3
        });
        UiText.drawText(ctx, `BASE: ${this.baseScore}  ×  ${this.timeMultiplier.toFixed(2)}`, GAME_CONFIG.CANVAS_WIDTH / 2, 250, {
          font: '20px "Courier New", monospace',
          fill: '#E8EEF5',
          lineWidth: 2
        });
        UiText.drawText(ctx, `FINAL SCORE: ${this.finalScore}`, GAME_CONFIG.CANVAS_WIDTH / 2, 290, {
          fill: '#FFD700',
          font: 'bold 26px "Courier New", monospace',
          lineWidth: 3
        });
      } else {
        UiText.drawText(ctx, 'GAME OVER', GAME_CONFIG.CANVAS_WIDTH / 2, 200, {
          font: 'bold 42px "Courier New", monospace',
          lineWidth: 4
        });
      }

      if (!this.levelComplete) {
        UiText.drawText(ctx, `SCORE: ${this.game.score}`, GAME_CONFIG.CANVAS_WIDTH / 2, 280, {
          font: 'bold 24px "Courier New", monospace',
          lineWidth: 3
        });
      }
      UiText.drawText(ctx, `HIGH SCORE: ${this.game.highScore}`, GAME_CONFIG.CANVAS_WIDTH / 2, this.levelComplete ? 330 : 320, {
        font: 'bold 24px "Courier New", monospace',
        lineWidth: 3
      });

      if (this.enteringName) {
        UiText.drawText(ctx, 'ENTER YOUR INITIALS:', GAME_CONFIG.CANVAS_WIDTH / 2, this.levelComplete ? 410 : 380, {
          font: 'bold 24px "Courier New", monospace',
          lineWidth: 3
        });
        const boxW = 200, boxX = (GAME_CONFIG.CANVAS_WIDTH - boxW) / 2, boxY = this.levelComplete ? 440 : 410, boxH = 40;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);
        const displayName = this.playerName.padEnd(this.nameMaxLength, 'A');
        const letterSpacing = 36;
        const nameStartX = GAME_CONFIG.CANVAS_WIDTH / 2 - letterSpacing;
        for (let i = 0; i < this.nameMaxLength; i++) {
          const cx = nameStartX + i * letterSpacing;
          if (i === this.nameEntryIndex) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cx - 14, boxY + 4, 28, boxH - 8);
          }
          UiText.drawText(ctx, displayName[i], cx, boxY + boxH / 2 + 10, {
            fill: i === this.nameEntryIndex ? '#000000' : '#FFD700',
            stroke: i === this.nameEntryIndex ? '#000000' : '#3d2e00',
            font: 'bold 28px "Courier New", monospace',
            lineWidth: i === this.nameEntryIndex ? 0 : 3
          });
        }
        if (!this.nameEntryConfirmReady) {
          UiText.drawText(ctx, 'Release SPACE to begin entering initials…', GAME_CONFIG.CANVAS_WIDTH / 2, this.levelComplete ? 500 : 470, {
            font: '16px "Courier New", monospace',
            fill: '#E8EEF5',
            lineWidth: 2
          });
        } else {
          UiText.drawText(ctx, 'Type A–Z / 0–9   ← → move   ↑ ↓ cycle   BKSP/DEL clear', GAME_CONFIG.CANVAS_WIDTH / 2, this.levelComplete ? 500 : 470, {
            font: '16px "Courier New", monospace',
            fill: '#E8EEF5',
            lineWidth: 2
          });
          UiText.drawText(ctx, 'SPACE or ENTER to save', GAME_CONFIG.CANVAS_WIDTH / 2, this.levelComplete ? 530 : 500, {
            font: '16px "Courier New", monospace',
            fill: '#E8EEF5',
            lineWidth: 2
          });
        }
      } else {
        UiText.drawText(ctx, 'Press SPACE to return to menu', GAME_CONFIG.CANVAS_WIDTH / 2, 400, {
          font: 'bold 20px "Courier New", monospace',
          lineWidth: 3
        });
      }
    }
  }
}
