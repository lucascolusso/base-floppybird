var mysql = require('mysql')
var connection = mysql.createConnection({
  host     : '192.81.129.111',
  user     : 'root',
  password : 'fitbit1111',
  database : 'floppybird',
});


var io = require('socket.io').listen(9999); // initiate socket.io server

io.sockets.on('connection', function (socket) {

//user_rounds_score
//table

socket.on('score', function (data) {
  console.log(data);
    connection.connect(function(err) {});
    var start_play = data.start_play.toString().replace(/T/, ' ').replace(/\..+/, '');
    var end_play = data.end_play.toString().replace(/T/, ' ').replace(/\..+/, '');
    var end_reflect = data.end_reflect.toString().replace(/T/, ' ').replace(/\..+/, '');
  	var query = connection.query("INSERT INTO user_rounds_score (user_id, round, score, start_play, end_play, end_reflect) VALUES ('" + data.user_id + "', " + data.round + ", " + data.score +
  		", '" + start_play + "', '" + end_play + "', '" + end_reflect + "')");
  	console.log('Added (user, round, score): ' + data.user_id + ", " + data.round + ", " + data.score);
});


//user_info
//table

socket.on('user', function (data) {
  console.log(data);
    connection.connect(function(err) {});
  	var query = connection.query("INSERT INTO user_info (pseudonym, total_play_time, total_reflect_time, rounds_played, condition_num, experience) VALUES ('" + data.user_id + "', " + data.time_played + ", " + data.time_reflected +
  		", " + data.rounds + ", " + data.condition + ", " + experience + ")");
  	console.log('Added (user, rounds, condition, experience): ' + data.user_id + ", " + data.rounds + ", " + data.condition + ", " + data.experience);
});

socket.on('update', function(data) {
console.log(data);
    connection.connect(function(err) {});
    var query = connection.query("UPDATE user_info SET total_play_time=" + data.time_played + ", total_reflect_time=" + data.time_reflected + ", rounds_played=" + data.rounds + ", experience=" + data.experience + " WHERE pseudonym='" + data.user_id + ")");
    console.log('Updated (user, rounds, condition, experience): ' + data.user_id + ", " + data.rounds + ", " + data.condition + ", " + data.experience);
});
});
