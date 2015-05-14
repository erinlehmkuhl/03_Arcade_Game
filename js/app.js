var oneBlockVert = 84;
var oneBlockHorz = 100;
var leftEdge = 5;
var rightEdge = 405;
var topEdge = -11;
var bottomEdge = 409;
var levels = [1];
var speedList = [];

// Enemies our player must avoid
var Enemy = function(enemySpeed) {
    allEnemiesInt.push(enemySpeed);
    this.randomEnemyStartLoc = Math.floor(Math.random()*500) + 1;
    this.sprite = 'images/enemy-bug.png';
    this.enemySpeed = enemySpeed/(605/100);
    this.x = this.randomEnemyStartLoc;
    this.restartRun = -100;
    this.enemyFirstRow = 60;
    this.y = assignedRow.call(this);
};


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
Enemy.prototype.update = function(dt) {
    this.x = (this.x + (this.enemySpeed * levels.length));
    this.randomLag = Math.random()*5000;
    if (this.x > 505 + this.randomLag){
        this.x = this.restartRun;
    }
    //bounding box information
    this.boxX = this.x + 15; 
    this.boxY = this.y + 80;
    this.boxW = 70;
    this.boxH = 60;
};


//assign each enemy a y coordinate, gets run upon create of the instance
var assignedRow = function(){
    var firstRow = 228;
    var rows = [firstRow, 
                firstRow-oneBlockVert, 
                firstRow-(oneBlockVert*2), 
                firstRow+oneBlockVert];
    var indexEnemy = allEnemiesInt.length-1;
    this.y = rows[indexEnemy];
    return this.y;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    /*test bounding box for player
    *ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    *ctx.stroke();
    */
}

// player class and functions
var Player = function() {
    this.sprite = 'images/char-horn-girl.png';
    this.restartX = 205;
    this.restartY = 409;
    this.x = this.restartX;
    this.y = this.restartY;
    this.scoreList = [];
}

Player.prototype.update = function(dt) {
    //bounding box information
    this.boxX = this.x + 14; 
    this.boxY = this.y + 63;
    this.boxW = 72;
    this.boxH = 75;
    //run collision function
    collision(player, bug);
    collision(player, bug2);
    collision(player, bug3);
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    /*test bounding box for player
    *ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    *ctx.stroke();
    */
}

//move player based on key input
//stops player when they run into a wall
Player.prototype.handleInput = function(buttonPress) {
    if (buttonPress === "left"){
        this.x = this.x - oneBlockHorz;
        if (this.x < leftEdge){
            this.x = leftEdge;
        }
    }else if (buttonPress === "right"){
        this.x = this.x + oneBlockHorz;
        if (this.x > rightEdge){
            this.x = rightEdge;
        }
    }else if (buttonPress === "up"){
        this.y = this.y - oneBlockVert;
        if (this.y < topEdge){
            this.y = this.restartY;
            this.x = this.restartX;
            //alert("level up!");
            this.scoreList.push(1);
            player.score(this.scoreList.length);
        }
    }else if (buttonPress === "down"){
        this.y = this.y + oneBlockVert;
        if (this.y > bottomEdge){
          this.y = bottomEdge;
        }
    }
}


//gather score, print score
//gather levels, print levels
//increment speed via levels array
//randomized speed per level
Player.prototype.score = function(score){
    $("#score").find("span").text(score);
    randomizeSpeed();
        if (this.scoreList.length %3 === 0){
            levels.push(this.scoreList[-1]);
                if (collide == false){
                    alert("new level");
                    $("#level").find("span").text(levels.length);
                }else if (collide == true){
                    alert("waa waa");
                    collide = false;
                }
        }
}

//I would like this to be the same as allEnemies but it needs to be an integer
var allEnemiesInt = [];
var occupiedRows = [];


//create variable speeds for the bugs per round
var randomizeSpeed = function(){
    var howManyEnemies = [1, 2, 3];
        for (enemy in howManyEnemies){
            var speed = Math.floor(Math.random() * 25) + 5;
            speedList.unshift(speed);
            //check speed of enemies
            console.log(speedList);
        }
}
randomizeSpeed();

//instantiate enemies objects.
var bug = new Enemy(speedList[0]);
var bug2 = new Enemy(speedList[1]);
var bug3 = new Enemy(speedList[2]);


// Place all enemy objects in an array called allEnemies- I would like this to fill automatically 
var allEnemies = [bug, bug2, bug3];

// Place the player object in a variable called player
var player = new Player();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

var collide = false;
var collision = function(player, enemy){
    //console.log(enemy.boxX + " " + player.boxX);
    if (enemy.boxX < player.boxX + player.boxW &&
        enemy.boxX + enemy.boxW > player.boxX &&
        enemy.boxY < player.boxY + player.boxH &&
        enemy.boxH + enemy.boxY > player.boxY) {
        // collision detected!
        collide = true;
        //restart player position
        player.x = player.restartX;
        player.y = player.restartY;
        //clear score
        player.scoreList = [];
        player.score(player.scoreList.length);
        //clear levels
        levels = [1];
        $("#level").find("span").text(levels.length);
    }
}
//TODO: declaring random speed while instantiating solidifies random pattern for game
    //move random to update
    //make random independent from speed up/level up
    //make certain water passages acceptable to end in
     
