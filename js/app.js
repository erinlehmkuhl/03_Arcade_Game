//-------------------------------- GLOBAL VARIABLES-----------------------------------
var oneBlockVert = 84;
var oneBlockHorz = 100;
var leftEdge = 5;
var rightEdge = 405;
var topEdge = -11;
var bottomEdge = 409;

var levels = [1];
var scoreList = [];
var curScore = scoreList.length;
var collide = false;

var occupiedRows = [];//to place bugs
var allEnemies = [];//used in engine.js & to assign placement in rows

//-------------------------------- ENEMIES-----------------------------------
//create variable speeds for the bugs per round
var randomizeSpeed = function(){
    for (enemy in allEnemies) {
        allEnemies[enemy].speedRandom = Math.floor(Math.random() * 50) + 5;
    }
}


// Enemies our player must avoid
var Enemy = function() {
    this.randEnemyStartLoc = Math.floor(Math.random()*370) + 1;//inital start spot bewteen 1-605
    this.x = this.randEnemyStartLoc;
    this.sprite = 'images/enemy-bug.png';
    this.enemySpeed = .05;
    this.restartRun = -100;
    this.enemyFirstRow = 60;
    this.y = assignedRow.call(this);
};


//TODO: multipl by dt
// Update the enemy's position
Enemy.prototype.update = function(dt) {
    //set initial speed and every scored point gets a new random multiplier per
    this.x = (this.x + (this.enemySpeed * this.speedRandom) + levels.length);
    //console.log(this.speedRandom);

    //randomize re-entry time
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


//assign each enemy a y coordinate, gets run upon creation of the instance
var assignedRow = function(){
    var firstRow = 228;
    var rows = [firstRow, 
                firstRow-oneBlockVert, 
                firstRow-(oneBlockVert*2), 
                firstRow+oneBlockVert];
    var indexEnemy = allEnemies.length % 3;
    occupiedRows.push(rows[indexEnemy]);
    //if (rows[indexEnemy] in occupiedRows)//-------------------- working on no overlap
    //    console.log("in there");        //-------------------- working on no overlap
    this.y = rows[indexEnemy];
    return this.y;
};


// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    //test bounding box for player
    //ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    //ctx.stroke();
    
}

//-------------------------------- PLAYER-----------------------------------
// player class and functions
var Player = function() {
    this.sprite = 'images/char-horn-girl.png';
    this.restartX = 205;
    this.restartY = 409;
    this.x = this.restartX;
    this.y = this.restartY;
}


Player.prototype.update = function(dt) {
    //bounding box information
    this.boxX = this.x + 14; 
    this.boxY = this.y + 63;
    this.boxW = 72;
    this.boxH = 75;
    //console.log(this.y);

    //run collision function
    allEnemies.forEach(function(enemy){
        collision(player, enemy);
    })
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
        if (this.y < topEdge){// A LOT OF STUFF HAPPENS HERE:
            this.lastScore = scoreList.length; // this is for random speed of bugs
            scoreList.push(1);// add one to the score depot
            this.curScore = scoreList.length;
            player.score(this.curScore);//call the scoring/leveling --> read on below 
        }
    }else if (buttonPress === "down"){
        this.y = this.y + oneBlockVert;
        if (this.y > bottomEdge){
          this.y = bottomEdge;
        }
    }
}

//-------------------------------- GAME PLAY STUFF-----------------------------------

//This is called when the player gets to the top of the screen
Player.prototype.score = function(curScore){
    this.y = this.restartY; //reset player's position
    this.x = this.restartX;
    $("#score").find("span").text(curScore);//write the score in html

    //instructions for leveling up every third point
    if (curScore %3 === 0){
        levels.push(scoreList[-1]);//add one to the levels list, which also adds speed
        if (collide == false){
            createBugs(1);
            randomizeSpeed();//randomizes the speed of the bugs
            alert("new level");
            $("#level").find("span").text(levels.length);//write level in html

        }else if (collide == true){
            //stuff happens in the collide function to keep it global
            alert("waa waa");
            collide = false;
        }
    }
}


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
        scoreList = [];
        player.score(curScore);
        //clear levels
        levels = [1];
        $("#level").find("span").text(levels.length);
        //keep one bug, throw the rest away
        allEnemies.splice(0, allEnemies.length-1);
    }
}

//make lots of bugs.
var createBugs = function(howMany){
    var i = 0;
    while (i < howMany){
        i++;
        allEnemies.push(new Enemy());
    }
};



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


//-------------------------------- START IT UP -----------------------------------

//instantiate enemies objects
createBugs(1);

//run once to get inital speedRandom numbers for instantiation
randomizeSpeed();

//instantiate player object
var player = new Player();

//TODO: declaring random speed while instantiating solidifies random pattern for game
    //move random to handler so it updates every point tick
    //make random independent from speed up/level up
    //make certain water passages acceptable to end in

