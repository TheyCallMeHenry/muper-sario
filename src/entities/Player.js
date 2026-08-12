// Player - Muper Sario with Mario-like physics (v2)
import { GAME_CONFIG } from '../config/gameConfig.js';
import { ProceduralGen } from '../utils/ProceduralGen.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = GAME_CONFIG.PLAYER_WIDTH;
    this.height = GAME_CONFIG.PLAYER_HEIGHT;

    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;

    this.isJumping = false;
    this.jumpPressed = false;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    /** 'ground' | 'platform' — last surface type for extended pipe-cap coyote */
    this.lastGroundKind = 'ground';

    this.runningTimer = 0;
    this.isRunning = false;

    /** SMB fastjump — run speed cap preserved for entire jump */
    this.airRunJump = false;
    /** SMB fasterjump — high-speed air turnaround accel */
    this.airFastMomentum = false;
    /** 0 = walk, 1 = medium, 2 = sprint (vertical gravity tier) */
    this.jumpSpeedTier = 0;

    this.animationFrame = 0;
    this.animationSpeed = 0;
    this.isMoving = false;
    this.lastAnimationFrame = -1;

    this.spriteCanvas = document.createElement('canvas');
    this.spriteCanvas.width = this.width;
    this.spriteCanvas.height = this.height;
    this.updateSprite();
  }

  _clearAirJumpState() {
    this.airRunJump = false;
    this.airFastMomentum = false;
    this.jumpSpeedTier = 0;
  }

  setGroundContact(kind) {
    this.lastGroundKind = kind;
  }

  grantCoyoteTime() {
    const duration = this.lastGroundKind === 'platform'
      ? GAME_CONFIG.COYOTE_TIME_PLATFORM
      : GAME_CONFIG.COYOTE_TIME;
    this.coyoteTime = Math.max(this.coyoteTime, duration);
  }

  _refreshCoyoteWhileGrounded() {
    const duration = this.lastGroundKind === 'platform'
      ? GAME_CONFIG.COYOTE_TIME_PLATFORM
      : GAME_CONFIG.COYOTE_TIME;
    this.coyoteTime = duration;
  }

  _captureJumpTakeoff() {
    const absVx = Math.abs(this.vx);
    this.airRunJump = absVx > GAME_CONFIG.PLAYER_AIR_RUN_JUMP_SPEED;
    this.airFastMomentum = absVx > GAME_CONFIG.PLAYER_AIR_FAST_MOMENTUM_SPEED;

    if (absVx >= GAME_CONFIG.PLAYER_JUMP_TIER2_SPEED) {
      this.jumpSpeedTier = 2;
    } else if (absVx >= GAME_CONFIG.PLAYER_JUMP_TIER1_SPEED) {
      this.jumpSpeedTier = 1;
    } else {
      this.jumpSpeedTier = 0;
    }

    this.vy = GAME_CONFIG.PLAYER_JUMP_FORCE_TIERS[this.jumpSpeedTier];
  }

  _applyGroundHorizontal(input) {
    const leftPressed = input.isLeftPressed();
    const rightPressed = input.isRightPressed();
    const maxSpeed = this.isRunning
      ? GAME_CONFIG.PLAYER_RUN_SPEED
      : GAME_CONFIG.PLAYER_WALK_SPEED;

    this.isMoving = false;
    if (leftPressed) {
      let accel = this.isRunning
        ? GAME_CONFIG.PLAYER_RUN_ACCEL
        : GAME_CONFIG.PLAYER_WALK_ACCEL;
      if (this.vx > 0.5) {
        accel *= GAME_CONFIG.PLAYER_TURNAROUND_ACCEL_MULT;
      }
      this.vx -= accel;
      if (this.vx < -maxSpeed) this.vx = -maxSpeed;
      this.facing = -1;
      this.isMoving = true;
    } else if (rightPressed) {
      let accel = this.isRunning
        ? GAME_CONFIG.PLAYER_RUN_ACCEL
        : GAME_CONFIG.PLAYER_WALK_ACCEL;
      if (this.vx < -0.5) {
        accel *= GAME_CONFIG.PLAYER_TURNAROUND_ACCEL_MULT;
      }
      this.vx += accel;
      if (this.vx > maxSpeed) this.vx = maxSpeed;
      this.facing = 1;
      this.isMoving = true;
    } else {
      this.vx *= GAME_CONFIG.FRICTION;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }
  }

  _applyAirHorizontal(input) {
    const leftPressed = input.isLeftPressed();
    const rightPressed = input.isRightPressed();
    const walkCap = GAME_CONFIG.PLAYER_WALK_SPEED;
    const runCap = GAME_CONFIG.PLAYER_RUN_SPEED;
    const maxSpeed = this.airRunJump ? runCap : walkCap;

    this.isMoving = false;
    if (leftPressed) {
      this._applyAirDirectionalAccel(-1, walkCap);
      this.facing = -1;
      this.isMoving = true;
    } else if (rightPressed) {
      this._applyAirDirectionalAccel(1, walkCap);
      this.facing = 1;
      this.isMoving = true;
    } else {
      this.vx *= GAME_CONFIG.AIR_FRICTION;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    if (this.vx > maxSpeed) this.vx = maxSpeed;
    if (this.vx < -maxSpeed) this.vx = -maxSpeed;
  }

  _applyAirDirectionalAccel(direction, walkCap) {
    const absVx = Math.abs(this.vx);
    const movingForward = (direction < 0 && this.vx < 0) || (direction > 0 && this.vx > 0);
    let accel;

    if (absVx >= walkCap) {
      accel = GAME_CONFIG.PLAYER_AIR_FAST_ACCEL;
    } else if (movingForward) {
      accel = GAME_CONFIG.PLAYER_AIR_SLOW_ACCEL;
    } else if (this.airFastMomentum) {
      accel = GAME_CONFIG.PLAYER_AIR_FAST_DRAG;
    } else {
      accel = GAME_CONFIG.PLAYER_AIR_SLOW_DRAG;
    }

    this.vx += direction * accel;
  }

  _applyVerticalGravity(jumpPressed) {
    const tier = this.jumpSpeedTier;
    const rising = this.vy < 0;
    const holdingJump = jumpPressed && this.isJumping;

    if (rising && holdingJump) {
      this.vy += GAME_CONFIG.PLAYER_JUMP_RISE_GRAVITY[tier];
    } else {
      this.vy += GAME_CONFIG.PLAYER_JUMP_FALL_GRAVITY[tier];
    }
  }

  updatePhysics(deltaTime, input, worldWidth = GAME_CONFIG.CANVAS_WIDTH) {
    const leftPressed = input.isLeftPressed();
    const rightPressed = input.isRightPressed();
    const jumpPressed = input.isJumpPressed();
    const runPressed = input.isRunPressed();

    if (this.onGround) {
      this._clearAirJumpState();
    }

    const movingDir = leftPressed ? -1 : rightPressed ? 1 : 0;
    const runOnGround = this.onGround && runPressed && movingDir !== 0 &&
      ((movingDir < 0 && this.vx <= 0) || (movingDir > 0 && this.vx >= 0) || Math.abs(this.vx) < 0.5);

    if (runOnGround) {
      this.runningTimer = GAME_CONFIG.PLAYER_RUNNING_TIMER;
    } else {
      this.runningTimer = Math.max(0, this.runningTimer - deltaTime);
    }

    this.isRunning = this.runningTimer > 0;

    if (this.onGround) {
      this._applyGroundHorizontal(input);
    } else {
      this._applyAirHorizontal(input);
    }

    if (jumpPressed && !this.jumpPressed) {
      this.jumpBuffer = GAME_CONFIG.JUMP_BUFFER_TIME;
    }
    this.jumpPressed = jumpPressed;

    if (this.onGround) {
      this._refreshCoyoteWhileGrounded();
    } else {
      this.coyoteTime -= deltaTime;
    }

    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= deltaTime;
    }

    if (this.coyoteTime > 0 && this.jumpBuffer > 0) {
      this._captureJumpTakeoff();
      this.onGround = false;
      this.coyoteTime = 0;
      this.jumpBuffer = 0;
      this.isJumping = true;
      this.game?.getAudio()?.playJump();
    }

    if (!this.onGround) {
      if (!jumpPressed && this.vy < 0 && this.isJumping) {
        this.isJumping = false;
      }
      this._applyVerticalGravity(jumpPressed);
    } else {
      this.vy += GAME_CONFIG.GRAVITY;
    }

    this.vy = MathUtils.clamp(this.vy, -GAME_CONFIG.PLAYER_TERMINAL_VELOCITY, GAME_CONFIG.PLAYER_TERMINAL_VELOCITY);

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = 0;
    if (this.x > worldWidth - this.width) {
      this.x = worldWidth - this.width;
    }
  }

  /** Call after collision resolution (DESIGN.md update order) */
  updateAnimation(deltaTime) {
    const airborne = !this.onGround;
    if (this.isMoving && (this.onGround || this.airRunJump)) {
      const animRate = (this.isRunning || this.airRunJump) ? 12 : 8;
      this.animationSpeed += deltaTime * animRate;
      this.animationFrame = Math.floor(this.animationSpeed) % 4;
    } else if (airborne) {
      this.animationFrame = 0;
    } else {
      this.animationFrame = 0;
      this.animationSpeed = 0;
    }

    const runAnim = this.isRunning || this.airRunJump;
    if (this.animationFrame !== this.lastAnimationFrame || runAnim !== this._lastRunning) {
      this.lastAnimationFrame = this.animationFrame;
      this._lastRunning = runAnim;
      this.updateSprite();
    }
  }

  updateSprite() {
    ProceduralGen.generatePlayer(
      this.spriteCanvas,
      this.width,
      this.height,
      this.animationFrame,
      this.isRunning || this.airRunJump
    );
  }

  render(ctx) {
    if (this.facing === -1) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.spriteCanvas, -this.x - this.width, this.y);
      ctx.restore();
    } else {
      ctx.drawImage(this.spriteCanvas, this.x, this.y);
    }
  }

  setGame(game) {
    this.game = game;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.isJumping = false;
    this.jumpPressed = false;
    this.coyoteTime = 0;
    this.jumpBuffer = 0;
    this.lastGroundKind = 'ground';
    this.runningTimer = 0;
    this.isRunning = false;
    this._clearAirJumpState();
    this.animationFrame = 0;
    this.animationSpeed = 0;
    this.lastAnimationFrame = -1;
    this.updateSprite();
  }
}
