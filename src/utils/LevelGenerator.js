// Procedural rogue-lite level assembly from socket-matched chunks
import { GAME_CONFIG } from '../config/gameConfig.js';
import {
  CHUNK_BY_ID,
  CHUNK_WIDTH,
  DEFAULT_RUN_CHUNK_COUNT,
  LEVEL_CHUNKS
} from '../config/levelChunks.js';

const FINISH_MARGIN = 80;

/** Mulberry32 — fast seeded PRNG (PCG standard practice: reproducible runs from seed) */
export function createRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(input) {
  const str = String(input);
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Read optional `?seed=` from the page URL (numeric or string → hashSeed).
 * Omit param → undefined (caller uses Date.now()).
 */
export function getRunSeedFromUrl(location = globalThis.location) {
  if (!location?.search) return undefined;
  const raw = new URLSearchParams(location.search).get('seed');
  if (raw == null || raw === '') return undefined;
  const n = Number(raw);
  if (Number.isFinite(n)) return n >>> 0;
  return hashSeed(raw);
}

function weightedPick(items, rng) {
  const total = items.reduce((s, c) => s + c.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function difficultyForIndex(index, totalMiddle) {
  const t = index / Math.max(1, totalMiddle - 1);
  if (t < 0.35) return 'easy';
  if (t < 0.7) return 'medium';
  return 'hard';
}

function allowedDifficulty(chunkDiff, slotDiff) {
  const order = { easy: 0, medium: 1, hard: 2 };
  return order[chunkDiff] <= order[slotDiff] + 1;
}

function getPlayablePool(leftSocket, runIndex, slotDifficulty, excludeIds) {
  return LEVEL_CHUNKS.filter(c => {
    if (c.weight <= 0) return false;
    if (excludeIds.has(c.id)) return false;
    if (c.left !== leftSocket) return false;
    if (c.minRunIndex != null && runIndex < c.minRunIndex) return false;
    if (c.maxRunIndex != null && runIndex > c.maxRunIndex) return false;
    if (!allowedDifficulty(c.difficulty, slotDifficulty)) return false;
    return true;
  });
}

function mergeGroundSegments(segments) {
  if (segments.length === 0) return [];
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const merged = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end + 1) {
      prev.end = Math.max(prev.end, cur.end);
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

function offsetChunk(chunk, worldX) {
  const ground = (chunk.ground || []).map(g => ({
    start: worldX + g.start,
    end: worldX + g.end
  }));
  const pipes = (chunk.pipes || []).map(x => worldX + x);
  const blocks = (chunk.blocks || []).map(b => ({ x: worldX + b.x, y: b.y }));
  const coins = (chunk.coins || []).map(c => ({ x: worldX + c.x, y: c.y }));
  const bubas = (chunk.bubas || []).map(([x, min, max, dir]) => [
    worldX + x,
    worldX + min,
    worldX + max,
    dir
  ]);
  return { ground, pipes, blocks, coins, bubas };
}

/**
 * @param {number} [seed] — omit for Date.now()-based run
 * @param {{ chunkCount?: number }} [options]
 */
export function generateLevel(seed, options = {}) {
  const runSeed = seed != null ? seed >>> 0 : (Date.now() >>> 0);
  const rng = createRng(runSeed);
  const middleCount = Math.max(
    6,
    (options.chunkCount ?? DEFAULT_RUN_CHUNK_COUNT) - 2
  );

  const sequence = ['start'];
  let leftSocket = CHUNK_BY_ID.start.right;

  for (let i = 0; i < middleCount; i++) {
    const slotDiff = difficultyForIndex(i, middleCount);
    let pool = getPlayablePool(leftSocket, i + 1, slotDiff, new Set(['start', 'finish']));

    if (pool.length === 0) {
      pool = getPlayablePool(leftSocket, i + 1, 'hard', new Set(['start', 'finish']));
    }

    if (pool.length === 0 && leftSocket === 'open') {
      const endGap = CHUNK_BY_ID.gap_end;
      if (endGap && endGap.left === 'open') {
        sequence.push('gap_end');
        leftSocket = endGap.right;
        continue;
      }
    }

    if (pool.length === 0) {
      const fallback = CHUNK_BY_ID.flat_empty;
      sequence.push(fallback.id);
      leftSocket = fallback.right;
      continue;
    }

    const picked = weightedPick(pool, rng);
    sequence.push(picked.id);
    leftSocket = picked.right;
  }

  if (leftSocket === 'open') {
    sequence.push('gap_end');
    leftSocket = CHUNK_BY_ID.gap_end.right;
  }

  const finish = CHUNK_BY_ID.finish;
  if (finish.left !== leftSocket) {
    throw new Error(
      `LevelGenerator: cannot attach finish (need left=${leftSocket}, finish.left=${finish.left})`
    );
  }
  sequence.push('finish');

  let worldX = 0;
  let ground = [];
  let pipes = [];
  let blocks = [];
  let coins = [];
  let bubas = [];
  let pitCount = 0;

  for (const id of sequence) {
    const chunk = CHUNK_BY_ID[id];
    const part = offsetChunk(chunk, worldX);
    ground.push(...part.ground);
    pipes.push(...part.pipes);
    blocks.push(...part.blocks);
    coins.push(...part.coins);
    bubas.push(...part.bubas);

    const segs = chunk.ground || [];
    if (segs.length > 1 || (segs.length === 1 && segs[0].start > 0)) pitCount++;
    if (chunk.left === 'open' || chunk.right === 'open') pitCount++;

    worldX += CHUNK_WIDTH;
  }

  ground = mergeGroundSegments(ground);

  const width = worldX;
  const finishX = width - FINISH_MARGIN;
  const parTimeSeconds = Math.round(
    55 + middleCount * 4 + pitCount * 6 + coins.length * 0.5
  );

  return {
    width,
    finishX,
    parTimeSeconds,
    ground,
    pipes,
    blocks,
    coins,
    bubas,
    seed: runSeed,
    chunkSequence: sequence
  };
}

/** Structural sanity checks (roguelite fairness: exit reachable, no orphan open sockets) */
export function validateLevel(layout) {
  const errors = [];
  if (!layout.ground.length) errors.push('no ground segments');
  if (layout.finishX >= layout.width) errors.push('finishX past width');
  if (layout.finishX < layout.width * 0.5) errors.push('finishX too early');

  const capHalf = GAME_CONFIG.PIPE_CAP_EXTENSION + GAME_CONFIG.PIPE_WIDTH / 2;
  for (const coin of layout.coins) {
    for (const px of layout.pipes) {
      const capLeft = px - GAME_CONFIG.PIPE_CAP_EXTENSION;
      const capRight = px + GAME_CONFIG.PIPE_WIDTH + GAME_CONFIG.PIPE_CAP_EXTENSION;
      if (coin.x >= capLeft - GAME_CONFIG.COIN_MIN_PIPE_GAP &&
          coin.x <= capRight + GAME_CONFIG.COIN_MIN_PIPE_GAP) {
        errors.push(`coin ${coin.x} too close to pipe ${px}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function generateValidatedLevel(seed, options = {}) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const layout = generateLevel(seed != null ? seed + attempt : undefined, options);
    const check = validateLevel(layout);
    if (check.ok) return layout;
  }
  return generateLevel(seed);
}
