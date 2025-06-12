class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        this.ACCELERATION = 150;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -300;
        this.WALL_JUMP = 200
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.SCORE = 0;
        this.GEM = 0;
    }

    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('coin_collect', './assets/Audio/coin.wav');
    }

    create() {
        this.map = this.add.tilemap("base_plat", 16, 16, 150, 20);
        this.animatedTiles.init(this.map);

        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap");

        this.groundLayer = this.map.createLayer("Ground-Layer", this.tileset, 0, 0);
        this.backgroundLayer = this.map.createLayer("Background-Stuff", this.tileset, 0, 0);
        this.trapLayer = this.map.createLayer("Traps", this.tileset, 0, 0);
        this.exitLayer = this.map.createLayer("Exit", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.exitLayer.setCollisionByProperty({
            exit: true
        });

        this.trapLayer.setCollisionByProperty({
            kill: true
        });

        this.coins = this.map.createFromObjects("Coin", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 2
        });
        this.gems = this.map.createFromObjects("Gem", {
            name: "gem",
            key: "tilemap_sheet",
            frame: 82
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.coins);
        this.gemGroup = this.add.group(this.gems);
        
        my.sprite.player = this.physics.add.sprite(125, 200, "character", 250);
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels+16);

        this.physics.add.collider(my.sprite.player, this.groundLayer);

        this.physics.add.collider(my.sprite.player, this.exitLayer, () => {
            this.registry.set('score', this.SCORE);
            this.registry.set('gem', this.GEM);
            this.scene.start('restartScene');
        });

        this.physics.add.collider(my.sprite.player, this.trapLayer, () => {
            this.scene.restart();
        });

        my.vfx.collect = this.add.particles(0, 0, "particles", {
            frame: ['star_01.png', 'star_02.png', 'star_03.png'],
            duration: 10,
            frequency: 5,
            alpha: {start: 1, end: 0.1},
            scale: {start: 0.06, end: 0.07}
        });

        my.vfx.collect.stop();

        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            my.vfx.collect.setPosition(obj2.x, obj2.y);
            obj2.destroy();        
            this.SCORE += 10;
            this.addScoreText('Score: ' + this.SCORE, my.sprite.player.x, my.sprite.player.y);
            my.vfx.collect.start();
            this.sound.play("coin_collect", {
                volume: 0.5
            });
        });
        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            my.vfx.collect.setPosition(obj2.x, obj2.y);
            obj2.destroy();
            this.SCORE += 50;
            this.GEM += 1;
            this.addScoreText('Gem Count: ' + this.GEM + '/8', my.sprite.player.x, my.sprite.player.y);
            this.time.delayedCall(300, () => {
                this.addScoreText('Score: ' + this.SCORE, my.sprite.player.x, my.sprite.player.y);
            });
            my.vfx.collect.start();
            this.sound.play("coin_collect", {
                volume: 0.5
            });
        });

        cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "particles", {
            frame: ["smoke_01.png", "smoke_02.png", "smoke_03.png"],
            random: true,
            scale: {start: 0.03, end: 0.02},
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -200,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        
        my.vfx.jump = this.add.particles(0, 0, "particles", {
            frame: ["muzzle_01.png", "muzzle_02.png", "muzzle_05.png"],
            scale: {start: 0.06, end: 0.02},
            duration: 10,
            alpha: {start: 1, end: 0.1}
        });
        
        my.vfx.jump.stop();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

    }
    addScoreText(text, x, y){
        const Anitext = this.add.text(x, y, text, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.tweens.add({
            targets: Anitext,
            y: y - 15,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                Anitext.destroy();
            }
        })
    }

    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-16, my.sprite.player.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y);
            my.vfx.jump.start();
        }
        if(my.sprite.player.body.blocked.left && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y);
            my.vfx.jump.start();
            if (cursors.right.isDown){
                my.sprite.player.body.setVelocityX(this.WALL_JUMP);
            }
        }
        if(my.sprite.player.body.blocked.right && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y);
            my.vfx.jump.start();
            if (cursors.left.isDown){
                my.sprite.player.body.setVelocityX(-this.WALL_JUMP);
            }
        }
        if (my.sprite.player.y >= 320){
            this.scene.restart();
        }
    }
}