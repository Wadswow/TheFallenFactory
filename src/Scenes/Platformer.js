class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        //set up initial varibles to be used around the code.
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
        //preload the pluggins that could not be added in the load scene
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        this.load.audio('coin_collect', './assets/Audio/coin.wav');
    }

    create() {
        //make the map along with it's animated tiles
        this.map = this.add.tilemap("base_plat", 16, 16, 150, 20);
        this.animatedTiles.init(this.map);

        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap");

        //Set up layers and create collisions with said layers
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

        //set up collectables, first making them, they making them none-moving, then add them to a group.
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
        
        //set-up the player character along with all of it's colliders
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

        //setting up particles effects
        
        my.vfx.walking = this.add.particles(0, 0, "particles", {
            frame: ["smoke_01.png", "smoke_02.png", "smoke_03.png"],
            random: true,
            scale: {start: 0.03, end: 0.02},
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        
        my.vfx.jump = this.add.particles(0, 0, "particles", {
            frame: ["muzzle_01.png", "muzzle_02.png", "muzzle_03.png", "muzzle_04.png", "muzzle_05.png"],
            scale: 0.06,
            duration: 10,
            alpha: {start: 1, end: 0.1}
        });
        
        my.vfx.jump.stop();

        //what happens when a collision with a collectable happens, add to score, present text, play sound
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();        
            this.SCORE += 10;
            this.addScoreText('Score: ' + this.SCORE, my.sprite.player.x, my.sprite.player.y);
            this.collectAnim(obj2.x, obj2.y);
            this.sound.play("coin_collect", {
                volume: 0.5
            });
        });
        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            obj2.destroy();
            this.SCORE += 50;
            this.GEM += 1;
            this.addScoreText('Gem Count: ' + this.GEM + '/8', my.sprite.player.x, my.sprite.player.y);
            this.time.delayedCall(300, () => {
                this.addScoreText('Score: ' + this.SCORE, my.sprite.player.x, my.sprite.player.y);
            });
            this.collectAnim(obj2.x, obj2.y);
            this.sound.play("coin_collect", {
                volume: 0.5
            });
        });

        //set up the cursors for movement and D key for diagnostic
        cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        //Camera features
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

    }
    //function to call to make the special floating text when a collectable is collected
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
    //this is to create the animation for collecting an item.
    collectAnim(x, y){
        this.anims.create({
            key: 'collect',
            frames: this.anims.generateFrameNames('particles', {
                frames: ['star_04.png', 'star_05.png', 'star_06.png', 'star_09.png']
            }),
            frameRate: 8,
            repeat: -1,
        });
        let sparkle = this.add.sprite(x, y, 'particles').setScale(0.06);
        sparkle.play('collect');
        this.tweens.add({
            targets: sparkle,
            alpha: 0,
            duration: 2000,
            onComplete: () => sparkle.destroy()
        });

    }

    update() {
        //set-up the left, right, and stop movement with its respective variables along with animation and particles.
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

        //set up jumping for the character while it is touch the ground.
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y-3);
            my.vfx.jump.start();
        }
        //set-up wall jumping detecting the player is blocked by a wall and then allowing them to jump still along with a push off the wall feature 
        // (although somewhat hard to pull off initially)
        if(my.sprite.player.body.blocked.left && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y-3);
            my.vfx.jump.start();
            if (cursors.right.isDown){
                my.sprite.player.body.setVelocityX(this.WALL_JUMP);
            }
        }
        if(my.sprite.player.body.blocked.right && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.jump.setPosition(my.sprite.player.x, my.sprite.player.y-3);
            my.vfx.jump.start();
            if (cursors.left.isDown){
                my.sprite.player.body.setVelocityX(-this.WALL_JUMP);
            }
        }
        //player death caused to hitting the bottom of the world.
        if (my.sprite.player.y >= 320){
            this.scene.restart();
        }
    }
}