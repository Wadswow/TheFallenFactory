class Restart extends Phaser.Scene {
    constructor(){
        super('restartScene');
    }
    preload(){

    }
    create(){
        this.rKey = this.input.keyboard.addKey('R');
        this.scoreText = this.add.text(580, 100, 'Score: ' + this.registry.get('score'), {
            fontFamily: 'Arial',
            fontSize: '44px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.gemText = this.add.text(530, 220, 'Gem Count: ' + this.registry.get('gem') + '/8', {
            fontFamily: 'Arial',
            fontSize: '44px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        });
        this.add.text(250, 350, 'That was just the entrance,you think you can do more?\nFor now just get the rest of the items.\nPress R to restart the level', {
            align: 'center',
            fontSize: '28px',
            padding: {left: 10, right: 10}
        });

    }
    update(){
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.start('platformerScene');
        }
        
    }
}