// Storage - unified localStorage API (v2)
const SCORES_KEY = 'muperSario2Scores';

export class Storage {
  static getAllScores() {
    try {
      const saved = localStorage.getItem(SCORES_KEY);
      if (!saved) return [];
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  static getHighScore() {
    const scores = this.getAllScores();
    return scores.length > 0 ? scores[0].score : 0;
  }

  static saveScore(score, name = 'AAA') {
    const scores = this.getAllScores();
    scores.push({ score, name: name.toUpperCase().slice(0, 3), date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, 10);
    try {
      localStorage.setItem(SCORES_KEY, JSON.stringify(top));
    } catch (e) {
      console.warn('Could not save score:', e);
    }
    return top;
  }
}
