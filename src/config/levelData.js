// Level layout — procedural rogue-lite runs + legacy hand-crafted reference
import { GAME_CONFIG } from './gameConfig.js';
import { DEFAULT_RUN_CHUNK_COUNT } from './levelChunks.js';
import { generateValidatedLevel } from '../utils/LevelGenerator.js';

export { DEFAULT_RUN_CHUNK_COUNT };

const GROUND_SURFACE_Y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.GROUND_HEIGHT;
const BLOCK = GAME_CONFIG.BLOCK_SIZE;
const COIN_W = GAME_CONFIG.COIN_HEIGHT;

const COIN_Y_ON_GROUND =
  GROUND_SURFACE_Y - GAME_CONFIG.COIN_FLOAT_ABOVE - COIN_W;
const PLATFORM_Y = GROUND_SURFACE_Y - BLOCK * 3;
const COIN_Y_ON_PLATFORM =
  PLATFORM_Y - GAME_CONFIG.COIN_FLOAT_ABOVE - COIN_W;

/** Legacy hand-placed SMB 1-1-inspired layout (reference / regression baseline) */
const ELEVATED_COIN_X = [
  450, 650, 980, 1280, 2210, 2410, 2810, 3010, 3840, 4050, 4640
];

const PIPES = [520, 720, 1180, 1380, 2080, 2280, 2680, 2880, 3080, 3920, 4120];

const GROUND_COIN_X = [
  180, 260, 340, 630, 1090, 1500, 1980, 2580, 3180, 3380, 3720, 4200, 4360, 4520
];

export const LEVEL_1 = {
  width: 4800,
  finishX: 4720,
  parTimeSeconds: 90,
  ground: [
    { start: 0, end: 1680 },
    { start: 1820, end: 3480 },
    { start: 3600, end: 4800 }
  ],
  pipes: PIPES,
  blocks: ELEVATED_COIN_X.map(x => ({
    x: x - BLOCK / 2,
    y: PLATFORM_Y
  })),
  coins: [
    ...GROUND_COIN_X.map(x => ({ x, y: COIN_Y_ON_GROUND })),
    ...ELEVATED_COIN_X.map(x => ({ x, y: COIN_Y_ON_PLATFORM }))
  ],
  bubas: [
    [280, 200, 460, 1],
    [920, 760, 1080, -1],
    [1620, 1480, 1660, 1],
    [2420, 2320, 2620, -1],
    [3260, 3120, 3420, 1],
    [3780, 3640, 3880, -1]
  ]
};

/**
 * New run layout — seeded chunk assembly (see LevelGenerator.js).
 * @param {number} [seed]
 */
export function createRunLevel(seed) {
  return generateValidatedLevel(seed, { chunkCount: DEFAULT_RUN_CHUNK_COUNT });
}
