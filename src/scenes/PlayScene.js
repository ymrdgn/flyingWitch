import BaseScene from "./BaseScene";

const TREE_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);

        this.witch = null;
        this.trees = null;

        this.treeHorizontalDistance = 0;
        this.treeVerticalDistanceRange = [150, 250];
        this.treeHorizontalDistanceRange = [450, 500];
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = "";
    }

    create() {
        super.create();
        this.createWitch();
        this.createTree();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    createBG() {
        this.add.image(0, 0, 'sky').setOrigin(0);
    }

    createWitch() {
        this.witch = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'witch').setOrigin(0);
        this.witch.body.gravity.y = 600;
        this.witch.setCollideWorldBounds(true);
    }

    createTree() {
        this.trees = this.physics.add.group();
        for (let i = 0; i < TREE_TO_RENDER; i++) {
            const upperTree = this.trees.create(0, 0, 'tree')
                .setImmovable(true)
                .setOrigin(0, 1);

            const lowerTree = this.trees.create(0, 0, 'tree')
                .setImmovable(true)
                .setOrigin(0, 0);

            this.placeTree(upperTree, lowerTree)
        }

        this.trees.setVelocityX(-200);
    }
    createColliders() {
        this.physics.add.collider(this.witch, this.trees, this.gameOver, null, this);
    }
    createScore() {
        this.score = 0;
        this.scoreText = this.add.text(16, 16, `Score: ${0}`, { fontSize: "28px", fill: "#FF5F15" });
        const bestScore = localStorage.getItem('bestScore');
        this.bestScoreText = this.add.text(16, 52, `Best Score: ${bestScore || 0}`, { fontSize: "16px", fill: "#FF5F15" });
    
    }

    createPause(){
        const pauseButton = this.add.image(this.config.width - 10, this.config.height -10, 'pause')
        .setInteractive()
        .setScale(3)
        .setOrigin(1);

        // pauseButton.setInteractive();

        pauseButton.on('pointerdown', () => {
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('PauseScene');
        })
    }

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown_SPACE', this.flap, this);
    }

    checkGameStatus() {
        if (this.witch.getBounds().bottom >= this.config.height || this.witch.y <= 0) {
            this.gameOver();
        }
    }
    placeTree(uTree, lTree) {
        const rightMostX = this.getRightMostTree();
        const treeVerticalDistance = Phaser.Math.Between(...this.treeVerticalDistanceRange);
        const treeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - treeVerticalDistance)
        const treeHorizontalDistance = Phaser.Math.Between(...this.treeHorizontalDistanceRange);

        uTree.x = rightMostX + treeHorizontalDistance;
        uTree.y = treeVerticalPosition;

        lTree.x = uTree.x;
        lTree.y = uTree.y + treeVerticalDistance
    }

    recyclePipes() {
        const tempTrees = [];
        this.trees.getChildren().forEach(tree => {
            if (tree.getBounds().right <= 0) {
                tempTrees.push(tree);
                if (tempTrees.length === 2) {
                    this.placeTree(...tempTrees);
                    this.increaseScore();
                    this.saveBestScore()
                }
            }
        })
    }

    getRightMostTree() {
        let rightMostX = 0;

        this.trees.getChildren().forEach(function (tree) {
            rightMostX = Math.max(tree.x, rightMostX);
        })
        return rightMostX;
    }

    saveBestScore(){
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    }

    gameOver() {
        this.physics.pause();
        this.witch.setTint(0xEE4824);

        this.saveBestScore();
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.scene.restart();
            },
            loop: false
        });
    }

    flap() {
        this.witch.body.velocity.y = -this.flapVelocity;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`)
    }
}

export default PlayScene;