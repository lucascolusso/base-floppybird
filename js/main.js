var socket = io.connect('http://localhost:9999');
var condition = -1;

//scores
var score = 0;
var highscore = 0;
var similarscore = 0;

var lastScore = 0;
var round = 0;
var start_play = 0;
var end_play = 0;
var end_reflect = 0;
var time_played = 0;
var time_reflected = 0;
var user_id = uid();
var experience = -1;

//game settings
var debugmode = false;
var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2
});

var currentstate;

//game physics
var gravity = 0.15;
var velocity = 20;
var position = 100;
var rotation = 20;
var jump = -3.3;
var pipeheight = 100; // not sure but I think it's variability of the gap position
var pipewidth = 40; //pipes gap opening
var pipes = new Array();
var replayclickable = false;

//sounds
var volume = 10;
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

   //get the highscore
   var savedscore = getCookie("highscore");
   if(savedscore != "")
      highscore = parseInt(savedscore);

   socket.emit('user', { user_id:user_id, rounds:round, time_played:0, time_reflected:0, condition:condition, experience:experience });
   //start with the splash screen
   showSplash();
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
   $("#splash").transition({ opacity: 1 }, 2000, 'ease');
}

function startGame()
{
   currentstate = states.GameScreen;

   //fade out the splash
   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 500, 'ease');

   //update the big score
   setBigScore();

   //debug mode?
   if(debugmode)
   {
      //show the bounding boxes
      $(".boundingbox").show();
   }

   //start up our loops
   var updaterate = 1000.0 / 60.0 ; //60 times a second
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);

   //jump from the start!
   playerJump();
}

function updatePlayer(player)
{
   //rotation
   rotation = Math.min((velocity / 10) * 90, 90);

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

function setBigScore(erase)
{
   var elemscore = $("#bigscore");
   elemscore.empty();

   if(erase)
      return;

   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setSmallScore()
{
   var elemscore = $("#currentscore");
   elemscore.empty();
   var digits = score.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setHighScore()
{
   var elemscore = $("#highscore");
   elemscore.empty();
   var digits = highscore.toString().split('');
   for(var i = 0; i < digits.length; i++)
      elemscore.append("<img src='assets/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
}

function setBarNotSkewed()
{
  var barheight = 0;
  barheight = (( score * 178 ) / highscore);
  $("#participant").css({height: barheight }); // set the bar height with the right proportion
}

function setBarSkewed()
{
  var barheighttop = 0;
  var barheight = 0;
  adjusted_height = (106.8) + ((178*0.4)*(score/highscore));
  $("#participant").css({height: adjusted_height }); // set the bar height with the right proportion
}

function playerDead()
{
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

// show the scores and the feedback
function showScore()
{
   //unhide us
   $(".scoreboard").css("display", "block");

   lastScore = score;

   round++;
   end_play = new Date();

   //have they beaten their high score?
   if(score > highscore)
   {
      //yeah!
      highscore = score;
      //save it!
      setCookie("highscore", highscore, 999);
      $("#replay").hide();
   }
   else
   {
     //update the scoreboard
     setSmallScore();
     setHighScore();

     // social comparison feedback routing

     function Assignment () {
         var condition=Math.floor(Math.random()*5);
     };

     switch(condition) {
      case 1:
          //variables
          highscore = 75;

          setBarNotSkewed();
          break;
      case 2:
          //variables
          highscore = 75;

          setBarNotSkewed();
          break;
      case 3:
          //variables
          highscore = 75;

          setBarSkewed();
          break;
      case 4:
          //variables
          highscore = 75;

          setBarSkewed();
          break;
      case 5:
          //variables
          highscore = 75;

          //setTrend();
          break;
     }

   //SWOOSH!
   soundSwoosh.stop();
   soundSwoosh.play();

   $(".scoreboard").css({opacity: 0 }); //move it down so we can slide it up
   $(".scoreboard").transition({ y: '0px', opacity: 1}, 600, 'ease', function() {
      //When the animation is done, animate in the replay button and SWOOSH!
      soundSwoosh.stop();
      soundSwoosh.play();

   });

   //show the replay button and make it clickable
   $("#replay").transition({ y: '0px', opacity: 1}, 600, 'ease');
   replayclickable = true;
}
   $("#replay").click(function() {
     //make sure we can only click once
     if(!replayclickable)
        return;
     else
        replayclickable = false;

   //SWOOSH!
   soundSwoosh.stop();
   soundSwoosh.play();

   //fade out restart
   $("#replay").transition({ y: '0px', opacity: 0}, 600, 'ease', function() {

      end_reflect = new Date();
      sendscore();
      //start the game over!
      showSplash();
   });
});

}

function playerScore()
{
   score += 1;
   //play score sound
   soundScore.stop();
   soundScore.play();
   setBigScore();
}

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

$("#experience").click(function() {
  var radios = document.getElementsByName('inlineRadioOptions');
  for (var i = 0, length = radios.length; i < length; i++) {
      if (radios[i].checked) {
          experience = radios[i].value;
          alert(experience);
          break;
      }
  }
   $('#myModal').modal('hide');
});

$("#forward").click(function() {
   end_reflect = new Date();
   sendscore();
   window.location.href = "./post.html";
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
}

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
