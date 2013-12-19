/*----------------------
 
    A title screen
 
  ----------------------*/
 
game.DefeatScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        // title screen image
        this.image = null;
        this.smallfont = null;
        this.bigfont = null;
        this.pressToPlayFont = null;
        this.scrollertween = null;
        this.scaling = null;
 
        this.scroller = "FAILURE IS THE START OF SUCCESS... OR NOT                         ";
        this.scrollerpos = 600;
        this.scale = 1.0;

    },
 
    // reset function
    onResetEvent: function() {
        if (this.image == null) {
            // init stuff if not yet done
            this.image = me.loader.getImage("titlescreen");
            // font to display the menu items
            this.smallfont = new me.BitmapFont("16x16_font", 16);
            this.smallfont.set('center', 1.0);
            this.bigfont = new me.BitmapFont("32x32_font", 32);
            this.pressToPlayFont = new me.BitmapFont("32x32_font", 32);
            this.pressToPlayFont.set('center', 1.0);

        }
 
        // reset to default value
        this.scrollerpos = 640;
        this.scale = 1.0;
 
        // a tween to animate the arrow
        this.scrollertween = new me.Tween(this).to({
            scrollerpos: -2200
        }, 10000).onComplete(this.scrollover.bind(this)).start();
 
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);

        // reset the score
        game.data.score = 0;
        game.data.level = 1;
    },
 
    // some callback for the tween objects
    scrollover: function() {
        // reset to default value
        this.scrollerpos = 640;
        this.scrollertween.to({
            scrollerpos: -2200
        }, 10000).onComplete(this.scrollover.bind(this)).start();

    },
 
    // update function
    update: function() {
        // enter pressed ?
        if (me.input.isKeyPressed('enter')) {
            me.audio.play("main_button");
            me.state.change(me.state.PLAY);
        }

        return true;
    },
 
    // draw function
    draw: function(context) {
        context.drawImage(this.image, 0, 0);
        this.bigfont.draw(context, "DEFEAT...", 280, 60);
        this.smallfont.draw(context, "CUTE WORLD HAS BEEN INVADED\n\nBY DEMONIC ALIEN TROLLS...", 400, 150);
        this.smallfont.draw(context, (Modernizr.touch ? "TAP ATTACK TO PLAY AGAIN" : "PRESS ENTER TO PLAY AGAIN"), 400, 310);
        this.pressToPlayFont.resize(this.scale);
        this.bigfont.draw(context, this.scroller, this.scrollerpos, 425);
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
 
        //just in case
        this.scrollertween.stop();
    }
 
});