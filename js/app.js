//-------------------------------- GLOBAL VARIABLES-----------------------------------
var oneBlockVert = 84;
var oneBlockHorz = 100;
var leftEdge = 5;
var rightEdge = 405;
var topEdge = -11;
var bottomEdge = 409;

var levels = [1];
var spriteLevelStar = 'images/StarSmall.png';
var spriteRock = 'images/Rock.png';
var scoreList = [];
var curScore = scoreList.length;
var collide = false;

var occupiedRows = [];//to place bugs
var allEnemies = [];//used in engine.js & to assign placement in rows
var enemySpeed = .05;
var speedList = [];
var gameOver = false;

var drawGem = true;//initialize gem on the board
var gemList = [];//to hold your gems
var gemSpriteList = ['images/gemBlue.png', 'images/gemOrange.png', 'images/gemGreen.png'];
var gemSize = 55;
var bonusSpeed = 0;

var lives = 3;
//-------------------------------- ENEMIES-----------------------------------
//create variable speeds for the bugs per round
var randomizeSpeed = function(){
    speedList = [];
    for (enemy in allEnemies) {
        //make a this.speedRandom attribute for update() to use in this.x
        allEnemies[enemy].speedRandom = Math.floor(Math.random() * 50) + 5;
        speedList.push(allEnemies[enemy].speedRandom);
    }
}

// Enemies our player must avoid
var Enemy = function() {
    this.randEnemyStartLoc = Math.floor(Math.random()*370) + 1;//inital start spot bewteen 1-605
    this.x = this.randEnemyStartLoc;
    this.sprite = 'images/enemy-bug.png';
    this.restartRun = -100;
    this.y = assignedRow.call(this);
};


//TODO: multipl by dt
// Update the enemy's position
Enemy.prototype.update = function(dt) {
    //if a row is already filled with a bug, set speed to first bug's speed
    if (occupiedRows[this.whichRow]) {
        this.x = (this.x + (enemySpeed * speedList[this.whichRow]) + levels.length - bonusSpeed);
    }else{//set initial speed
        this.x = (this.x + (enemySpeed * this.speedRandom) + levels.length - bonusSpeed);
    }

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
                firstRow-(oneBlockVert * 2)];
    this.whichRow = allEnemies.length % 3; // so they only occupy three rows
    this.y = rows[this.whichRow];// rows are assigned 0, 1 & 2
    occupiedRows.push(this.y);//assign same speed per row in update().

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
    this.princessSprite = 'images/char-princess-girl.png';
    this.restartX = 205;
    this.restartY = 409;
    this.x = this.restartX;
    this.y = this.restartY;
    this.waterSlots = [0, oneBlockHorz, oneBlockHorz*2, oneBlockHorz*3, oneBlockHorz*4]
}


Player.prototype.moveRock = function(){
    this.blocked = this.waterSlots[parseInt(Math.random()*5)];//rock in water
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

    gem.pickup();
}


Player.prototype.render = function() {
    //draw character
    if (gameOver == false){
       ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }else{
        ctx.drawImage(Resources.get(this.princessSprite), this.x, this.y);

    }

    /*test bounding box for player
    *ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    *ctx.stroke();
    */

    //draw stars representing each level
    var nextStar = 0;
    for (level in levels){
        ctx.drawImage(Resources.get(spriteLevelStar), 0 + nextStar, 415);
        nextStar = nextStar + oneBlockHorz/2;
    }

    //draw rocks in water
    ctx.drawImage(Resources.get(spriteRock), this.blocked, -22);
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
        //if there are rocks in the water
        if (this.x - 5 == this.blocked && this.y < oneBlockVert*2){
            //keep character one row back from the water
            this.y = oneBlockVert - 11;
        }else{
            //advance noramlly
            this.y = this.y - oneBlockVert;
        }    
        if (this.y < topEdge){// A LOT OF STUFF HAPPENS HERE:
            this.lastScore = scoreList.length; // this is for random speed of bugs
            scoreList.push(1);// add one to the score depot
            this.curScore = scoreList.length;
            gem.random();
            drawGem = true;
            player.score(this.curScore);//call the scoring/leveling --> read on below 
        }
    }else if (buttonPress === "down"){
        this.y = this.y + oneBlockVert;
        if (this.y > bottomEdge){
          this.y = bottomEdge;
        }
    }
}


//----------------------------------- GEMS --------------------------------------

var Gem = function(){
    this.random();
}


Gem.prototype.render = function() {
    if (drawGem === false){//if you are currently not drawing the gem b/c you picked it up
        //don't draw the gem on the board
    }else{
        //draw it
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

Gem.prototype.renderBar = function(){
    var nextGem = 0;
    for (i in gemList){
        ctxGems.drawImage(Resources.get(gemList[i]), (-22 + nextGem), -55);//
        nextGem = nextGem + gemSize;
    }
}


Gem.prototype.pickup = function(){//gets called in player.update()
    //make gems disappear
    if (player.x -5  == this.x //the gem and the player collide in x
        && player.y+11 == this.y //the gem and the player collide in y
        && drawGem == true){// will stop the loop so gemList just gets one addition
        
        drawGem = false;//don't draw the gem anymore -- it get's 'picked up'
        this.gotIt = true;
    }
    if (this.gotIt == true && player.y == topEdge){//add one to gemList
        if (gemList.length < 1){//clears the "Nice Job" message if first gem in list
            ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height)
            gemList.push(this.sprite);
            this.gotIt = false;
        }else{
            gemList.push(this.sprite);
            this.gotIt = false;
        }
    }
}


Gem.prototype.random = function(){
    //gets run upon instantiation and in player.handleInput() each time player scores
    var num = (parseInt(Math.random() * 3))
    this.sprite = gemSpriteList[num];
    var rows = [oneBlockVert, oneBlockVert*2, oneBlockVert*3, oneBlockVert*4];
    var columns = [0, oneBlockHorz, oneBlockHorz*2, oneBlockHorz*3, oneBlockHorz*4];
    var randRow = parseInt(Math.random()*4);
    var randCol = parseInt(Math.random()*5);
    this.row = rows[randRow];
    this.column = columns[randCol];
    this.x = this.column;
    this.y = this.row;
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
            this.moveRock();
            $("#level").find("span").text(levels.length);//write level in html
        }else if (collide == true){
            //collide stuff happens in the collide function to keep it global
            alert("waa waa");
            livesCounter();
            collide = false;
        }
    }
    if (gemList.length == 9){
        //bonus points awarded for obtaining 9 gems - slows game by one level
        bonusSpeed = 2;
        //clear gems
        gemList = [];
        ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height)
        ctxGems.font="20px Arial";
        ctxGems.textAlign= "center";
        ctxGems.fillText("NICE JOB - Let's Slow it Down", canvasGems.width/2, canvasGems.height/2);
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
        //clear gems
        gemList = [];
        ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height)
    }
}


var livesCounter = function(){
    if (collide = true){
        lives = lives -1 ;
        $("#lives").find("span").text(lives);//write the lives in html
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

//get a rock obstacle in there
player.moveRock();

var gem = new Gem();
