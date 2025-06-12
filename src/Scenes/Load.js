class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        //load in the character
        this.load.spritesheet("character", "Tilemap/monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        //load in the tilemap along with all the level maps
        this.load.image("tilemap", "Tilemap/monochrome_tilemap_packed.png");
        this.load.tilemapTiledJSON("base_plat", "Levelmaps/base_plat.tmj");

        this.load.spritesheet("tilemap_sheet", "Tilemap/monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        //load in particles
        this.load.multiatlas("particles", "kenny-particles.json");
    }

    create() {
        //create the animations for the character and then move to the actual scene
        this.anims.create({
            key: 'walk',
            frames: [{key: 'character', frame: 241},{key: 'character', frame: 243}],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                {key: 'character', frame: 240}
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                {key: 'character', frame: 242}
            ],
        });

         this.scene.start("platformerScene");
    }

    update() {
    }
}