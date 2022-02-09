import BaseScene from "./BaseScene";

const TREE_TO_RENDER = 4;

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);

        this.witch = null;
        this.trees = null;
        this.isPaused = false;

        this.treeHorizontalDistance = 0;
        this.flapVelocity = 300;

        this.score = 0;
        this.scoreText = "";

        this.currentDifficulty = 'easy';
        this.difficulties = {
            'easy': {
                treeHorizontalDistanceRange: [300, 350],
                treeVerticalDistanceRange: [150, 200]
            },
            'normal': {
                treeHorizontalDistanceRange: [280, 330],
                treeVerticalDistanceRange: [140, 190]
            },
            'hard': {
                treeHorizontalDistanceRange: [250, 310],
                treeVerticalDistanceRange: [120, 150]
            }
        }
    }

    create() {
        this.currentDifficulty = 'easy';
        super.create();
        this.createWitch();
        this.createTree();
        this.createColliders();
        this.createScore();
        this.createPause();
        this.handleInputs();
        this.listenToEvents();
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    listenToEvents() {
        if (this.pauseEvent) {
            return;
        }
        this.pauseEvent = this.events.on('resume', () => {
            this.initialTime = 3;
            this.countDownText = this.add.text(...this.screenCenter, 'Fly in: ' + this.initialTime, this.fontOptions).setOrigin(0.5);
            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: this.countDown,
                callbackScope: this,
                loop: true
            })
        })
    }

    countDown() {
        this.initialTime--;
        this.countDownText.setText('Fly in: ' + this.initialTime);
        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.countDownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
        }
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

    createPause() {
        this.isPaused = false;
        const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
            .setInteractive()
            .setScale(3)
            .setOrigin(1);

        // pauseButton.setInteractive();

        pauseButton.on('pointerdown', () => {
            this.isPaused = true;
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
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostX = this.getRightMostTree();
        const treeVerticalDistance = Phaser.Math.Between(...difficulty.treeVerticalDistanceRange);
        const treeVerticalPosition = Phaser.Math.Between(0 + 20, this.config.height - 20 - treeVerticalDistance)
        const treeHorizontalDistance = Phaser.Math.Between(...difficulty.treeHorizontalDistanceRange);

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
                    this.saveBestScore();
                    this.increaseDifficulty();
                }
            }
        })
    }
    increaseDifficulty(){
        if(this.score === 1){
            this.currentDifficulty = 'normal';
        }
        if(this.score === 3){
            this.currentDifficulty = 'hard';
        }
    }

    getRightMostTree() {
        let rightMostX = 0;

        this.trees.getChildren().forEach(function (tree) {
            rightMostX = Math.max(tree.x, rightMostX);
        })
        return rightMostX;
    }

    saveBestScore() {
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
        if(this.isPaused){
            return;
        }
        this.witch.body.velocity.y = -this.flapVelocity;
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score: ${this.score}`)
    }
}

export default PlayScene;