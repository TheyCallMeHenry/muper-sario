// MathUtils - v2: export only what is used
export class MathUtils {
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /** Inverse time multiplier: faster completion → higher multiplier */
  static computeTimeScoreMultiplier(elapsedSeconds, parSeconds, minMult, maxMult) {
    if (elapsedSeconds <= 0) return maxMult;
    const raw = parSeconds / elapsedSeconds;
    return this.clamp(raw, minMult, maxMult);
  }

  static formatTime(seconds) {
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }
}
