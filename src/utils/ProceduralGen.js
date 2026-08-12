// ProceduralGen - Procedural asset generation utilities
import { GAME_CONFIG } from '../config/gameConfig.js';

export class ProceduralGen {
  // Cloud puffs — exact algorithm from ThinkingCap FlappyBird js/game/Sky.js
  static makeCloudPuffs(scale) {
    const puffs = [];
    const count = Math.floor(Math.random() * 4) + 4;
    for (let i = 0; i < count; i++) {
      puffs.push({
        ox: (Math.random() - 0.5) * 50 * scale,
        oy: (Math.random() - 0.5) * 20 * scale,
        r: (Math.random() * 15 + 15) * scale
      });
    }
    return puffs;
  }

  /** Runtime draw — matches Sky.js draw() cloud loop */
  static drawCloudPuffs(ctx, x, y, puffs) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    for (const p of puffs) {
      const grad = ctx.createRadialGradient(
        x + p.ox + p.r * 0.2, y + p.oy - p.r * 0.1, 0,
        x + p.ox, y + p.oy, p.r
      );
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.6, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x + p.ox, y + p.oy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Bake one cloud to canvas (TitleScene / static use) — same puff model as Sky.js
  static generateCloud(canvas, width, height, seed = Math.random()) {
    const scale = Math.min(width, height) / 60;
    const puffs = this.makeCloudPuffs(scale);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    this.drawCloudPuffs(ctx, width / 2, height / 2, puffs);
    return canvas;
  }

  static MOUNTAIN_COLORS = {
    rockDark: '#4A5058',
    rockMid: '#5E656F',
    rockLight: '#787F89',
    snowWhite: '#FFFFFF',
    snowLight: '#E4E9EE',
    snowShadow: '#C5CDD6'
  };

  static fillMountainFacet(ctx, points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
  }

  static drawLowPolyPeak(ctx, px, py, xLeft, xRight, baseY, rng, colors, skipSilhouette = false) {
    const span = xRight - xLeft;
    const rise = baseY - py;

    const ridgeL = [px - span * (0.17 + rng() * 0.04), py + rise * (0.3 + rng() * 0.04)];
    const ridgeR = [px + span * (0.17 + rng() * 0.04), py + rise * (0.3 + rng() * 0.04)];
    const midL = [px - span * (0.36 + rng() * 0.03), py + rise * (0.56 + rng() * 0.03)];
    const midR = [px + span * (0.36 + rng() * 0.03), py + rise * (0.56 + rng() * 0.03)];
    const snowLine = py + rise * (0.24 + rng() * 0.06);
    const snowBaseL = [px - span * 0.22, snowLine];
    const snowBaseR = [px + span * 0.22, snowLine];

    if (!skipSilhouette) {
      this.fillMountainFacet(ctx, [[xLeft, baseY], [xRight, baseY], [px, py]], colors.rockMid);
    }

    // Rock shading facets (overdraw for low-poly planes)
    this.fillMountainFacet(ctx, [[xLeft, baseY], midL, ridgeL], colors.rockDark);
    this.fillMountainFacet(ctx, [[xLeft, baseY], ridgeL, [px, py]], colors.rockLight);
    this.fillMountainFacet(ctx, [midL, ridgeL, [px, py]], colors.rockMid);
    this.fillMountainFacet(ctx, [[xRight, baseY], midR, ridgeR], colors.rockDark);
    this.fillMountainFacet(ctx, [[xRight, baseY], ridgeR, [px, py]], colors.rockLight);
    this.fillMountainFacet(ctx, [midR, ridgeR, [px, py]], colors.rockMid);
    this.fillMountainFacet(ctx, [midL, midR, ridgeL], colors.rockDark);
    this.fillMountainFacet(ctx, [midR, ridgeR, midL], colors.rockMid);
    this.fillMountainFacet(ctx, [ridgeL, ridgeR, [px, py]], colors.rockLight);

    // Solid snow band, then faceted highlights (overlaps rock — no seam gap)
    this.fillMountainFacet(ctx, [[px, py], snowBaseL, snowBaseR], colors.snowWhite);
    this.fillMountainFacet(ctx, [[px, py], ridgeL, snowBaseL], colors.snowLight);
    this.fillMountainFacet(ctx, [[px, py], ridgeR, snowBaseR], colors.snowLight);
    this.fillMountainFacet(ctx, [snowBaseL, snowBaseR, ridgeR], colors.snowLight);
    this.fillMountainFacet(ctx, [snowBaseL, ridgeL, ridgeR], colors.snowShadow);
    this.fillMountainFacet(ctx, [[px, py], snowBaseL, ridgeL], colors.snowWhite);
    this.fillMountainFacet(ctx, [[px, py], snowBaseR, ridgeR], colors.snowWhite);
  }

  static fillMountainRangeSilhouette(ctx, peaks, width, baseY, color) {
    if (peaks.length === 0) return;
    if (peaks.length === 1) {
      this.fillMountainFacet(ctx, [[0, baseY], [width, baseY], [peaks[0].x, peaks[0].y]], color);
      return;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(peaks[0].x, peaks[0].y);
    for (let i = 1; i < peaks.length; i++) {
      ctx.lineTo(peaks[i].x, peaks[i].y);
    }
    ctx.lineTo(width, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // Low-poly faceted mountains — flat shaded rock + snow (no gradients)
  static generateMountain(canvas, width, height, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const rng = this.seededRandom(seed);
    const baseY = height;
    const colors = this.MOUNTAIN_COLORS;

    const peakCount = width > 220 ? 2 + Math.floor(rng() * 2) : 1 + Math.floor(rng() * 2);
    const peaks = [];
    for (let i = 0; i < peakCount; i++) {
      const t = peakCount === 1 ? 0.5 : (i + 0.5) / peakCount;
      peaks.push({
        x: width * (0.12 + t * 0.76) + (rng() - 0.5) * width * 0.05,
        y: height * (0.06 + rng() * 0.1)
      });
    }
    peaks.sort((a, b) => a.x - b.x);
    if (peakCount >= 2) {
      const tallest = Math.floor(rng() * peakCount);
      peaks[tallest].y = Math.min(...peaks.map((p) => p.y));
    }

    const margin = width * 0.04;
    this.fillMountainRangeSilhouette(ctx, peaks, width, baseY, colors.rockMid);

    for (let i = 0; i < peaks.length; i++) {
      const xLeft = i === 0 ? 0 : (peaks[i - 1].x + peaks[i].x) / 2;
      const xRight = i === peaks.length - 1 ? width : (peaks[i].x + peaks[i + 1].x) / 2;
      this.drawLowPolyPeak(
        ctx,
        peaks[i].x,
        peaks[i].y,
        Math.max(0, xLeft - margin * rng()),
        Math.min(width, xRight + margin * rng()),
        baseY,
        rng,
        colors,
        true
      );
    }

    return canvas;
  }

  // Flat vector tree styles — inspired by hand-drawn infographic silhouettes
  static TREE_STYLES = [
    'fluffyOak',
    'radialCircle',
    'orchardPuffs',
    'lobedForest',
    'pillDots',
    'tealBush',
    'geoConifer',
    'spikyEvergreen',
    'slenderPoplar',
    'yellowAutumn'
  ];

  static drawTreeScallop(ctx, cx, baseY, radiusX, radiusY, lobes, color) {
    const steps = lobes * 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI;
      const bump = i % 2 === 0 ? 1 : 0.72;
      const x = cx + Math.cos(t) * radiusX * bump;
      const y = baseY - Math.sin(t) * radiusY * bump;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  static drawTreePuffs(ctx, cx, cy, puffs, color) {
    ctx.fillStyle = color;
    for (const [ox, oy, r] of puffs) {
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawTreeTrunk(ctx, cx, topY, bottomY, width, color) {
    const half = width / 2;
    ctx.fillStyle = color;
    ctx.fillRect(cx - half, topY, width, bottomY - topY);
  }

  static drawTreeBranch(ctx, x1, y1, x2, y2, color, lineWidth = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  static drawTreeFluffyOak(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.58;
    const trunkW = Math.max(2, w * 0.12);
    this.drawTreeTrunk(ctx, cx, trunkTop, h, trunkW, '#A1887F');
    // Split branches
    const forkY = trunkTop + (h - trunkTop) * 0.35;
    for (const dir of [-1, 1]) {
      this.drawTreeBranch(ctx, cx, forkY, cx + dir * w * 0.18, trunkTop + 2, '#8D6E63', Math.max(1, w * 0.04));
    }
    // Shadow layer
    this.drawTreeScallop(ctx, cx + w * 0.03, trunkTop - 2, w * 0.44, h * 0.36, 6, '#388E3C');
    this.drawTreeScallop(ctx, cx, trunkTop - 4, w * 0.46, h * 0.38, 6, '#66BB6A');
  }

  static drawTreeRadialCircle(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.62;
    const canopyR = Math.min(w, h) * 0.38;
    const canopyCy = trunkTop - canopyR * 0.55;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.08), '#795548');
    ctx.fillStyle = '#80CBC4';
    ctx.beginPath();
    ctx.arc(cx, canopyCy, canopyR, 0, Math.PI * 2);
    ctx.fill();
    const spokes = 5 + Math.floor(rng() * 3);
    for (let i = 0; i < spokes; i++) {
      const angle = -Math.PI / 2 + ((i / (spokes - 1)) - 0.5) * Math.PI * 0.85;
      const len = canopyR * 0.75;
      this.drawTreeBranch(
        ctx, cx, canopyCy + canopyR * 0.15,
        cx + Math.cos(angle) * len, canopyCy + Math.sin(angle) * len + canopyR * 0.15,
        '#4DB6AC', Math.max(0.8, w * 0.025)
      );
    }
  }

  static drawTreeOrchardPuffs(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.55;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.1), '#4E342E');
    this.drawTreeBranch(ctx, cx, trunkTop + 4, cx - w * 0.12, trunkTop - 2, '#5D4037', Math.max(1, w * 0.03));
    this.drawTreeBranch(ctx, cx, trunkTop + 4, cx + w * 0.14, trunkTop - 4, '#5D4037', Math.max(1, w * 0.03));
    this.drawTreeBranch(ctx, cx, trunkTop + 8, cx, trunkTop - 6, '#5D4037', Math.max(1, w * 0.03));
    const puffR = w * 0.14;
    const puffs = [
      [-w * 0.18, trunkTop - h * 0.22, puffR],
      [w * 0.16, trunkTop - h * 0.24, puffR * 0.95],
      [-w * 0.05, trunkTop - h * 0.34, puffR * 1.05],
      [w * 0.05, trunkTop - h * 0.38, puffR],
      [-w * 0.22, trunkTop - h * 0.12, puffR * 0.85],
      [w * 0.2, trunkTop - h * 0.14, puffR * 0.8]
    ];
    this.drawTreePuffs(ctx, cx, 0, puffs, '#2E7D32');
    ctx.fillStyle = '#FFEB3B';
    for (const [ox, oy] of puffs) {
      if (rng() > 0.35) {
        ctx.beginPath();
        ctx.arc(cx + ox + (rng() - 0.5) * puffR * 0.4, oy + (rng() - 0.5) * puffR * 0.3, Math.max(1, w * 0.04), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  static drawTreeLobedForest(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.52;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.11), '#4E342E');
    for (const [dx, dy, len] of [[-0.14, -0.08, 0.18], [0.16, -0.1, 0.2], [-0.08, -0.18, 0.16], [0.1, -0.2, 0.18]]) {
      this.drawTreeBranch(ctx, cx, trunkTop + 2, cx + w * dx, trunkTop - h * dy, '#3E2723', Math.max(1, w * 0.035));
    }
    this.drawTreeScallop(ctx, cx, trunkTop - 4, w * 0.48, h * 0.42, 5, '#1B5E20');
    this.drawTreeScallop(ctx, cx - w * 0.02, trunkTop - 8, w * 0.44, h * 0.36, 5, '#2E7D32');
  }

  static drawTreePillDots(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.55;
    const canopyW = w * 0.52;
    const canopyH = h * 0.38;
    const canopyTop = trunkTop - canopyH;
    // Flared trunk
    ctx.fillStyle = '#1B4332';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.06, h);
    ctx.lineTo(cx + w * 0.06, h);
    ctx.lineTo(cx + w * 0.04, trunkTop);
    ctx.lineTo(cx - w * 0.04, trunkTop);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#95D5B2';
    ctx.beginPath();
    ctx.moveTo(cx - canopyW / 2, trunkTop);
    ctx.lineTo(cx + canopyW / 2, trunkTop);
    ctx.arc(cx, canopyTop + canopyH * 0.35, canopyW / 2, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    this.drawTreeBranch(ctx, cx, trunkTop, cx, canopyTop + canopyH * 0.2, '#1B4332', Math.max(0.8, w * 0.02));
    ctx.fillStyle = '#2D6A4F';
    const dotCount = 4 + Math.floor(rng() * 5);
    for (let i = 0; i < dotCount; i++) {
      ctx.beginPath();
      ctx.arc(
        cx + (rng() - 0.5) * canopyW * 0.7,
        canopyTop + canopyH * 0.25 + rng() * canopyH * 0.45,
        Math.max(0.8, w * 0.025),
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  static drawTreeTealBush(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.62;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.07), '#5D4037');
    for (const dir of [-0.12, 0, 0.12]) {
      this.drawTreeBranch(ctx, cx, trunkTop + 2, cx + w * dir, trunkTop - 4, '#4E342E', Math.max(0.8, w * 0.025));
    }
    this.drawTreeScallop(ctx, cx, trunkTop - 2, w * 0.38, h * 0.22, 3, '#00897B');
    ctx.fillStyle = '#B2DFDB';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(cx + (rng() - 0.5) * w * 0.3, trunkTop - h * 0.18 + rng() * h * 0.08, Math.max(0.6, w * 0.02), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawTreeGeoConifer(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.58;
    const canopyR = Math.min(w, h) * 0.36;
    const canopyCy = trunkTop - canopyR * 0.5;
    ctx.fillStyle = '#26A69A';
    ctx.beginPath();
    ctx.arc(cx, canopyCy, canopyR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00695C';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.08, h);
    ctx.lineTo(cx + w * 0.08, h);
    ctx.lineTo(cx + w * 0.02, canopyCy + canopyR * 0.35);
    ctx.lineTo(cx, canopyCy - canopyR * 0.15);
    ctx.lineTo(cx - w * 0.02, canopyCy + canopyR * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  static drawTreeSpikyEvergreen(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.48;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.09), '#8D6E63');
    const steps = 4;
    const topY = h * 0.06;
    ctx.fillStyle = '#43A047';
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = topY + (trunkTop - topY) * t;
      const halfW = w * (0.08 + t * 0.38);
      if (i % 2 === 0) {
        ctx.lineTo(cx + halfW, y);
        ctx.lineTo(cx + halfW * 0.85, y + (trunkTop - topY) / steps * 0.55);
      } else {
        ctx.lineTo(cx - halfW, y);
        ctx.lineTo(cx - halfW * 0.85, y + (trunkTop - topY) / steps * 0.55);
      }
    }
    ctx.lineTo(cx - w * 0.08, trunkTop);
    ctx.lineTo(cx + w * 0.08, trunkTop);
    ctx.closePath();
    ctx.fill();
    for (const dir of [-1, 1]) {
      this.drawTreeBranch(ctx, cx, trunkTop - 2, cx + dir * w * 0.12, trunkTop - h * 0.18, '#6D4C41', Math.max(0.8, w * 0.025));
    }
  }

  static drawTreeSlenderPoplar(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.72;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(1.5, w * 0.06), '#1B4332');
    const canopyH = h * 0.62;
    const canopyW = w * 0.28;
    ctx.fillStyle = '#A5D6A7';
    ctx.beginPath();
    ctx.moveTo(cx, h * 0.04);
    ctx.bezierCurveTo(cx + canopyW, h * 0.18, cx + canopyW * 0.85, trunkTop - 4, cx, trunkTop);
    ctx.bezierCurveTo(cx - canopyW * 0.85, trunkTop - 4, cx - canopyW, h * 0.18, cx, h * 0.04);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const y = trunkTop - (trunkTop - h * 0.12) * (i / 3);
      this.drawTreeBranch(ctx, cx, y, cx + w * 0.1, y - 2, '#2D6A4F', Math.max(0.6, w * 0.02));
      this.drawTreeBranch(ctx, cx, y, cx - w * 0.1, y - 2, '#2D6A4F', Math.max(0.6, w * 0.02));
    }
  }

  static drawTreeYellowAutumn(ctx, w, h, rng) {
    const cx = w / 2;
    const trunkTop = h * 0.68;
    this.drawTreeTrunk(ctx, cx, trunkTop, h, Math.max(2, w * 0.08), '#5D4037');
    this.drawTreeBranch(ctx, cx, trunkTop + 2, cx - w * 0.08, trunkTop - 4, '#4E342E', Math.max(0.8, w * 0.025));
    this.drawTreeBranch(ctx, cx, trunkTop + 2, cx + w * 0.08, trunkTop - 4, '#4E342E', Math.max(0.8, w * 0.025));
    this.drawTreeScallop(ctx, cx, trunkTop - 2, w * 0.32, h * 0.24, 3, '#FDD835');
  }

  // Generate a tree — picks one of several flat vector styles from seed
  static generateTree(canvas, width, height, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    const rng = this.seededRandom(seed);
    const style = this.TREE_STYLES[Math.floor(rng() * this.TREE_STYLES.length)];
    const drawers = {
      fluffyOak: this.drawTreeFluffyOak,
      radialCircle: this.drawTreeRadialCircle,
      orchardPuffs: this.drawTreeOrchardPuffs,
      lobedForest: this.drawTreeLobedForest,
      pillDots: this.drawTreePillDots,
      tealBush: this.drawTreeTealBush,
      geoConifer: this.drawTreeGeoConifer,
      spikyEvergreen: this.drawTreeSpikyEvergreen,
      slenderPoplar: this.drawTreeSlenderPoplar,
      yellowAutumn: this.drawTreeYellowAutumn
    };
    drawers[style].call(this, ctx, width, height, rng);
    ctx.globalAlpha = 1;

    return canvas;
  }

  // Generate ground texture
  static generateGround(canvas, width, height, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const rng = this.seededRandom(seed);

    // Base ground color
    const groundColor = '#8B4513';
    const darkGround = '#654321';
    const lightGround = '#A0522D';

    // Fill base
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grass layer with individual blades
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, 0, width, 10);
    ctx.fillStyle = '#43A047';
    for (let i = 0; i < width; i += 2) {
      const bladeH = 4 + rng() * 7;
      const sway = Math.sin(i * 0.15) * 1;
      ctx.beginPath();
      ctx.moveTo(i, 10);
      ctx.quadraticCurveTo(i + sway, 10 - bladeH * 0.6, i + sway * 0.5, 10 - bladeH);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = i % 4 === 0 ? '#66BB6A' : '#388E3C';
      ctx.stroke();
    }
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(0, 8, width, 2);

    // Draw ground texture (dirt patterns)
    ctx.fillStyle = darkGround;
    for (let i = 0; i < 20; i++) {
      const x = rng() * width;
      const y = 10 + rng() * (height - 10);
      const w = 5 + rng() * 15;
      const h = 3 + rng() * 8;
      ctx.fillRect(x, y, w, h);
    }

    ctx.fillStyle = lightGround;
    for (let i = 0; i < 15; i++) {
      const x = rng() * width;
      const y = 10 + rng() * (height - 10);
      const w = 3 + rng() * 10;
      const h = 2 + rng() * 5;
      ctx.fillRect(x, y, w, h);
    }

    // Draw stones
    ctx.fillStyle = '#A9A9A9';
    for (let i = 0; i < 10; i++) {
      const x = rng() * width;
      const y = 15 + rng() * (height - 15);
      const r = 2 + rng() * 5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  // Generate a pipe with authentic Super Mario Bros. appearance
  static generatePipe(canvas, bodyWidth, height, isTop = false, seed = Math.random(), capExtension = 8) {
    const ctx = canvas.getContext('2d');
    const totalWidth = canvas.width; // should be bodyWidth + capExtension * 2
    const bodyX = capExtension;      // body starts here, not x=0

    ctx.clearRect(0, 0, totalWidth, height);

    const rng = this.seededRandom(seed);

    // Classic SMB pipe colors
    const pipeGreen = '#228B22';       // Main pipe body color
    const pipeDark = '#006400';        // Darker green for borders/shadows
    const pipeLight = '#32CD32';       // Lighter green for highlights
    const pipeCap = '#40A040';         // Cap rim color
    const pipeCapTop = '#5CB85C';      // Top-surface of cap (lightest, simulating top-down view)

    // Draw pipe body with vertical gradient for 3D cylindrical effect
    const bodyGradient = ctx.createLinearGradient(bodyX, 0, bodyX + bodyWidth, 0);
    bodyGradient.addColorStop(0, pipeLight);
    bodyGradient.addColorStop(0.5, pipeGreen);
    bodyGradient.addColorStop(1, pipeDark);
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(bodyX, 0, bodyWidth, height);

    // Side borders for cylindrical illusion (stop before bottom 10px)
    const borderBottom = height - 10;
    ctx.fillStyle = pipeDark;
    ctx.fillRect(bodyX, 0, 3, borderBottom);           // Left shadow (3px)
    ctx.fillRect(bodyX + bodyWidth - 3, 0, 3, borderBottom);   // Right shadow (3px)

    // Left highlight stripe
    ctx.fillStyle = pipeLight;
    ctx.fillRect(bodyX + 2, 0, 1, borderBottom);

    // Draw the signature pipe cap at the TOP of the pipe
    // Authentic SMB: cap extends well beyond body width (~1.2-1.3x ratio)
    const capHeight = GAME_CONFIG.PIPE_CAP_HEIGHT ?? 10;

    // Cap top surface - lightest green simulating "looking down on the rim"
    const capTopGrad = ctx.createLinearGradient(0, 0, 0, 4);
    capTopGrad.addColorStop(0, '#7DCE7D');
    capTopGrad.addColorStop(1, pipeCapTop);
    ctx.fillStyle = capTopGrad;
    ctx.fillRect(0, 0, totalWidth, 3);

    // Cap lip highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(2, 1, totalWidth - 4, 1);

    // Cap front face - main body-colored section
    ctx.fillStyle = pipeGreen;
    ctx.fillRect(1, 2, totalWidth - 2, capHeight - 3);

    // Cap border line (bottom edge of the cap)
    ctx.strokeStyle = pipeCap;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, capHeight - 1);
    ctx.lineTo(totalWidth, capHeight - 1);
    ctx.stroke();

    // Horizontal bands for 3D texture effect (below the cap)
    // Start well below cap for visual breathing room; stop before pipe bottom edge
    const bandStart = capHeight + 20;
    const bandEnd = Math.floor(height * 0.7);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    for (let y = bandStart; y < bandEnd; y += 25) {
      ctx.beginPath();
      ctx.moveTo(bodyX + 3, y);
      ctx.lineTo(bodyX + bodyWidth - 3, y);
      ctx.stroke();
    }

    // NOTE: No dirt/moisture details - authentic SMB pipes are clean.
    // Bottom edge is intentionally clean and flush (no visual detail at ground level).

    return canvas;
  }

  // Generate Muper Sario character sprite (enhanced v2)
  static generatePlayer(canvas, width, height, frame = 0, isRunning = false) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const inv = (hex) => this.invertHex(hex);
    const red = inv('#E52521');
    const blue = inv('#0066CC');
    const skin = inv('#FFCC99');
    const white = inv('#FFFFFF');
    const black = inv('#1a1a1a');
    const darkRed = inv('#B71C1C');
    const darkBlue = inv('#004C99');
    const brown = inv('#5D4037');

    const leftLift = [0, -3, 0, 3][frame % 4];
    const rightLift = [3, 0, -3, 0][frame % 4];
    const armSwing = [0, -4, 0, 4][frame % 4];
    const lean = isRunning ? 2 : 0;
    const leftLegX = 9;
    const rightLegX = 20;
    const legW = 6;
    const shoeH = 5;
    const footBase = height - 2;

    // Shadow under feet
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 1, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Overalls / pants (upper)
    const pantsGrad = ctx.createLinearGradient(0, 38, 0, height);
    pantsGrad.addColorStop(0, blue);
    pantsGrad.addColorStop(1, darkBlue);
    ctx.fillStyle = pantsGrad;
    ctx.fillRect(8, 38, 16, 12);

    // Legs — vertical under torso; alternate lift for walk cycle
    ctx.fillStyle = darkBlue;
    for (const [legX, lift] of [[leftLegX, leftLift], [rightLegX, rightLift]]) {
      const legTop = 50 + Math.max(0, lift);
      const shoeTop = footBase - shoeH + lift;
      ctx.fillRect(legX, legTop, legW, Math.max(2, shoeTop - legTop));
    }

    // Shoes
    ctx.fillStyle = brown;
    ctx.fillRect(leftLegX - 1, footBase - shoeH + leftLift, legW + 2, shoeH);
    ctx.fillRect(rightLegX - 1, footBase - shoeH + rightLift, legW + 2, shoeH);
    ctx.fillStyle = inv('#3E2723');
    ctx.fillRect(leftLegX - 1, footBase - 2 + leftLift, legW + 2, 2);
    ctx.fillRect(rightLegX - 1, footBase - 2 + rightLift, legW + 2, 2);

    // Torso
    const bodyGrad = ctx.createLinearGradient(0, 22, 0, 40);
    bodyGrad.addColorStop(0, inv('#FF4444'));
    bodyGrad.addColorStop(1, red);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(8 + lean, 22, 16, 18);
    ctx.fillStyle = darkRed;
    ctx.fillRect(8 + lean, 38, 16, 2);

    // Overalls front panel
    ctx.fillStyle = blue;
    ctx.fillRect(12 + lean, 28, 8, 12);
    ctx.fillStyle = inv('#FFD700');
    ctx.beginPath();
    ctx.arc(14 + lean, 30, 2, 0, Math.PI * 2);
    ctx.arc(18 + lean, 30, 2, 0, Math.PI * 2);
    ctx.fill();

    // Straps
    ctx.fillStyle = blue;
    ctx.fillRect(10 + lean, 24, 3, 10);
    ctx.fillRect(19 + lean, 24, 3, 10);

    // Arms
    ctx.fillStyle = red;
    ctx.fillRect(4, 26 + armSwing, 5, 12);
    ctx.fillRect(23, 26 - armSwing, 5, 12);
    ctx.fillStyle = skin;
    ctx.fillRect(3, 36 + armSwing, 4, 4);
    ctx.fillRect(25, 36 - armSwing, 4, 4);

    // Neck
    ctx.fillStyle = skin;
    ctx.fillRect(13 + lean, 18, 6, 5);

    // Head
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.roundRect(10 + lean, 8, 14, 14, 3);
    ctx.fill();

    // Cap
    ctx.fillStyle = red;
    ctx.fillRect(8 + lean, 4, 18, 8);
    ctx.fillStyle = darkRed;
    ctx.fillRect(8 + lean, 10, 18, 3);
    ctx.fillStyle = white;
    ctx.fillRect(8 + lean, 7, 18, 2);
    ctx.fillStyle = inv('#FF6666');
    ctx.fillRect(10 + lean, 5, 4, 5);
    // Cap brim
    ctx.fillStyle = red;
    ctx.fillRect(22 + lean, 10, 6, 3);

    // Face
    ctx.fillStyle = black;
    ctx.fillRect(13 + lean, 13, 2, 3);
    ctx.fillRect(19 + lean, 13, 2, 3);
    ctx.fillStyle = inv('#8B4513');
    ctx.fillRect(14 + lean, 16, 6, 1);
    ctx.fillRect(13 + lean, 17, 1, 2);
    ctx.fillRect(20 + lean, 17, 1, 2);

    // Outline
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8 + lean, 22, 16, 18);

    return canvas;
  }

  // SMB-style brick block for floating platforms
  static generateBlock(canvas, size, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    const brick = '#C84B00';
    const brickDark = '#8B3200';
    const mortar = '#5C3317';
    const highlight = '#E07030';

    ctx.fillStyle = brick;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = mortar;
    ctx.lineWidth = 1;

    const rowH = size / 4;
    for (let row = 0; row < 4; row++) {
      const y = row * rowH;
      const offset = row % 2 === 0 ? 0 : size / 4;
      for (let x = -size / 4; x < size; x += size / 2) {
        ctx.strokeRect(x + offset + 0.5, y + 0.5, size / 2 - 1, rowH - 1);
      }
    }

    ctx.fillStyle = highlight;
    ctx.fillRect(1, 1, size - 2, 2);
    ctx.fillStyle = brickDark;
    ctx.fillRect(1, size - 3, size - 2, 2);

    return canvas;
  }

  // Generate a coin with faux-3D spin
  static generateCoin(canvas, width, height, frame = 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = width / 2 - 2;
    const squash = Math.abs(Math.cos((frame / 4) * Math.PI * 2));
    const radiusX = maxRadius * (0.35 + squash * 0.65);
    const radiusY = maxRadius;

    ctx.save();
    ctx.translate(centerX, centerY);

    const gradient = ctx.createRadialGradient(-radiusX * 0.3, -radiusY * 0.3, 1, 0, 0, radiusY);
    gradient.addColorStop(0, '#FFF8DC');
    gradient.addColorStop(0.35, '#FFD700');
    gradient.addColorStop(0.7, '#FFA500');
    gradient.addColorStop(1, '#B8860B');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (squash > 0.55) {
      ctx.fillStyle = '#8B6914';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 1);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(-radiusX * 0.25, -radiusY * 0.3, radiusX * 0.2, radiusY * 0.15, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return canvas;
  }

  // Buba enemy — mushroom critter (legally distinct silhouette)
  static generateBuba(canvas, width, height, frame = 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const capBrown = '#8B5E3C';
    const capDark = '#5D4037';
    const capSpot = '#D7CCC8';
    const bodyTan = '#BCAAA4';
    const eyeWhite = '#FAFAFA';
    const pupil = '#212121';
    const footDark = '#4E342E';

    const wobble = frame === 1 ? 1 : 0;
    const cx = width / 2;

    // Feet
    ctx.fillStyle = footDark;
    ctx.beginPath();
    ctx.ellipse(cx - 8, height - 3 + wobble, 6, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 8, height - 3 - wobble, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body stem
    const bodyGrad = ctx.createLinearGradient(cx - 10, 14, cx + 10, height);
    bodyGrad.addColorStop(0, '#D7CCC8');
    bodyGrad.addColorStop(1, bodyTan);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 9, 16, 18, 14, 4);
    ctx.fill();

    // Angry brow
    ctx.strokeStyle = capDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, 18);
    ctx.lineTo(cx - 3, 20);
    ctx.moveTo(cx + 9, 18);
    ctx.lineTo(cx + 3, 20);
    ctx.stroke();

    // Eyes
    ctx.fillStyle = eyeWhite;
    ctx.beginPath();
    ctx.ellipse(cx - 5, 21, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, 21, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pupil;
    ctx.beginPath();
    ctx.arc(cx - 4, 22, 2, 0, Math.PI * 2);
    ctx.arc(cx + 6, 22, 2, 0, Math.PI * 2);
    ctx.fill();

    // Cap
    const capGrad = ctx.createRadialGradient(cx, 10, 2, cx, 10, 16);
    capGrad.addColorStop(0, '#A1887F');
    capGrad.addColorStop(0.5, capBrown);
    capGrad.addColorStop(1, capDark);
    ctx.fillStyle = capGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 12, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Spots
    ctx.fillStyle = capSpot;
    for (const [sx, sy, sr] of [[cx - 6, 8, 3], [cx + 5, 10, 2.5], [cx, 5, 2]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, 12, 15, 11, 0, 0, Math.PI * 2);
    ctx.stroke();

    return canvas;
  }

  static generateBubaSquished(canvas, width, height) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 2, width * 0.42, height * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(width * 0.12, height - 4, width * 0.76, Math.max(2, height - 4));
    return canvas;
  }

  /** Invert a #RRGGBB hex color (photographic inversion) */
  static invertHex(hex) {
    const h = hex.replace('#', '');
    const r = 255 - parseInt(h.slice(0, 2), 16);
    const g = 255 - parseInt(h.slice(2, 4), 16);
    const b = 255 - parseInt(h.slice(4, 6), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Seeded random number generator
  static seededRandom(seed) {
    let s = seed;
    if (s === undefined) s = Math.random();
    return function() {
      s = s + 0.0000000000000001;
      const x = Math.sin(s * 10000) * 100000;
      return x - Math.floor(x);
    };
  }
}
