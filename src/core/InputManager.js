// InputManager - Keyboard input (v2: preventDefault on game keys)
export class InputManager {
  constructor() {
    this.keys = {};
    this.keyPressQueue = [];
    this.lastMenuSelectTime = 0;
    this.menuSelectCooldown = 200;
    this.setupKeyboard();
  }

  setupKeyboard() {
    const gameKeys = new Set([
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter',
      'ShiftLeft', 'Backspace', 'Delete'
    ]);

    window.addEventListener('keydown', (e) => {
      if (gameKeys.has(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;

      const isArrow = e.code.startsWith('Arrow');
      const isLetterOrDigit = /^Key[A-Z]$/.test(e.code) || /^Digit[0-9]$/.test(e.code);
      const isEditKey = e.code === 'Backspace' || e.code === 'Delete';
      if (!e.repeat || isArrow) {
        if (isArrow || isLetterOrDigit || isEditKey) {
          this.keyPressQueue.push({ code: e.code, key: e.key });
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (gameKeys.has(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = false;
    });
  }

  update() {}

  /** One-shot key events for name entry (cleared after read) */
  drainKeyPresses() {
    const batch = this.keyPressQueue;
    this.keyPressQueue = [];
    return batch;
  }

  /** Release jump/confirm keys — call when opening name entry after gameplay */
  clearConfirmKeys() {
    this.keys['Space'] = false;
    this.keys['Enter'] = false;
    this.keys['ArrowUp'] = false;
    this.lastMenuSelectTime = Date.now();
  }

  isConfirmReleased() {
    return !this.keys['Space'] && !this.keys['Enter'];
  }

  isJumpPressed() {
    return this.keys['Space'] || this.keys['ArrowUp'];
  }

  isLeftPressed() {
    return this.keys['ArrowLeft'];
  }

  isRightPressed() {
    return this.keys['ArrowRight'];
  }

  /** SMB B-button equivalent — Left Shift only */
  isRunPressed() {
    return this.keys['ShiftLeft'];
  }

  isMenuSelect() {
    const now = Date.now();
    if ((this.keys['Space'] || this.keys['Enter']) && now - this.lastMenuSelectTime > this.menuSelectCooldown) {
      this.lastMenuSelectTime = now;
      return true;
    }
    return false;
  }
}
