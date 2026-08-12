// Interlocking level chunks — local coords, fixed width, socket-matched edges
// Ref: SMB 1-1 segment structure (assets/examples/) · PCG chunk-stitching (Spelunky / scene stitching)
import { GAME_CONFIG } from './gameConfig.js';

export const CHUNK_WIDTH = 400;

const GROUND_Y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
const BLOCK = GAME_CONFIG.BLOCK_SIZE;
const COIN_W = GAME_CONFIG.COIN_HEIGHT;
const COIN_Y_GROUND = GROUND_Y - GAME_CONFIG.COIN_FLOAT_ABOVE - COIN_W;
const PLATFORM_Y = GROUND_Y - BLOCK * 3;
const COIN_Y_PLATFORM = PLATFORM_Y - GAME_CONFIG.COIN_FLOAT_ABOVE - COIN_W;

/** @typedef {'solid' | 'open'} ChunkSocket */

/**
 * @typedef {Object} LevelChunk
 * @property {string} id
 * @property {ChunkSocket} left
 * @property {ChunkSocket} right
 * @property {number} weight
 * @property {number} [minRunIndex] earliest slot in run (0 = start chunk)
 * @property {number} [maxRunIndex] latest slot (exclusive of finish)
 * @property {'easy' | 'medium' | 'hard'} difficulty
 * @property {Array<{ start: number, end: number }>} ground
 * @property {number[]} [pipes]
 * @property {Array<{ x: number, y: number }>} [blocks]
 * @property {Array<{ x: number, y: number }>} [coins]
 * @property {Array<[number, number, number, number]>} [bubas]
 */

/** Full-width solid ground helper */
function solidGround() {
  return [{ start: 0, end: CHUNK_WIDTH }];
}

/** @type {LevelChunk[]} */
export const LEVEL_CHUNKS = [
  {
    id: 'start',
    left: 'solid',
    right: 'solid',
    weight: 0,
    difficulty: 'easy',
    ground: solidGround(),
    coins: [{ x: 200, y: COIN_Y_GROUND }]
  },
  {
    id: 'flat_empty',
    left: 'solid',
    right: 'solid',
    weight: 8,
    difficulty: 'easy',
    ground: solidGround()
  },
  {
    id: 'flat_coins_3',
    left: 'solid',
    right: 'solid',
    weight: 10,
    difficulty: 'easy',
    ground: solidGround(),
    coins: [
      { x: 120, y: COIN_Y_GROUND },
      { x: 200, y: COIN_Y_GROUND },
      { x: 280, y: COIN_Y_GROUND }
    ]
  },
  {
    id: 'flat_coins_5',
    left: 'solid',
    right: 'solid',
    weight: 7,
    difficulty: 'easy',
    ground: solidGround(),
    coins: [80, 140, 200, 260, 320].map(x => ({ x, y: COIN_Y_GROUND }))
  },
  {
    id: 'pipe_single_center',
    left: 'solid',
    right: 'solid',
    weight: 9,
    difficulty: 'easy',
    ground: solidGround(),
    pipes: [200],
    coins: [{ x: 80, y: COIN_Y_GROUND }, { x: 320, y: COIN_Y_GROUND }]
  },
  {
    id: 'pipe_single_offset',
    left: 'solid',
    right: 'solid',
    weight: 8,
    difficulty: 'easy',
    ground: solidGround(),
    pipes: [120],
    coins: [{ x: 280, y: COIN_Y_GROUND }]
  },
  {
    id: 'pipe_pair',
    left: 'solid',
    right: 'solid',
    weight: 7,
    difficulty: 'medium',
    minRunIndex: 2,
    ground: solidGround(),
    pipes: [100, 300],
    coins: [{ x: 200, y: COIN_Y_PLATFORM }],
    blocks: [{ x: 200 - BLOCK / 2, y: PLATFORM_Y }]
  },
  {
    id: 'platform_single',
    left: 'solid',
    right: 'solid',
    weight: 9,
    difficulty: 'easy',
    ground: solidGround(),
    blocks: [{ x: 184, y: PLATFORM_Y }],
    coins: [{ x: 200, y: COIN_Y_PLATFORM }]
  },
  {
    id: 'platform_double',
    left: 'solid',
    right: 'solid',
    weight: 7,
    difficulty: 'medium',
    minRunIndex: 2,
    ground: solidGround(),
    blocks: [
      { x: 104, y: PLATFORM_Y },
      { x: 264, y: PLATFORM_Y }
    ],
    coins: [
      { x: 120, y: COIN_Y_PLATFORM },
      { x: 280, y: COIN_Y_PLATFORM }
    ]
  },
  {
    id: 'platform_pipe_combo',
    left: 'solid',
    right: 'solid',
    weight: 6,
    difficulty: 'medium',
    minRunIndex: 3,
    ground: solidGround(),
    pipes: [300],
    blocks: [{ x: 84, y: PLATFORM_Y }],
    coins: [
      { x: 100, y: COIN_Y_PLATFORM },
      { x: 200, y: COIN_Y_GROUND }
    ]
  },
  {
    id: 'pit_small',
    left: 'solid',
    right: 'solid',
    weight: 6,
    difficulty: 'medium',
    minRunIndex: 2,
    ground: [{ start: 0, end: 140 }, { start: 260, end: CHUNK_WIDTH }],
    coins: [{ x: 60, y: COIN_Y_GROUND }, { x: 340, y: COIN_Y_GROUND }]
  },
  {
    id: 'pit_medium',
    left: 'solid',
    right: 'solid',
    weight: 5,
    difficulty: 'medium',
    minRunIndex: 4,
    ground: [{ start: 0, end: 120 }, { start: 280, end: CHUNK_WIDTH }],
    bubas: [[60, 20, 110, 1]]
  },
  {
    id: 'pit_platform_bridge',
    left: 'solid',
    right: 'solid',
    weight: 5,
    difficulty: 'hard',
    minRunIndex: 5,
    ground: [{ start: 0, end: 100 }, { start: 300, end: CHUNK_WIDTH }],
    blocks: [{ x: 184, y: PLATFORM_Y }],
    coins: [
      { x: 200, y: COIN_Y_PLATFORM },
      { x: 350, y: COIN_Y_GROUND }
    ]
  },
  {
    id: 'pit_wide',
    left: 'solid',
    right: 'solid',
    weight: 4,
    difficulty: 'hard',
    minRunIndex: 6,
    ground: [{ start: 0, end: 90 }, { start: 310, end: CHUNK_WIDTH }],
    coins: [{ x: 40, y: COIN_Y_GROUND }]
  },
  {
    id: 'gap_start',
    left: 'solid',
    right: 'open',
    weight: 4,
    difficulty: 'medium',
    minRunIndex: 3,
    ground: [{ start: 0, end: 320 }],
    coins: [{ x: 260, y: COIN_Y_GROUND }]
  },
  {
    id: 'gap_span',
    left: 'open',
    right: 'open',
    weight: 3,
    difficulty: 'medium',
    minRunIndex: 3,
    ground: []
  },
  {
    id: 'gap_end',
    left: 'open',
    right: 'solid',
    weight: 4,
    difficulty: 'medium',
    minRunIndex: 3,
    ground: [{ start: 80, end: CHUNK_WIDTH }],
    coins: [{ x: 140, y: COIN_Y_GROUND }, { x: 300, y: COIN_Y_GROUND }]
  },
  {
    id: 'buba_patrol',
    left: 'solid',
    right: 'solid',
    weight: 7,
    difficulty: 'easy',
    minRunIndex: 1,
    ground: solidGround(),
    bubas: [[200, 80, 320, -1]],
    coins: [{ x: 140, y: COIN_Y_GROUND }]
  },
  {
    id: 'buba_pipe',
    left: 'solid',
    right: 'solid',
    weight: 5,
    difficulty: 'medium',
    minRunIndex: 3,
    ground: solidGround(),
    pipes: [280],
    bubas: [[120, 40, 240, 1]]
  },
  {
    id: 'buba_double',
    left: 'solid',
    right: 'solid',
    weight: 4,
    difficulty: 'hard',
    minRunIndex: 5,
    ground: solidGround(),
    bubas: [
      [100, 40, 180, 1],
      [280, 220, 360, -1]
    ]
  },
  {
    id: 'block_stair',
    left: 'solid',
    right: 'solid',
    weight: 5,
    difficulty: 'medium',
    minRunIndex: 2,
    ground: solidGround(),
    blocks: [
      { x: 136, y: PLATFORM_Y },
      { x: 168, y: PLATFORM_Y - BLOCK }
    ],
    coins: [{ x: 200, y: COIN_Y_PLATFORM - 20 }]
  },
  {
    id: 'coin_arc',
    left: 'solid',
    right: 'solid',
    weight: 6,
    difficulty: 'easy',
    ground: solidGround(),
    coins: [
      { x: 80, y: COIN_Y_GROUND },
      { x: 140, y: COIN_Y_PLATFORM },
      { x: 200, y: COIN_Y_PLATFORM - 24 },
      { x: 260, y: COIN_Y_PLATFORM },
      { x: 320, y: COIN_Y_GROUND }
    ],
    blocks: [{ x: 120, y: PLATFORM_Y }, { x: 248, y: PLATFORM_Y }]
  },
  {
    id: 'pipe_triple',
    left: 'solid',
    right: 'solid',
    weight: 3,
    difficulty: 'hard',
    minRunIndex: 6,
    ground: solidGround(),
    pipes: [80, 200, 320],
    coins: [{ x: 200, y: COIN_Y_GROUND }]
  },
  {
    id: 'sparse_challenge',
    left: 'solid',
    right: 'solid',
    weight: 4,
    difficulty: 'hard',
    minRunIndex: 5,
    ground: [{ start: 0, end: 160 }, { start: 240, end: CHUNK_WIDTH }],
    pipes: [200],
    bubas: [[300, 250, 380, -1]],
    coins: [{ x: 100, y: COIN_Y_GROUND }]
  },
  {
    id: 'reward_run',
    left: 'solid',
    right: 'solid',
    weight: 5,
    difficulty: 'easy',
    minRunIndex: 4,
    ground: solidGround(),
    coins: [60, 120, 180, 240, 300, 360].map(x => ({ x, y: COIN_Y_GROUND }))
  },
  {
    id: 'finish',
    left: 'solid',
    right: 'solid',
    weight: 0,
    difficulty: 'easy',
    ground: solidGround(),
    coins: [
      { x: 120, y: COIN_Y_GROUND },
      { x: 220, y: COIN_Y_GROUND },
      { x: 320, y: COIN_Y_GROUND }
    ]
  }
];

export const CHUNK_BY_ID = Object.fromEntries(LEVEL_CHUNKS.map(c => [c.id, c]));

/** Minimum playable chunks between start and finish (research: 10–14 segments ≈ SMB 1-1 pacing) */
export const DEFAULT_RUN_CHUNK_COUNT = 12;
