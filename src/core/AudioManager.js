// AudioManager - Procedural SFX + optional looping background .wav (HTMLAudioElement)
import { GAME_CONFIG } from '../config/gameConfig.js';

export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = false;
    this.sfxVolume = 0.3;
    this.musicVolume = 0.35;
    this.musicLoopTimer = null;
    /** @type {HTMLAudioElement|null} */
    this.musicElement = null;
    this.musicWavFailed = false;
    this.proceduralMusicActive = false;
    this.musicDesired = false;
    this.muted = localStorage.getItem('muperSario2Muted') === 'true';
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.7;
      this.enabled = true;
      this.applyMuteState();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.musicElement && this.musicElement.paused && !this.musicWavFailed) {
      this.musicElement.play().catch(() => {});
    }
  }

  playJump() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.sfxVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playCoin() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.7, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playStomp() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.12);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.9, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.12);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.12);
  }

  playPipeHit() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.4);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.8, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.4);
  }

  playGameOver() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 1.5);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 1.5);
  }

  playMenuSelect() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(784, this.audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playMenuConfirm() {
    if (!this.enabled || this.muted) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1046, this.audioContext.currentTime + 0.15);

    gainNode.gain.setValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  stopBackgroundMusic() {
    this.musicDesired = false;
    if (this.musicLoopTimer) {
      clearTimeout(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }
    this.proceduralMusicActive = false;
    if (this.musicElement) {
      this.musicElement.pause();
    }
  }

  /** Lazy-load .wav on first gameplay start — avoids fetch on page load (IDM / race) */
  playBackgroundMusic() {
    if (!this.enabled) return;
    this.musicDesired = true;
    if (this.muted) return;
    this.resume();
    this._startBackgroundMusic();
  }

  _startBackgroundMusic() {
    if (this.musicLoopTimer) {
      clearTimeout(this.musicLoopTimer);
      this.musicLoopTimer = null;
    }
    this.proceduralMusicActive = false;
    if (this.musicElement) {
      this.musicElement.pause();
    }

    if (this.musicWavFailed) {
      this._playProceduralLoop();
      return;
    }

    if (!this.musicElement) {
      this.musicElement = new Audio(GAME_CONFIG.MUSIC_PATH);
      this.musicElement.loop = true;
      this.musicElement.volume = this.musicVolume;
      this.musicElement.preload = 'auto';
      this.musicElement.addEventListener('error', () => {
        console.info(`Background music failed (${GAME_CONFIG.MUSIC_PATH}); procedural fallback.`);
        this.musicWavFailed = true;
        if (this.musicElement) this.musicElement.pause();
        this._playProceduralLoop();
      });
    }

    this.musicElement.currentTime = 0;
    this.musicElement.play().catch((e) => {
      console.info('Background music play blocked or failed; procedural fallback.', e.message);
      this.musicWavFailed = true;
      this._playProceduralLoop();
    });
  }

  _playProceduralLoop() {
    if (!this.enabled || this.proceduralMusicActive || this.muted || !this.musicDesired) return;
    this.proceduralMusicActive = true;

    const now = this.audioContext.currentTime;
    const loopDurationMs = 8000;

    const playNote = (freq, startTime, duration) => {
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(this.musicVolume * 0.3, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const chords = [
      [261.63, 329.63, 392.00],
      [220.00, 261.63, 329.63],
      [174.61, 220.00, 261.63],
      [196.00, 246.94, 293.66]
    ];

    let time = now;
    for (let i = 0; i < 16; i++) {
      const chord = chords[i % 4];
      chord.forEach(freq => playNote(freq, time, 0.5));
      time += 0.5;
    }

    this.musicLoopTimer = setTimeout(() => {
      this.proceduralMusicActive = false;
      if (this.musicWavFailed && !this.muted && this.musicDesired) this._playProceduralLoop();
    }, loopDurationMs);
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem('muperSario2Muted', String(muted));
    this.applyMuteState();
    return this.muted;
  }

  applyMuteState() {
    if (!this.masterGain) return;

    if (this.muted) {
      this.masterGain.gain.value = 0;
      if (this.musicLoopTimer) {
        clearTimeout(this.musicLoopTimer);
        this.musicLoopTimer = null;
      }
      this.proceduralMusicActive = false;
      if (this.musicElement && !this.musicElement.paused) {
        this.musicElement.pause();
      }
    } else {
      this.masterGain.gain.value = 0.7;
      if (this.musicDesired) {
        if (this.musicElement && !this.musicWavFailed) {
          this.musicElement.play().catch(() => {});
        } else if (this.musicWavFailed) {
          this._playProceduralLoop();
        } else {
          this._startBackgroundMusic();
        }
      }
    }

    this.updateMuteButton();
  }

  bindMuteButton(button) {
    this.muteButton = button;
    this.updateMuteButton();
    button.addEventListener('click', () => {
      this.toggleMute();
      this.updateMuteButton();
    });
  }

  updateMuteButton() {
    if (!this.muteButton) return;
    const muted = this.muted;
    this.muteButton.textContent = muted ? 'Unmute' : 'Mute';
    this.muteButton.setAttribute('aria-pressed', muted ? 'true' : 'false');
    this.muteButton.setAttribute('aria-label', muted ? 'Unmute game audio' : 'Mute game audio');
    this.muteButton.classList.toggle('is-muted', muted);
  }
}
