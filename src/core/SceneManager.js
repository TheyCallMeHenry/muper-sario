// SceneManager - scene registry
import { TitleScene } from '../scenes/TitleScene.js';
import { GameScene } from '../scenes/GameScene.js';
import { HighScoresScene } from '../scenes/HighScoresScene.js';

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.currentScene = null;

    this.registerScene('title', new TitleScene(this));
    this.registerScene('game', new GameScene(this));
    this.registerScene('high_scores', new HighScoresScene(this));

    this.changeScene('title');
  }

  registerScene(name, scene) {
    this.scenes.set(name, scene);
  }

  changeScene(name, data = null) {
    if (this.currentScene?.exit) {
      this.currentScene.exit();
    }
    this.currentScene = this.scenes.get(name);
    if (this.currentScene?.enter) {
      this.currentScene.enter(data);
    }
  }

  update(deltaTime) {
    if (this.currentScene?.update) {
      this.currentScene.update(deltaTime);
    }
  }

  getGame() {
    return this.game;
  }
}
