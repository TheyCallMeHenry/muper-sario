// UiText - readable canvas text over bright procedural backgrounds
export const UiText = {
  drawPanel(ctx, x, y, w, h, radius = 8, fill = 'rgba(0, 0, 0, 0.58)') {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fill();
    ctx.restore();
  },

  drawText(ctx, text, x, y, opts = {}) {
    const {
      fill = '#FFFFFF',
      stroke = '#0d1b2a',
      lineWidth = 3,
      font = 'bold 24px "Courier New", monospace',
      align = 'center',
      baseline = 'middle',
      alpha = 1
    } = opts;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fill;
    if (lineWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.strokeText(text, x, y);
    }
    ctx.fillText(text, x, y);
    ctx.restore();
  }
};
