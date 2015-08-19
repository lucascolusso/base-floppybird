//development routing
 var socket = io.connect('http://localhost:9999');
// server routing
// var socket = io.connect('http://prosocial.hcde.uw.edu:9999');

//creating variable condition, if it doesn't work, it will be -1 :)
var condition = -1

//getting localStorage experience and condition values from previous screen
var condition = parseInt(localStorage.getItem('condition'));
var experience = localStorage.getItem('experience');

//scores
var score = -1;
var targetScore = -1;
var highscore = -1;
var graphscore = 99;
var rounds_played = 0;
var roundscore = 0;

var lastScore = 0;
var round = 0;
var start_play = 0;
var end_play = 0;
var end_reflect = 0;
var time_played = 0;
var time_reflected = 0;
var user_id = uid();

//game settings
var debugmode = false;
var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2,
});

var currentstate;

//game physics
var gravity = 0.15;
var velocity = 20;
var position = 100;
var rotation = 20;
var jump = -3.3;
var pipeheight = 100;     // not sure but I think it's variability of the gap position
var pipewidth = 40;       // pipes gap opening size
var pipes = new Array();

//sounds
var volume = 2;
var soundJump = new buzz.sound("assets/sounds/sfx_wing.ogg");
var soundScore = new buzz.sound("assets/sounds/sfx_point.ogg");
var soundHit = new buzz.sound("assets/sounds/sfx_hit.ogg");
var soundDie = new buzz.sound("assets/sounds/sfx_die.ogg");
var soundSwoosh = new buzz.sound("assets/sounds/sfx_swooshing.ogg");
buzz.all().setVolume(volume);

//loops
var loopGameloop;
var loopPipeloop;

$(document).ready(function() {
  if(window.location.search == "?debug")
    debugmode = true;
  if(window.location.search == "?easy")
    pipeheight = 200;

    // condition = conditionpass;

  //starts new row in the database
  socket.emit('user', { user_id:user_id, rounds:round, time_played:0, time_reflected:0, condition:condition, experience:experience });

  //assigns experimental condition
  assignment();

  //start with the splash screen
  showSplash();
  userCondition();
});

function getCookie(cname)
{
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for(var i=0; i<ca.length; i++)
   {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
   }
   return "";
}

function setCookie(cname,cvalue,exdays)
{
   var d = new Date();
   d.setTime(d.getTime()+(exdays*24*60*60*1000));
   var expires = "expires="+d.toGMTString();
   document.cookie = cname + "=" + cvalue + "; " + expires;
}

function uid () {
    var delim = "-";
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
};

function showSplash()
{
   currentstate = states.SplashScreen;

   //set the defaults (again)
   velocity = 0;
   position = 180;
   rotation = 0;
   score = 0;

   //update the player in preparation for the next game
   $("#player").css({ y: 0, x: 0});
   updatePlayer($("#player"));
   soundSwoosh.stop();
   soundSwoosh.play();

   //clear out all the pipes if there are any
   $(".pipe").remove();
   pipes = new Array();

   //make everything animated again
   $(".animated").css('animation-play-state', 'running');
   $(".animated").css('-webkit-animation-play-state', 'running');

   //fade in the splash
   $("#splash").transition({ opacity: 1 }, 100, 'ease');
}

function updateGraph()
{
   var loopscore = score;

   if (condition == 0 || condition == 1 || condition == 2) {
   conditions.nonSkewed();
   } else {
      //do nothing
      setBigScore();
      score = rounds_played;
   }
}
function startGame()
{
   currentstate = states.GameScreen;

   //fade out the splash
   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 100, 'ease');

   //update the big score
   setBigScore();
   updateGraph();

   //debug mode?
   if(debugmode)
   {
      //show the bounding boxes
      $(".boundingbox").show();
   }

   //start up our loops
   var updaterate = 1000.0 / 60.0 ;                 //60 times a second, speed of the game
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);     //distance between pipes

   //jump from the start!
   playerJump();
}

function updatePlayer(player)
{
   //rotation
   rotation = Math.min((velocity / 100) * 90, 90);

   //apply rotation and position
   $(player).css({ rotate: rotation, top: position });
}

function gameloop() {
   var player = $("#player");

   //update the player speed/position
   velocity += gravity;
   position += velocity;

   //update the player
   updatePlayer(player);

   //create the bounding box
   var box = document.getElementById('player').getBoundingClientRect();
   var origwidth = 34.0;
   var origheight = 24.0;

   var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
   var boxheight = (origheight + box.height) / 2;
   var boxleft = ((box.width - boxwidth) / 2) + box.left;
   var boxtop = ((box.height - boxheight) / 2) + box.top;
   var boxright = boxleft + boxwidth;
   var boxbottom = boxtop + boxheight;

   //if we're in debug mode, draw the bounding box
   if(debugmode)
   {
      var boundingbox = $("#playerbox");
      boundingbox.css('left', boxleft);
      boundingbox.css('top', boxtop);
      boundingbox.css('height', boxheight);
      boundingbox.css('width', boxwidth);
   }

   //did we hit the ground?
   if(box.bottom >= $("#land").offset().top)
   {
      playerDead();
      return;
   }

   //have they tried to escape through the ceiling? :o
   var ceiling = $("#ceiling");
   if(boxtop <= (ceiling.offset().top + ceiling.height()))
      position = 0;

   //we can't go any further without a pipe
   if(pipes[0] == null)
      return;

   //determine the bounding box of the next pipes inner area
   var nextpipe = pipes[0];
   var nextpipeupper = nextpipe.children(".pipe_upper");

   var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
   var piperight = pipeleft + pipewidth;
   var pipebottom = pipetop + pipeheight;

   if(debugmode)
   {
      var boundingbox = $("#pipebox");
      boundingbox.css('left', pipeleft);
      boundingbox.css('top', pipetop);
      boundingbox.css('height', pipeheight);
      boundingbox.css('width', pipewidth);
   }

   //have we gotten inside the pipe yet?
   if(boxright > pipeleft)
   {
      //we're within the pipe, have we passed between upper and lower pipes?
      if(boxtop > pipetop && boxbottom < pipebottom)
      {
         //yeah! we're within bounds
      }
      else
      {
         //no! we touched the pipe
         playerDead();
         return;
      }
   }

   //have we passed the imminent danger?
   if(boxleft > piperight)
   {
      //yes, remove it
      pipes.splice(0, 1);

      //and score a point
      playerScore();
   }
}

//Handle space bar
$(document).keydown(function(e){
   //space bar!
   if(e.keyCode == 32)
   {
      //in ScoreScreen, hitting space should click the "replay" button. else it's just a regular spacebar hit
      if(currentstate == states.ScoreScreen)
         $("#replay").click();
      else
        screenClick();
   }
});

//Handle mouse down (disabled mouse action for jumping) OR touch start
if("ontouchstart" in window)
   $(document).on("touchstart", screenClick);
else
  //  $(document).on("mousedown", screenClick);

function screenClick()
{
   if(currentstate == states.GameScreen)
   {
      playerJump();
   }
   else if(currentstate == states.SplashScreen)
   {
      start_play = new Date();
      startGame();
   }
}

function playerJump()
{
   velocity = jump;
   //play jump sound
   soundJump.stop();
   soundJump.play();
}

// work on this, weird update issue
function setBigScore(erase)
{
   var elemscore = $("#bigscore");
   elemscore.empty();

   if(erase)
      return;

        var digits = roundscore.toString().split('');
        for(var i = 0; i < digits.length; i++)
           elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore()
{
  var elemscore = $('#current-score');
  elemscore.empty();

  elemscore = score.toString();
  $(document.getElementById('current-score').textContent=elemscore);

  if (condition == 3 || condition == 4 || condition == 5) {
    document.getElementById('you-this-round').textContent= "Rounds you've played:";
  }
}

function setHighScore()
{
  var elemscore = $('#comparison-score');
  elemscore.empty();

  if (condition == 0 || condition == 1 || condition == 2) {
    elemscore = targetScore.toString();
    $(document.getElementById('comparison-score').textContent=elemscore);
    return;
  } else {
    document.getElementById('target-txt').textContent= "Number of rounds the leader played:";

    elemscore = targetScore.toString();
    $(document.getElementById('comparison-score').textContent=elemscore);
    return;
  }
}

function setYourHighScore()
{
  var elemscore = $('#your-high-score');
  elemscore.empty();

  elemscore = highscore.toString();
  $(document.getElementById('your-high-score').textContent=elemscore);

  if (condition == 3 || condition == 4 || condition == 5) {
     $("#delete").transition({ opacity: 0 }, 0, 'ease');
  }
}

// show the scores and the feedback
function showScore()
{
   lastScore = score;
   end_play = new Date();

   //have they beaten the high score?
   if(score > highscore)
   {
    //yeah!
    highscore = score;
    //setCookie("highscore", highscore, 999);
   }
   else
   {
   };
  $('#myModal').modal('show');

  //update the scoreboard
  setSmallScore();
  setHighScore();
  setYourHighScore()
}

  $("#restartbt").click(function() {

  end_reflect = new Date();
  sendscore();

  //start the game over!
  roundscore = 0;
  showSplash();
});

function playerDead()
{
  round++;
  rounds_played++;

  updateGraph();

   //stop animating everything!
   $(".animated").css('animation-play-state', 'paused');
   $(".animated").css('-webkit-animation-play-state', 'paused');

   //drop the bird to the floor
   var playerbottom = $("#player").position().top + $("#player").width(); //we use width because he'll be rotated 90 deg
   var floor = $("#flyarea").height();
   var movey = Math.max(0, floor - playerbottom);
   $("#player").transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');

   //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
   currentstate = states.ScoreScreen;

   //destroy our gameloops
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   // save the user score.
   userScores.add(score);
   conditions.userLeader();

   // Execute the experimental condition
   userCondition();

   //mobile browsers don't support buzz bindOnce event
   if(isIncompatible.any())
   {
      //skip right to showing score
      showScore();
   }
   else
   {
      //play the hit sound (then the dead sound) and then show score
      soundHit.play().bindOnce("ended", function() {
         soundDie.play().bindOnce("ended", function() {
            showScore();
         });
      });
   }
}

function playerScore()
{
   score += 1;
   roundscore++;
   //play score sound
   soundScore.stop();
   soundScore.play();
   setBigScore();
   updateGraph();
}

//beginning earlier is not here
function updatePipes()
{
   //Do any pipes need removal?
   $(".pipe").filter(function() { return $(this).position().left <= -100; }).remove()

   //add a new pipe (top height + bottom height  + pipeheight == 420) and put it in our tracker
   var padding = 80;
   var constraint = 420 - pipeheight - (padding * 2); //double padding (for top and bottom)
   var topheight = Math.floor((Math.random()*constraint) + padding); //add lower padding
   var bottomheight = (420 - pipeheight) - topheight;
   var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + topheight + 'px;"></div><div class="pipe_lower" style="height: ' + bottomheight + 'px;"></div></div>');
   $("#flyarea").append(newpipe);
   pipes.push(newpipe);
}

//I'm done with the game, take me to the final survey!
$("#exitbt").click(function() {
    end_reflect = new Date();
    sendscore();
    window.location.href = "./post.html?user_id="+user_id+"&condition="+condition+"&experience="+experience;
});

function sendscore() {
   if(typeof end_reflect == undefined) {
      end_reflect = new Date();
   }
   socket.emit('score', { score: score, user_id:user_id, round:round, start_play:start_play, end_play:end_play, end_reflect:end_reflect });
   if(start_play != 0 && end_play != 0) {
      time_played += end_play - start_play;
   }
   if(end_reflect != 0 && end_play != 0) {
      time_reflected += end_reflect - end_play;
   }
   socket.emit('update', { user_id:user_id, rounds:round, time_played:time_played, time_reflected:time_reflected, condition:condition, experience:experience });
};

// incompatibility
var isIncompatible = {
   Android: function() {
   return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function() {
   return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function() {
   return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function() {
   return navigator.userAgent.match(/Opera Mini/i);
   },
   Safari: function() {
   return (navigator.userAgent.match(/OS X.*Safari/) && ! navigator.userAgent.match(/Chrome/));
   },
   Windows: function() {
   return navigator.userAgent.match(/IEMobile/i);
   },
   any: function() {
   return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
   }
};
