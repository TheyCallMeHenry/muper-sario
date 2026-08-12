// Game configuration — v2: only keys referenced by runtime modules
export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  GRAVITY: 0.6,
  /** Walk max speed (SMB soft cap ~24 subpx/frame analogue) */
  PLAYER_WALK_SPEED: 3.5,
  /** Run max speed with Left Shift held (SMB hard cap ~40 subpx/frame analogue) */
  PLAYER_RUN_SPEED: 5.75,
  PLAYER_WALK_ACCEL: 0.35,
  PLAYER_RUN_ACCEL: 0.55,
  /** SMB RunningTimer = 10 frames @ 60 Hz NTSC */
  PLAYER_RUNNING_TIMER: 10 / 60,
  /** SMB turnaround: double horizontal accel when facing opposite travel direction */
  PLAYER_TURNAROUND_ACCEL_MULT: 2,
  /** @deprecated use PLAYER_WALK_SPEED */
  PLAYER_SPEED: 3.5,
  /** −12.5 → ~130 px max rise (+10 px over prior −12) */
  PLAYER_JUMP_FORCE: -12.5,
  PLAYER_STOMP_BOUNCE: -8,
  PLAYER_TERMINAL_VELOCITY: 15,
  FRICTION: 0.82,
  /** Less horizontal decay in air (SMB keeps run momentum via RunningTimer) */
  AIR_FRICTION: 0.98,

  /**
   * SMB run+jump (NTSC → px/frame @ 60 Hz, scale ≈ walk/1.5625).
   * Source: SMBpedia + mitxela SMB1 port (Jdaster64 flowchart).
   */
  /** |vx| at takeoff > walk cap → run speed allowed for whole jump (fastjump) */
  PLAYER_AIR_RUN_JUMP_SPEED: 3.5,
  /** |vx| at takeoff > airspeedCutoff → faster air turnaround accel (fasterjump) */
  PLAYER_AIR_FAST_MOMENTUM_SPEED: 4.06,
  /** jumpCutoff1 / jumpCutoff2 — vertical gravity tier thresholds at takeoff */
  PLAYER_JUMP_TIER1_SPEED: 2.24,
  PLAYER_JUMP_TIER2_SPEED: 5.18,
  /** Initial vy by tier — same apex base; run tiers use gravity for flat arc */
  PLAYER_JUMP_FORCE_TIERS: [-12.5, -12.5, -12.5],
  /** Rising gravity while jump held (walk / medium / sprint) */
  PLAYER_JUMP_RISE_GRAVITY: [0.6, 0.55, 0.52],
  /** Falling gravity by tier — sprint jumps fall faster (SMB flat run arc) */
  PLAYER_JUMP_FALL_GRAVITY: [0.6, 0.65, 0.77],
  /** Air horizontal accel: at/above walk cap / forward below cap / reverse fast / reverse slow */
  PLAYER_AIR_FAST_ACCEL: 0.55,
  PLAYER_AIR_SLOW_ACCEL: 0.35,
  PLAYER_AIR_FAST_DRAG: 0.13,
  PLAYER_AIR_SLOW_DRAG: 0.35,

  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 48,

  PIPE_WIDTH: 60,
  PIPE_HEIGHT: 120,
  PIPE_CAP_EXTENSION: 8,
  PIPE_LANDING_TOLERANCE: 20,
  PIPE_CAP_HEIGHT: 10,

  STARTING_LIVES: 3,
  GROUND_HEIGHT: 100,

  /** Coyote time after leaving ground / pipe cap (seconds @ 60 Hz) */
  COYOTE_TIME: 0.15,
  /** Extra coyote when walking off pipe tops (narrower ledges) */
  COYOTE_TIME_PLATFORM: 0.22,
  JUMP_BUFFER_TIME: 0.1,

  SCORE_PER_COIN: 1,
  SCORE_PER_BUBA: 1,
  /** Level-complete time multiplier: clamp(parTime / elapsed, MIN, MAX) */
  TIME_SCORE_MIN_MULT: 0.5,
  TIME_SCORE_MAX_MULT: 2.0,

  /** Camera follows player; 0.35 = player sits left-of-center (SMB-style) */
  CAMERA_PLAYER_OFFSET: 0.35,

  BUBA_WIDTH: 32,
  BUBA_HEIGHT: 32,
  BUBA_SPEED: 1.4,
  BUBA_STOMP_TOLERANCE: 10,

  /** Background music — first .wav in assets/music/ or this path */
  MUSIC_PATH: 'assets/music/background.wav',

  STATES: {
    TITLE: 'title',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    HIGH_SCORES: 'high_scores'
  },

  COLORS: {
    SKY_TOP: '#87CEEB',
    SKY_BOTTOM: '#B0E0E6',
    GROUND_BROWN: '#8B4513',
    GROUND_DARK: '#654321',
    GROUND_GREEN: '#228B22',
    PIPE_GREEN: '#228B22',
    PIPE_DARK: '#006400',
    PLAYER_RED: '#E74C3C',
    PLAYER_BLUE: '#3498DB',
    PLAYER_SKIN: '#F1C40F',
    COIN_YELLOW: '#F1C40F',
    WHITE: '#FFFFFF',
    BLACK: '#000000'
  }
};
