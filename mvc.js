/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var MoveBy = 0;
var Controller = function () {
    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", function (event) {
            var direction = event.accelerationIncludingGravity.x;
            //if(direction > 0){
            MoveBy = direction.toFixed(0);
            if (MoveBy > 0) {
                PlayerModel.moveLeft();
            } else if (MoveBy < 0) {
                PlayerModel.moveRight();
            }
        });
    }
};

var View = {
    init: function () {
        alert("Welcome To Brick Breaker:\n\nBoxes Are 20 Points\n\nAbout The Controls:\n - Android Users: Tilt The Phone In The Direction\n\n - iPhone Users: Title The Phone In The Opposite Direction ;) ");
        this.canvas = document.getElementById('myCanvas');
        this.ctx = this.canvas.getContext('2d');
        View.ctx.beginPath();
        View.ctx.rect(0, 490, 800, 10);
        View.ctx.fillStyle = "#00000";
        View.ctx.fill();
        View.ctx.closePath();
        window.addEventListener("load", Controller);
        this.brickSetup();
        this.redraw();
        return;
    },

    redraw: function () {
        View.clear();
        View.drawBricks();
        PlayerModel.draw();
        BallModel.redraw();
        requestAnimationFrame(View.redraw);
    },

    clear: function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
    },
    
    completeRound : function(){
      if( ( (PlayerModel.score % 1040) === 0) 
              && (PlayerModel.round > 1) ){
          alert("Well Done!!");
          this.reset();
          PlayerModel.lives+=1;
          PlayerModel.round+=1;
          
      }  
    },

    playerDeath: function () {
        PlayerModel.lives -= 1;
        if (PlayerModel.lives < 1) {
            alert("Your Score Was: " + PlayerModel.score);
            this.reset();
            location.reload();
            //PlayerModel.pos.x = 335;
        } else {
            alert("Brick Breaker Says:\nYou Still Have " + PlayerModel.lives + " Lives Remaining");
            BallModel.reset();
            // PlayerModel.pos.x = 335;
        }
    },

    drawBricks: function () {
        this.bricks.forEach(function (brick) {
            brick.draw();
        });
    },

    brickSetup: function () {
        this.bricks = new Array();
        var i = 0, health = 1;
        var posX = 0, row = 1;
        for (var x = 0; x < 4; x++) {
            for (i = 0; i < 13; i++) {
                var brick = new Brick();
                brick.pos.x = (i * brick.size.width) + (0.5) * i;
                brick.pos.y = posX;
                brick.row = row;
                brick.health = health;
                this.bricks.push(brick);
            }
            posX += 30;
            row += 1;
        }
    },

    reset: function () {
        PlayerModel.reset();
        BallModel.reset();
        this.brickSetup();
    },

    bricks: []
};
var PlayerModel = {
    pos: {x: 335, y: 485},
    score: 0,
    lives: 3,
    round : 1,
    physics: {
        speed: 8 //set interval speed
    },
    size: {
        height: 15,
        width: 110
    },
    draw: function () {
        View.ctx.fillStyle = "rgb(255, 255, 255)";
        View.ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
        View.ctx.font = "3vw sans-serif";
        View.ctx.fillText("Round: " + this.round + "   Health: " + this.lives + "   Score: " + this.score, 5, 25);
    },
    moveLeft: function () {
        if (this.pos.x > 0) {
            this.pos.x -= this.physics.speed;
        }
    },
    moveRight: function () {
        if (this.pos.x < (View.canvas.width - this.size.width)) {
            this.pos.x += this.physics.speed;
        }
    },
    reset: function () {
        this.lives = 3;
        //this.score = 0;
        this.pos.x = 335;
    }
};


var BallModel = {
    pos: {x: 390, y: 480},
    size: {height: 15, width: 15},
    physics: {speed: 5},
    dir: {x: 1, y: -1},
    radius: {val: 7.5},
    bounds: {val: 1},

    draw: function () {
        View.ctx.beginPath();
        View.ctx.arc(this.pos.x, this.pos.y, (this.size.width / 2), 0, Math.PI * 2);
        View.ctx.fillStyle = "#FF00FF";
        View.ctx.fill();
        View.ctx.closePath();
    },

    reset: function () {
        this.pos.x = PlayerModel.pos.x + 10;
        this.pos.y = PlayerModel.pos.y - 5;
        if (MoveBy > 0) { //firing ball according to the paddles movement
            this.dir.x = -1;
        } else if (MoveBy < 0) {
            this.dir.x = 1;
        }

        this.dir.y = 1;
    },

    redraw: function () {
        this.hitWalls();
        this.hitPlayer();
        this.hitBricks();

        this.pos.x += (this.physics.speed * this.dir.x);
        this.pos.y += (this.physics.speed * this.dir.y);
        this.draw();
    },

    hitWalls: function () {
        if (this.pos.x <= 0)
            this.dir.x = 1;
        if (this.pos.x >= View.canvas.width)
            this.dir.x = -1;
        if (this.pos.y <= 0)
            this.dir.y = 1;
        if (this.pos.y >= View.canvas.height)
            View.playerDeath();
    },

    hitPlayer: function () {

        if (this.pos.y + this.radius.val < PlayerModel.pos.y) {
            return;
        }
        if (this.pos.y > PlayerModel.pos.y + PlayerModel.size.height) {
            return;
        }
        if (this.pos.x > PlayerModel.pos.x + PlayerModel.size.width) {
            return;
        }
        if (this.pos.x + this.radius.val < PlayerModel.pos.x) {
            return;
        }
        this.dir.y = -1;
    },

    hitBricks: function () {
        var i = 0;
        for (i = 0; i < View.bricks.length; i++)
        {
            var brick = View.bricks[i];

            if (this.pos.y + this.radius.val < brick.pos.y)
                continue;
            if (this.pos.y > brick.pos.y + brick.size.height)
                continue;
            if (this.pos.x > brick.pos.x + brick.size.width)
                continue;
            if (this.pos.x + this.radius.val < brick.pos.x)
                continue;

            if (this.dir.y < 0) {
                this.dir.y = 1;
            } else {
                this.dir.y = -1;
            }

            brick.health -= 1;
            PlayerModel.score += 20;

            if (brick.health < 1) {
                View.bricks.splice(i, 1);
            }
            if (this.dir.x === this.bounds.val
                    && this.dir.y === this.bounds.val)
            {
                if (this.pos.y > brick.pos.y)
                    this.dir.x = -(this.bounds.val);
                else
                    this.dir.y = -(this.bounds.val);
            } else if (this.dir.x === -(this.bounds.val)
                    && this.dir.y === (this.bounds.val))
            {
                if (this.pos.y > brick.pos.y)
                    this.dir.x = (this.bounds.val);
                else
                    this.dir.y = -(this.bounds.val);
            } else if (this.dir.x === (this.bounds.val)
                    && this.dir.y === -(this.bounds.val))
            {
                if (this.pos.y > brick.pos.y)
                    this.dir.x = (this.bounds.val);
                else
                    this.dir.y = -(this.bounds.val);
            } else if (this.dir.x === -(this.bounds.val)
                    && this.dir.y === -(this.bounds.val))
            {
                if (this.pos.y > brick.pos.y)
                    this.dir.x = (this.bounds.val);
                else
                    this.dir.y = -(this.bounds.val);
            }
        }
        View.completeRound();
    }
};

var Brick = function () {
    this.health = 1;
    this.row = 1;
    this.size = {
        height: 30,
        width: 60
    };
    this.pos = {
        x: 0,
        y: 0
    };
};

Brick.prototype.draw = function () {
    switch (this.row) {
        case 4:
            View.ctx.fillStyle = "rgb(255,255,102)";
            break;
        case 3:
            View.ctx.fillStyle = "rgb(124,252,0)";
            break;
        case 2:
            View.ctx.fillStyle = "rgb(0,191,255)";
            break;
        case 1:
            View.ctx.fillStyle = "rgb(250,128,114)";
            break;
    }
    View.ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
};
View.init();
