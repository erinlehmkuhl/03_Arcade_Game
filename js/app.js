//-------------------------------- GLOBAL VARIABLES-----------------------------------
//canvas measurements
var ONE_BLOCK_VERT = 84;
var ONE_BLOCK_HORZ = 100;
var LEFT_EDGE = 5;
var RIGHT_EDGE = 405;
var TOP_EDGE = 73;
var BOTTOM_EDGE = 409;

var levels = [1];
var SPRITE_STAR_LEVEL = 'images/StarSmall.png';
var SPRITE_ROCK = 'images/Rock.png';
var scoreList = [];
var curScore = scoreList.length;
var collide = false;

var occupiedRows = [];//to place bugs
var allEnemies = [];//used in engine.js & to assign placement in rows
var ENEMY_SPEED = 0.05;
var speedList = [];//for bugs so they don't overrun themselves
var gameOver = false;

var drawGem = true;//initialize gem on the board
var gemList = [];//to hold your gems
var GEM_SPRITE_LIST = ['images/gemBlue.png', 'images/gemOrange.png', 'images/gemGreen.png'];
var GEM_SIZE = 58;//horizontal measurement for canvas spacing and bounding box
var bonusSpeed = 0;//subtracts from bug speed when 9 gems are accumulated

var lives = 3;
var bonusPoint = false;
var drawBonus = false;
var bonus = 0;

//-------------------------------- ENEMIES-----------------------------------

//make lots of bugs.
var createBugs = function(howMany){
    var i = 0;
    while (i < howMany){
        i++;
        allEnemies.push(new Enemy());
    }
};


var Enemy = function() {
    this.randEnemyStartLoc = Math.floor(Math.random()*370) + 1;//inital start spot bewteen 1-605
    this.x = this.randEnemyStartLoc;
    this.sprite = 'images/enemy-bug.png';
    this.restartRun = -100;
    this.y = this.assignedRow();
};


//create variable speeds for the bugs per round
Enemy.prototype.randomizeSpeed = function(){
    speedList = [];
    for (enemy in allEnemies) {
        //make a this.speedRandom attribute for update() to use in this.x
        allEnemies[enemy].speedRandom = Math.floor(Math.random() * 4000) + 1;
        speedList.push(allEnemies[enemy].speedRandom);
    }
}


// Update the enemy's position
Enemy.prototype.update = function(dt) {
    //if a row is already filled with a bug, set speed to first bug's speed
    var speedPerRow = speedList[this.whichRow];//the first bug sets the row's speed
    var curLevel = levels.length;


    if (occupiedRows[this.whichRow]) {
        this.x = (this.x + ((ENEMY_SPEED * speedPerRow)*dt) + curLevel - bonusSpeed);
    }else{//set initial speed
        this.x = (this.x + ((ENEMY_SPEED * this.speedRandom)*dt) + curLevel - bonusSpeed);
    }

    //randomize re-entry time
    this.randomLag = Math.random()*10000;
    if (this.x > 505 + this.randomLag){
        this.x = this.restartRun;
    }

    //bounding box information
    boundingBox.call(this, 15, 80, 70, 60);
}


//assign each enemy a y coordinate, gets run upon creation of the instance
Enemy.prototype.assignedRow = function(){
    var FIRST_ROW = 228;
    var rows = [FIRST_ROW, 
                FIRST_ROW-ONE_BLOCK_VERT, 
                FIRST_ROW-(ONE_BLOCK_VERT * 2)];
    this.whichRow = allEnemies.length % 3; // so they only occupy three rows
    this.y = rows[this.whichRow];// rows are assigned 0, 1 & 2
    occupiedRows.push(this.y);//assign same speed per row in update().

    return this.y;
}


//draw enemies on board each frame
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//-------------------------------- PLAYER-----------------------------------
var Player = function() {
    this.sprite = 'images/char-horn-girl.png';
    this.PRINCESS_SPRITE = 'images/char-princess-girl.png';
    this.RESTART_X = 205;
    this.RESTART_Y = 409;
    this.x = this.RESTART_X;
    this.y = this.RESTART_Y;
};


Player.prototype.collision = function(enemy){// called once for enemies and once for gems
    //this if statement is courtesy of https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    if (enemy.boxX < this.boxX + this.boxW &&
        enemy.boxX + enemy.boxW > this.boxX &&
        enemy.boxY < this.boxY + this.boxH &&
        enemy.boxH + enemy.boxY > this.boxY) {
        //collision detected!
        collide = true;

        if (enemy.constructor == Enemy){
            this.crashInto();
        }
    }
}


Player.prototype.crashInto = function(){//called in collision()
    //clear gems from award list in lower canvas
    gemList = [];
    ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height);
    bonus = 0;
    //clear gems from possession
    if (gem.gotIt == true){
        gem.gotIt = false;
    }
    //restart player position
    this.x = player.RESTART_X;
    this.y = player.RESTART_Y;

    alert("waa waa");
    this.livesCounter();
    collide = false;
}


//update things associated with player
Player.prototype.update = function() {
    //bounding box information
    boundingBox.call(this, 14, 63, 72, 75);
    
    //run collision function
    for (var i = 0; i < allEnemies.length; i++){
        this.collision(allEnemies[i]);
    }
}


//draw player on screen
Player.prototype.render = function() {
    //draw character
    if (gameOver == false){
       ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }else{
        ctx.drawImage(Resources.get(this.PRINCESS_SPRITE), this.x, this.y);
    }

    //draw stars representing each level
    var nextStar = 0;
    for (level in levels){
        ctx.drawImage(Resources.get(SPRITE_STAR_LEVEL), 0 + nextStar, 415);
        nextStar = nextStar + ONE_BLOCK_HORZ/2;
    }
}


//move player based on key input
//stops player when they run into a wall or rock
Player.prototype.handleInput = function(buttonPress) {
    if (buttonPress === "left"){
        this.x = this.x - ONE_BLOCK_HORZ;//move to the left normally
        if (this.x < LEFT_EDGE){//unless there is a wall
            this.x = LEFT_EDGE;
        }
    }else if (buttonPress === "right"){
        this.x = this.x + ONE_BLOCK_HORZ;// move to the right normally
        if (this.x > RIGHT_EDGE){//unless there is a wall
            this.x = RIGHT_EDGE;
        }
    }else if (buttonPress === "up"){
        if (!(player.y == rock.rockY + ONE_BLOCK_VERT && player.x == rock.rockX)){//if rock in the way vertically
            this.y = this.y - ONE_BLOCK_VERT;// move up normally
        }
        if (this.y < TOP_EDGE){// points, gems and levels accrued here
            this.score();
            player.restart();
            gem.restart();
            this.levelUp();
            gem.bonusSpeedChange();
        }
    }else if (buttonPress === "down"){
        this.y = this.y + ONE_BLOCK_VERT;
        if (this.y > BOTTOM_EDGE){
          this.y = BOTTOM_EDGE;
        }
    }
}


Player.prototype.restart = function(){//reset player's position
    player.y = player.RESTART_Y; 
    player.x = player.RESTART_X;
}


//This is called when the player gets to the top of the screen in handleInput()
Player.prototype.score = function(){
    scoreList.push(1);// add one to the score depot
    curScore = scoreList.length;
    $("#score").find("span").text(curScore + bonus);//write the score in html
    if (bonusPoint == true){
        drawBonus = true;
    }
}


Player.prototype.levelUp = function(){
    //instructions for leveling up every third point
    if (curScore % 3 === 0){
        createBugs(1);
        for(var i = 0; i < allEnemies.length; i++){
            allEnemies[i].randomizeSpeed();
        }
        rock.moveRock();
        levels.push(scoreList[-1]);//add one to the levels list, which also adds speed
        $("#level").find("span").text(levels.length);//write level in html
    }
}


Player.prototype.livesCounter = function(){
    if (collide = true){
        lives = lives -1 ;
        $("#lives").find("span").text(lives);//write the lives in html
    }
}


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
Player.prototype.listener = function(){
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    });
}

//----------------------------------- ROCKS --------------------------------------
var WATER_SLOTS = [0, ONE_BLOCK_HORZ, ONE_BLOCK_HORZ*2, ONE_BLOCK_HORZ*3, ONE_BLOCK_HORZ*4];//slots for rocks

var Rock = function(){
    this.x = ONE_BLOCK_HORZ*2;
    this.y = -22;
};


Rock.prototype.moveRock = function(){
    this.x = WATER_SLOTS[parseInt(Math.random()*5)];

    var alignmentY = 11;//the pngs are a little messy - these are for collisions
    var alignmentX = 5;//the pngs are a little messy - these are for collisions
    this.rockX = this.x + alignmentX;//the pngs are a little messy - these are for collisions
    this.rockY = this.y + alignmentY;//the pngs are a little messy - these are for collisions
}


Rock.prototype.render = function(){
    ctx.drawImage(Resources.get(SPRITE_ROCK), this.x, this.y);

}

//----------------------------------- On Board GEMS --------------------------------------

var Gem = function(){
    this.random();
};


Gem.prototype.random = function(){
    //gets run upon instantiation and in player.handleInput() each time player scores
    var num = (parseInt(Math.random() * 3));
    this.sprite = GEM_SPRITE_LIST[num];
    var rows = [ONE_BLOCK_VERT, ONE_BLOCK_VERT*2, ONE_BLOCK_VERT*3, ONE_BLOCK_VERT*4];
    var columns = [0, ONE_BLOCK_HORZ, ONE_BLOCK_HORZ*2, ONE_BLOCK_HORZ*3, ONE_BLOCK_HORZ*4];
    var randRow = parseInt(Math.random()*4);
    var randCol = parseInt(Math.random()*5);
    this.row = rows[randRow];
    this.column = columns[randCol];
    this.x = this.column;
    this.y = this.row;
}


Gem.prototype.update = function(){
    boundingBox.call(this, 20, 53, GEM_SIZE, 65);
    player.collision(gem);
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
    if (drawBonus == true && gemList.length % 4 == 0){//BONUS gets drawn on the board %4 instead of %3 to account for draw time
        ctx.font="60px Arial";
        ctx.textAlign= "center";
        ctx.fillText("BONUS", canvas.width/2, canvas.height/2);
        if (player.y != player.RESTART_Y || player.x != player.RESTART_X){//as soon as char moves, clear the word BONUS
            ctx.clearRect(0, 0, canvasGems.width, canvasGems.height);
            bonusPoint = false;
            drawBonus = false;
        }
    }
    if (drawGem == true){// draw the gem on the game board
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}


Gem.prototype.restart = function(){//gets run in player.handleInput()
    this.awardGem();
    this.awardBonusPoints();
    this.random();
    drawGem = true;
}

//------------------------------ Prizes in Second Canvas --------------------------------------

Gem.prototype.awardGem = function(){//called in gem.restart(). adds gem to list, will immediately be drawn in render()
    if (gem.gotIt == true && player.y == player.RESTART_Y){
        if (gemList.length <= 0){
            ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height);//clears "Gem Pouch" message if first gem in list
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
                nextGem = nextGem + GEM_SIZE;
    }
}


Gem.prototype.awardBonusPoints = function(){//gets run in gem.restart()
    //needs gemList to be run first. that happens in awardGem()
    //next time player.score() is run, award points from this function will be included
    if (gemList.length > 0 && gemList.length % 3 == 0){
        bonus = bonus + 23;
        bonusPoint = true;//to write the word BONUS on screen 
    }
}


Gem.prototype.bonusSpeedChange = function(){// called in handleInput() for player
    if (gemList.length == 9){
        //bonus points awarded for obtaining 9 gems - slows game by one level
        bonusSpeed = 2;
        //clear gems from lower award area
        gemList = [];
        ctxGems.clearRect(0, 0, canvasGems.width, canvasGems.height)
        ctxGems.font="20px Arial";
        ctxGems.textAlign= "center";
        ctxGems.fillText("Fill Your Gem Pouch to Slow the Bugs", canvasGems.width/2, canvasGems.height/2);
    }
}

//-------------------------------- GAME PLAY STUFF-----------------------------------

//used for player, enemy and gems
var boundingBox = function(boxX, boxY, boxW, boxH){
    //make sure to use .call(this) when using this function in the update() function
    //boxX and boxY are the upper left coordinate of the object.
    //boxW and boxH are the size of the box
    //turn on test code in render() to see the box
    this.boxX = this.x + boxX; 
    this.boxY = this.y + boxY;
    this.boxW = boxW;
    this.boxH = boxH;
};


//for debugging collisions. This shows the bounding box if placed in render()
var showBoundingBox = function(){
    ctx.rect(this.boxX, this.boxY, this.boxW, this.boxH);
    ctx.stroke();
};

//-------------------------------- START IT UP -----------------------------------

//instantiate enemy objects
createBugs(1);
for(var i = 0; i < allEnemies.length; i++){
    allEnemies[i].randomizeSpeed();
}

//instantiate player object
var player = new Player();
player.listener();

//instantiate rock object
var rock = new Rock();
rock.moveRock();

//instantiate gem object
var gem = new Gem();
