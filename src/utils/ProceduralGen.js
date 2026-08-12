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

  // Generate a mountain with snow cap (opaque; snow follows peak geometry)
  static generateMountain(canvas, width, height, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const rng = this.seededRandom(seed);
    const baseY = height;
    const cx = width / 2;
    const peakY = height * (0.08 + rng() * 0.12);
    const snowLine = 0.3 + rng() * 0.2;
    const snowH = height * snowLine;

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(cx, peakY);
    ctx.lineTo(width, baseY);
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(cx, peakY, cx, baseY);
    bodyGrad.addColorStop(0, '#8B9DC3');
    bodyGrad.addColorStop(0.4, '#7B8FB5');
    bodyGrad.addColorStop(1, '#6B7FA5');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx, peakY);
    const slant = width * 0.5;
    ctx.lineTo(cx - slant * 0.35, peakY + snowH);
    ctx.lineTo(cx, peakY + snowH * 0.7);
    ctx.lineTo(cx + slant * 0.35, peakY + snowH);
    ctx.closePath();

    const snowGrad = ctx.createLinearGradient(cx, peakY, cx, peakY + snowH);
    snowGrad.addColorStop(0, '#ffffff');
    snowGrad.addColorStop(0.5, '#e8eef5');
    snowGrad.addColorStop(1, '#d0dce8');
    ctx.fillStyle = snowGrad;
    ctx.fill();

    return canvas;
  }

  // Generate a tree
  static generateTree(canvas, width, height, seed = Math.random()) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const rng = this.seededRandom(seed);

    // Tree trunk
    const trunkWidth = width * 0.15;
    const trunkHeight = height * 0.5;
    const trunkX = (width - trunkWidth) / 2;
    const trunkY = height - trunkHeight;

    const trunkGradient = ctx.createLinearGradient(trunkX, 0, trunkX + trunkWidth, 0);
    trunkGradient.addColorStop(0, '#8B4513');
    trunkGradient.addColorStop(1, '#654321');

    ctx.fillStyle = trunkGradient;
    ctx.fillRect(trunkX, trunkY, trunkWidth, trunkHeight);

    // Tree trunk details
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(trunkX, trunkY, trunkWidth, trunkHeight);

    // Tree leaves (multiple layers for 3D effect)
    const leafColors = ['#228B22', '#32CD32', '#208020'];

    for (let i = 0; i < 3; i++) {
      const layerY = trunkY - 10 - i * 15;
      const layerWidth = width * (0.7 - i * 0.15);
      const layerHeight = 25 + i * 5;

      ctx.fillStyle = leafColors[i % leafColors.length];
      ctx.beginPath();
      ctx.ellipse(
        width / 2,
        layerY + layerHeight / 2,
        layerWidth / 2,
        layerHeight / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Add leaf texture
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let j = 0; j < 5; j++) {
        const tx = width / 2 + (rng() - 0.5) * layerWidth * 0.6;
        const ty = layerY + (rng() - 0.5) * layerHeight;
        const size = 2 + rng() * 4;
        ctx.beginPath();
        ctx.arc(tx, ty, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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

    const legSwing = [0, 3, 0, -3][frame % 4];
    const armSwing = [0, -4, 0, 4][frame % 4];
    const lean = isRunning ? 2 : 0;

    // Shadow under feet
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height - 1, 12, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Shoes
    ctx.fillStyle = brown;
    ctx.fillRect(5 + legSwing, height - 6, 11, 5);
    ctx.fillRect(16 - legSwing, height - 6, 11, 5);
    ctx.fillStyle = inv('#3E2723');
    ctx.fillRect(5 + legSwing, height - 2, 11, 2);
    ctx.fillRect(16 - legSwing, height - 2, 11, 2);

    // Overalls / pants
    const pantsGrad = ctx.createLinearGradient(0, 38, 0, height);
    pantsGrad.addColorStop(0, blue);
    pantsGrad.addColorStop(1, darkBlue);
    ctx.fillStyle = pantsGrad;
    ctx.fillRect(8, 38, 16, 12);

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
