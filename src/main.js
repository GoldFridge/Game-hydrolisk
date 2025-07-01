const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'matter',
        matter: {
        gravity: { y: 0 }
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

let player, cursors, camera, interactText, victoryText;
let interactZone;

function preload() {
    this.load.image('tiles', 'assets/bricks.png');
    this.load.image('construction', 'assets/construction.png');
    this.load.spritesheet('player', 'assets/hydrolisk.png', {
        frameWidth: 40,
        frameHeight: 51,
        spacing: 5,
        margin: 1,
    });
}

function create() {
    // --- Большая карта ---
    const mapWidth = 2000;
    const mapHeight = 2000;
    const graphics = this.add.tileSprite(0, 0, mapWidth, mapHeight, 'tiles').setOrigin(0);
    this.matter.world.setBounds(0, 0, mapWidth, mapHeight);

    // --- Игрок ---
    player = this.matter.add.sprite(400, 300, 'player', 4);
    player.setFixedRotation();

    // --- Камера ---
    camera = this.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, mapWidth, mapHeight);

    // --- Управление ---
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-X', () => {
        if (interactText.visible) {
            victoryText.setVisible(true);
        }
    });

    // --- Анимации ---
    this.anims.create({
        key: 'horizontal-move',
        frames: this.anims.generateFrameNumbers('player', { start: 3, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'top-move',
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'down-move',
        frames: this.anims.generateFrameNumbers('player', { start: 7, end: 8 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'player', frame: 8 } ],
        frameRate: 20
    });

    // --- Объект для взаимодействия ---
    interactZone = this.matter.add.image(1000, 1000, 'construction', undefined, {
        isStatic: true
    });

    // --- Текст ---
    interactText = this.add.text(0, 0, 'Press X', {
        font: '18px Arial',
        fill: '#f5f542',
        stroke: '#000000',
        strokeThickness: 2,
    }).setVisible(false);

    victoryText = this.add.text(
        this.cameras.main.centerX, 
        this.cameras.main.centerY,
        'Победа', 
        {   
            stroke: '#000000',
            strokeThickness: 4,
            font: '64px Arial',
            fill: '#48f542',
        }
    )
    .setOrigin(0.5)  // Центрируем текст относительно его центра (а не левого верхнего угла)
    .setScrollFactor(0)  // Текст не двигается при скролле камеры
    .setVisible(false);
}

function update() {
    const speed = 3;
    let moving = false;

    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        player.setFlipX(true);
        player.anims.play('horizontal-move', true);
        moving = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        player.setFlipX(false);
        player.anims.play('horizontal-move', true);
        moving = true;
    } 
    else {
        player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        player.anims.play('top-move', true);
        moving = true;
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        player.anims.play('down-move', true);
        moving = true;
    } else {
        player.setVelocityY(0);
    }

    if (!moving) {
        player.anims.play('turn');
    }

    // Проверка на близость к объекту
    const dist = Phaser.Math.Distance.Between(player.x, player.y, interactZone.x, interactZone.y);
    if (dist < 100) {
        interactText.setVisible(true);
        interactText.setPosition(player.x - 20, player.y - 60);
    } else {
        interactText.setVisible(false);
    }
}
