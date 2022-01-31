import Phaser from "phaser";

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }
    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('witch', 'assets/witch.png');
        this.load.image('tree', 'assets/tree.png');
        this.load.image('pause', 'assets/pause.png');
    }
    create() {
        this.scene.start('MenuScene');
    }
}

export default PreloadScene;