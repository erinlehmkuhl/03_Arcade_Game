//-------------------------------- GLOBAL VARIABLES-----------------------------------
//canvas measurements
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
var speedList = [];//for bugs so they don't overrun themselves
var gameOver = false;

var drawGem = true;//initialize gem on the board
var gemList = [];//to hold your gems
var gemSpriteList = ['images/gemBlue.png', 'images/gemOrange.png', 'images/gemGreen.png'];
var gemSize = 58;//horizontal measurement for canvas spacing and bounding box
var bonusSpeed = 0;//subtracts from bug speed when 9 gems are accumulated

var lives = 3;
var bonusPoint = false;
var bonus = 0;

//-------------------------------- ENEMIES-----------------------------------

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
    boundingBox.call(this, 15, 80, 70, 60);
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

//showBoundingBox.call(this);

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
}


Player.prototype.update = function(dt) {
    //bounding box information
    boundingBox.call(this, 14, 63, 72, 75);


    //run collision function
    allEnemies.forEach(function(enemy){
        collision(player, enemy);
    })
}


Player.prototype.render = function() {
    //draw character
    if (gameOver == false){
       ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }else{
        ctx.drawImage(Resources.get(this.princessSprite), this.x, this.y);

    }


    //draw stars representing each level
    var nextStar = 0;
    for (level in levels){
        ctx.drawImage(Resources.get(spriteLevelStar), 0 + nextStar, 415);
        nextStar = nextStar + oneBlockHorz/2;
    }
//showBoundingBox.call(this);
}


//move player based on key input
//stops player when they run into a wall
Player.prototype.handleInput = function(buttonPress) {
    if (buttonPress === "left"){
        if (!(player.y == topEdge && player.x == rock.rockX + oneBlockHorz)){//if rock is to the left of player
            this.x = this.x - oneBlockHorz;//move to the left normally
        }
        if (this.x < leftEdge){
            this.x = leftEdge;
        }
    }else if (buttonPress === "right"){
        if (!(player.y == topEdge && player.x == rock.rockX - oneBlockHorz)){//if rock is to the right of player
            this.x = this.x + oneBlockHorz;// move to the right normally
        }
        if (this.x > rightEdge){
            this.x = rightEdge;
        }
    }else if (buttonPress === "up"){
        if (!(player.y == rock.rockY + oneBlockVert && player.x == rock.rockX)){//if rock in the way vertically
            this.y = this.y - oneBlockVert;// move up normally
        }
        if (this.y < topEdge){// points, gems and levels accrued here
            score();
            player.restart();
            gem.restart();
            levelUp();
            bonusSpeedChange();
        }
    }else if (buttonPress === "down"){
        this.y = this.y + oneBlockVert;
        if (this.y > bottomEdge){
          this.y = bottomEdge;
        }
    }
}


Player.prototype.restart = function(){
    player.y = player.restartY; //reset player's position
    player.x = player.restartX;
}

//----------------------------------- ROCKS --------------------------------------
var waterSlots = [0, oneBlockHorz, oneBlockHorz*2, oneBlockHorz*3, oneBlockHorz*4]//slots for rocks

var Rock = function(){
    this.x = oneBlockHorz*2;
    this.y = -22;
}


Rock.prototype.moveRock = function(){
    this.x = waterSlots[parseInt(Math.random()*5)];

    var alignmentY = 11;//the pngs are a little messy - these are for collisions
    var alignmentX = 5;//the pngs are a little messy - these are for collisions
    this.rockX = this.x + alignmentX;//the pngs are a little messy - these are for collisions
    this.rockY = this.y + alignmentY;//the pngs are a little messy - these are for collisions
}


Rock.prototype.render = function(){
    ctx.drawImage(Resources.get(spriteRock), this.x, this.y);

}

//----------------------------------- On Board GEMS --------------------------------------

var Gem = function(){
    this.random();
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


Gem.prototype.update = function(){
    boundingBox.call(this, 20, 53, gemSize, 65);
    collision(player, gem);
    gem.pickup();
}


Gem.prototype.pickup = function(){//gets called in player.update()
    //make gems disappear
    if (collide == true){
        drawGem = false;//don't draw the gem on the board anymore -- it get's 'picked up'
        this.gotIt = true;//gem in player's possession
        collide = false;
    }
}


Gem.prototype.render = function() {//game board gems get drawn here
    if (bonusPoint == true){
        ctx.font="60px Arial";
        ctx.textAlign= "center";
        ctx.fillText("BONUS", canvas.width/2, canvas.height/2);
        if (player.y != player.restartY || player.x != player.restartX){//as soon as char moves, clear the word BONUS
            ctx.clearRect(0, 0, canvasGems.width, canvasGems.height);
            bonusPoint = false;
        }
    }
    if (drawGem == true){
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    //showBoundingBox.call(this);
}


Gem.prototype.restart = function(){
    gem.awardGem();
    awardBonusPoints();
    gem.random();
    drawGem = true;
}

//------------------------------ Prizes in Second Canvas --------------------------------------

Gem.prototype.awardGem = function(){//called in gem.restart(). adds gem to list, will immediately be drawn
    if (gem.gotIt == true && player.y == player.restartY){
        if (gemList.length < 1){
            ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height);//clears the "Nice Job" message if first gem in list
            gemList.push(this.sprite);//add one to gemList
            gem.gotIt = false;
        }else{
            gemList.push(this.sprite);//add one to gemList
            gem.gotIt = false;

        }
    }
}


Gem.prototype.renderBar = function(){//awarded gems get drawn in lower canvas as they are placed in gemList
    var nextGem = 0;
        for (i in gemList){
                ctxGems.drawImage(Resources.get(gemList[i]), (-22 + nextGem), -55);//
                nextGem = nextGem + gemSize;
    }
}


var awardBonusPoints = function(){
    //needs gemList to be run first in awardGem
    //next time score() is run, award points will be included
    if (gemList.length > 0 && gemList.length % 5 == 0){
        bonus = bonus + 23;
        bonusPoint = true;//to write the word BONUS on screen  
    }
}


var bonusSpeedChange = function(){// called in handleInput() for player
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

//-------------------------------- GAME PLAY STUFF-----------------------------------

//create variable speeds for the bugs per round
var randomizeSpeed = function(){
    speedList = [];
    for (enemy in allEnemies) {
        //make a this.speedRandom attribute for update() to use in this.x
        allEnemies[enemy].speedRandom = Math.floor(Math.random() * 50) + 5;
        speedList.push(allEnemies[enemy].speedRandom);
    }
}


var boundingBox = function(boxX, boxY, boxW, boxH){
    //make sure to use .call(this) when using this function in the update() function
    //boxX and boxY are the upper left coordinate of the object.
    //boxW and boxH are the size of the box
    //turn on test code in render() to see the box
    this.boxX = this.x + boxX; 
    this.boxY = this.y + boxY;
    this.boxW = boxW;
    this.boxH = boxH;
}


//This is called when the player gets to the top of the screen in handleInput()
var score = function(){
    scoreList.push(1);// add one to the score depot
    curScore = scoreList.length;
    $("#score").find("span").text((curScore + bonus));//write the score in html
}


var collision = function(player, enemy){
    if (enemy.boxX < player.boxX + player.boxW &&
        enemy.boxX + enemy.boxW > player.boxX &&
        enemy.boxY < player.boxY + player.boxH &&
        enemy.boxH + enemy.boxY > player.boxY) {
        // collision detected!
        collide = true;

        if (enemy.constructor == Enemy){
            crashInto();
        }
    }
}


var levelUp = function(){
    //instructions for leveling up every third point
    if (curScore %3 === 0){
        createBugs(1);
        randomizeSpeed();//randomizes the speed of the bugs
        rock.moveRock();
        levels.push(scoreList[-1]);//add one to the levels list, which also adds speed
        $("#level").find("span").text(levels.length);//write level in html
    }
}


var crashInto = function(){
    //restart player position
    player.x = player.restartX;
    player.y = player.restartY;
    //clear gems
    gemList = [];
    ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height);
    //clear gems from possession
    if (gem.gotIt == true){
        gem.gotIt = false;
    }
    alert("waa waa");
    livesCounter();
    collide = false;
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


//for debugging collisions. This shows the bounding box if placed in render()
var showBoundingBox = function(){
    ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    ctx.stroke();
}

//-------------------------------- START IT UP -----------------------------------

//instantiate enemy objects
createBugs(1);
randomizeSpeed();

//instantiate player object
var player = new Player();

//instantiate rock object
var rock = new Rock();
rock.moveRock();

//instantiate gem object
var gem = new Gem();
