
/**
 * a HUD container and child items
 */
 
game.HUD = game.HUD || {};
 
  
game.HUD.Container = me.ObjectContainer.extend({
 
    init: function() {
        // call the constructor
        this.parent();
         
        // persistent across level change
        this.isPersistent = true;
         
        // non collidable
        this.collidable = false;
         
        // make sure our object is always draw first
        this.z = Infinity;
 
        // give a name
        this.name = "HUD";
        // add our child score object at the right-bottom position
        this.addChild(new game.HUD.ScoreItem(0, 0));
    }
});
 
 
/** 
 * a basic HUD item to display score
 */
game.HUD.ScoreItem = me.Renderable.extend( {    
    /** 
     * constructor
     */
    init: function(x, y) {
         
        // call the parent constructor 
        // (size does not matter here)
        this.parent(new me.Vector2d(x, y), 0, 0); 
 

        this.font = new me.BitmapFont("32x32_font", 32);
        this.font.set("right");
         
        // local copy of the global score
        this.score = me.game.getEntityByName('mainPlayer')[0].life;

        this.frag = 0;
 
        // make sure we use screen coordinates
        this.floating = true;

    },
     
    /**
     * update function
     */
    update : function () {
        // we don't do anything fancy here, so just
        // return true if the score has been updated
        if (this.score != parseInt(me.game.getEntityByName('mainPlayer')[0].life) || this.frag != game.data.score) {
            this.score = parseInt(me.game.getEntityByName('mainPlayer')[0].life);
            this.frag = game.data.score;
            return true;
        }
        return false;
    },
 
    /**
     * draw the score
     */
    draw : function (context) {
        this.font.draw(context, game.data.score, 780, 12);
        
        // draw it baby !
        for (var n = 0; n < this.score; n++) {
        	context.drawImage(me.loader.getImage('life'), 6 + n * 40, 6);
        }
        if (me.game.getEntityByName('mainPlayer')[0].hasKey) {
            context.drawImage(me.loader.getImage('key'), 160, 12);
            this.font.draw(context, 'REACH THE DOOR !', 665, 120);
        }
    }
 
});
