// Level 1 — SMB-inspired side-scrolling layout (world coordinates)
// Pipes/coins/bubas use world X; Y omitted on coins uses default ground height

export const LEVEL_1 = {
  width: 4800,
  finishX: 4720,
  /** Par time (seconds) — faster runs earn up to TIME_SCORE_MAX_MULT on final score */
  parTimeSeconds: 90,

  /** Solid ground segments — gaps are pits */
  ground: [
    { start: 0, end: 1680 },
    { start: 1820, end: 3480 },
    { start: 3600, end: 4800 }
  ],

  pipes: [520, 720, 1180, 1380, 2080, 2280, 2680, 2880, 3080, 3920, 4120],

  coins: [
    { x: 180, y: 440 },
    { x: 260, y: 440 },
    { x: 340, y: 440 },
    { x: 480, y: 360 },
    { x: 620, y: 360 },
    { x: 780, y: 440 },
    { x: 980, y: 360 },
    { x: 1120, y: 440 },
    { x: 1280, y: 360 },
    { x: 1500, y: 440 },
    { x: 1980, y: 440 },
    { x: 2180, y: 360 },
    { x: 2380, y: 360 },
    { x: 2580, y: 440 },
    { x: 2780, y: 360 },
    { x: 2980, y: 360 },
    { x: 3180, y: 440 },
    { x: 3380, y: 440 },
    { x: 3720, y: 440 },
    { x: 3880, y: 360 },
    { x: 4040, y: 360 },
    { x: 4200, y: 440 },
    { x: 4360, y: 440 },
    { x: 4520, y: 440 },
    { x: 4640, y: 360 }
  ],

  /** x, patrolMin, patrolMax, direction */
  bubas: [
    [280, 200, 460, 1],
    [920, 760, 1080, -1],
    [1620, 1480, 1660, 1],
    [2420, 2320, 2620, -1],
    [3260, 3120, 3420, 1],
    [3780, 3640, 3880, -1]
  ]
};
