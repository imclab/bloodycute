
/* Game namespace */
var game = {

	/** 
     * an object where to store game global data
     */
    data : {
        // score
        score : 0,
        level : 1,
        nbLevel : 4
    },
	
	// Run on page load.
	"onload" : function () {
	// Initialize the video.
	if (!me.video.init("screen", 800, 480, true, 'auto')) {
		alert("Your browser does not support HTML5 canvas.");
		return;
	}

	// add "#debug" to the URL to enable the debug Panel
	if (document.location.hash === "#debug") {
		window.onReady(function () {
			me.plugin.register.defer(debugPanel, "debug");
		});
	}

	// Initialize the audio.
	me.audio.init("mp3,ogg");

	// Set a callback to run when loading is complete.
	me.loader.onload = this.loaded.bind(this);

	// Load the resources.
	me.loader.preload(game.resources);

	// Initialize melonJS and display a loading screen.
	me.state.change(me.state.LOADING);

	me.game.goLeft = false;
	me.game.goRight = false;
	me.game.jump = false;
	me.game.attack = false;
},

	// Run on game resources loaded.
	"loaded" : function () {
		me.state.set(me.state.MENU, new game.TitleScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());
		me.state.set(me.state.GAME_END, new game.VictoryScreen());
		me.state.set(me.state.GAMEOVER, new game.DefeatScreen());

		// set a global fading transition for the screen
    	me.state.transition("fade", "#000000", 300);

		// add our player entity in the entity pool
	   me.entityPool.add("mainPlayer", game.PlayerEntity);
	   me.entityPool.add("EnemyEntity", game.EnemyEntity);
	   me.entityPool.add("key", game.KeyEntity);
 	   me.entityPool.add("door", game.DoorEntity);
	   me.entityPool.add("teleport", game.TeleportEntity);
 	   me.entityPool.add("slash", game.SlashAnimation);

		// enable the keyboard
		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP, "jump", true);
		me.input.bindKey(me.input.KEY.SPACE, "attack", true);

		// Start the game.
		me.state.change(me.state.MENU);
		me.audio.playTrack("ms_main_theme");

		if (Modernizr.touch) {
			GameController.init( { 
			    left: {
			        dpad: {
			        	up :{
					        touchMove: function() {
				        		me.game.jump = true;
					        }
					    },
				        right :{
					        touchMove: function() {
				        		me.game.goRight = true;
				        		me.game.goLeft = false;
				        	},
				        	touchEnd: function() {
				        		me.game.goRight = false;
				        		me.game.goLeft = false;
				        	}
			        	},
				        left :{
					        touchMove: function() {
				        		me.game.goRight = false;
					        		me.game.goLeft = true;
				        	},
				        	touchEnd: function() {
				        		me.game.goRight = false;
				        		me.game.goLeft = false;
				        	}
				        }
				    }
			    }, 
			    right: { 
			        position: { 
			            right: '5%' 
			        }, 
			        type: 'buttons', 
			        buttons: [
			        { 
			            label: 'Attack', fontSize: 11, touchStart: function() {
			            	if (me.state.current().scroller != null) {
	            				me.state.change(me.state.PLAY);
			            	} else {
			                	me.game.attack = true;
			            	}
			            } 
			        }, 
			        false, false, false
			        ] 
			    }
			});
		}
	}
};
