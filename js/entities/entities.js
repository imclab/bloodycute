/*------------------- 
a player entity
-------------------------------- */
game.PlayerEntity = me.ObjectEntity.extend({

    hasKey: false,
    isAttacking: false,
    life: 3,
 
    /* -----
 
    constructor
 
    ------ */
 
    init: function(x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);

        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(4, 15);

        // adjust the bounding box
        this.updateColRect(8, 48, -1, 0);
 
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

        setTimeout(function() {
            me.game.monsterCreation = setInterval(function() {
            var settingsCopy = settings.constructor();
            for (var attr in settings) {
                if (settings.hasOwnProperty(attr)) settingsCopy[attr] = settings[attr];
            }
            var initX = Math.random() < 0.5 || game.data.level == 1 ? 30 : 1000;
            var enemy = new game.EnemyEntity(initX, 50, settings);
            me.game.add(enemy, 100);
        }, 1500);
        }, 500); 
    },
 
    /* -----
 
    update the player pos
 
    ------ */
    update: function() {
        if (me.input.isKeyPressed('left') || me.game.goLeft) {
            // flip the sprite on horizontal axis
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right') || me.game.goRight) {
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else {
            this.vel.x = 0;
        }
        if (me.input.isKeyPressed('jump') || me.game.jump) {
            me.game.jump = false;
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
            }
        }

        if (!this.renderable.flickering && !this.isAttacking && (me.input.isKeyPressed('attack') || me.game.attack)) {
            me.game.attack = false;
            this.isAttacking = true;
            me.game.getEntityByName('slash')[0].n = 0;
            me.game.getEntityByName('slash')[0].pos= {x: this.pos.x + 75 * (this.lastflipX ? -1.2 : 1), y: this.pos.y};
            me.game.getEntityByName('slash')[0].visible = true;
        }
 
        // check & update player movement
        this.updateMovement();

        // check for collision
        var res = me.game.collide(this);

        if (res) {
            // if we collide with an enemy
            if (res.obj.type == me.game.ENEMY_OBJECT) {
                this.renderable.flicker(30);                
            } else if (res.obj.name == 'door' && this.hasKey) {
                this.hasKey = !this.hasKey;
                game.data.level++;
                if (game.data.level > game.data.nbLevel) {
                    me.state.change(me.state.GAME_END);
                } else {
                    me.state.change(me.state.PLAY);
                }
                clearInterval(me.game.monsterCreation);
            }
        }
     
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }

 
});



/*----------------
 a Key entity
------------------------ */
game.KeyEntity = me.CollectableEntity.extend({

    isKeyVisible: false,

    // extending the init function is not mandatory
    // unless you need to add some extra initialization
    init: function(x, y, settings) {

        // call the parent constructor
        this.parent(x, y, settings);

    },
 
    // this function is called by the engine, when
    // an object is touched by something (here collected)
    onCollision: function() {
        // do something when collected
 
        // make sure it cannot be collected "again"
        this.collidable = false;

        me.audio.play("key");
        me.game.getEntityByName('mainPlayer')[0].hasKey = true;
        game.data.score+= 100;

        // remove it
        me.game.remove(this);
    },

    update: function() {
        this.visible = this.isKeyVisible;
        if (me.timer.getTime() % 60 == 0) {
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -10 * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
            }
        }

         this.updateMovement();

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }
         
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }
 
});


game.SlashAnimation = me.ObjectEntity.extend({

    n : 0,

    init: function(x, y, settings) {  
 
        // call the parent constructor
        this.parent(x, y, settings);

        this.visible = false;

        // make it collidable
        this.collidable = true;
    },

    update: function() {
        if (this.n == 0) {
            this.collisionBox.pos = this.pos;
            this.renderable.offset.x = 0;
        }
        this.n++;
        this.renderable.offset.x += 80;
        if (this.n >= 6) {
            me.game.getEntityByName('mainPlayer')[0].isAttacking = false;
            this.visible = false;
        }

        var res = me.game.collide(this);
        // if collide with an enemy
        if (res && res.obj.type == me.game.ENEMY_OBJECT) {
            game.data.score+= 10;
            me.audio.play("so_chainsaw");
            var bloodSprite = new game.BloodAnimation(res.obj.pos.x, res.obj.pos.y, me.loader.getImage('blood'), 80, 80);
            me.game.add(bloodSprite, 1000);
            me.game.remove(res.obj);
        } 

        return true;
    }

});

game.BloodAnimation = me.SpriteObject.extend({

     n : 0,

    update: function() {
        this.n++;
        this.offset.x += 80;
        if (this.n > 4) {
            me.game.remove(this);
            // show the key
            if (me.game.getEntityByName('key')[0] != null && !me.game.getEntityByName('key')[0].visible && Math.random() < 0.2) {
                if (me.game.getEntityByName('key').length > 0) {
                    me.game.getEntityByName('key')[0].visible = true;
                    me.game.getEntityByName('key')[0].isKeyVisible = true;
                    me.game.getEntityByName('key')[0].pos.x = this.pos.x;
                }
            }
        }
    }
});

game.DoorEntity = me.ObjectEntity.extend({
});

game.TeleportEntity = me.ObjectEntity.extend({

     init: function(x, y, settings) {  
 
        // call the parent constructor
        this.parent(x, y, settings);

        // make it collidable
        this.collidable = true;
    },

    update: function() {
        this.alpha = Math.random();

        var res = me.game.collide(this);
        // if we collide with an enemy
        if (res && res.obj.type == me.game.ENEMY_OBJECT) {
            res.obj.vel.y = -100;
            if (!res.obj.chibron) {
                me.audio.play("teleport");
                res.obj.chibron = true;
                me.game.getEntityByName('mainPlayer')[0].life--;
                setTimeout(function() {
                    me.game.remove(res.obj);
                }, 300);
                if (me.game.getEntityByName('mainPlayer')[0].life <= 0) {
                    me.state.change(me.state.GAMEOVER);
                    clearInterval(me.game.monsterCreation);
                }
            }
        } 

        return true;
    }
});

/* --------------------------
an enemy Entity
------------------------ */
game.EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        var n = parseInt(2 + 3 * Math.random());
        settings.image = "character" + n;
        settings.spritewidth = 64;
 
        // call the parent constructor
        this.parent(x, y, settings);
 
        this.startX = x;
        this.endX = me.game.getEntityByName('teleport')[0].pos.x;
        this.walkLeft = this.startX > this.endX;
  
        // walking & jumping speed
        this.setVelocity(Math.random() <  0.3 ? 5 : 3, 20);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;

        this.alwaysUpdate = true;
    },
 
    // manage the enemy movement
    update: function() {
        if (this.walkLeft && this.pos.x < this.endX) {
            this.walkLeft = false;
        } else if (!this.walkLeft && this.pos.x > this.endX) {
            this.walkLeft = true;
        }
        // make it walk
        this.flipX(this.walkLeft);
        this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;     

        if (Math.random() < 0.025) {
            // make sure we are not already jumping or falling
            if (!this.jumping && !this.falling) {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.vel.y = -this.maxVel.y * me.timer.tick;
                // set the jumping flag
                this.jumping = true;
            }
        }

        // check and update movement
        this.updateMovement();
         
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent();
            return true;
        }
        return false;
    }
});


