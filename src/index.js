
import Phaser from "phaser";
import PlayScene from './scenes/PlayScene';

const WIDTH = 800;
const HEIGHT = 600;
const WITCH_POSITION = { x: WIDTH * 0.1, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: WITCH_POSITION
}
const config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  physics: {
    default: 'arcade',

    arcade: {
      // gravity: { y: 400 },
      // debug: true
    }
  },
  scene: [new PlayScene(SHARED_CONFIG)]
}

new Phaser.Game(config);

