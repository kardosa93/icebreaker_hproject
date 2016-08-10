// A server that integrates with (or mounts on) the Node.JS HTTP Server: socket.io
// A client library that loads on the browser side: socket.io-client

// Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 2)
var express = require('express');
var app = express();
app.use('/', express.static(__dirname + '/'));
var http = require('http').Server(app);

// command to start MYSQL server: $ mysql-ctl start
var addr = '';
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : addr.address,
  user     : 'kardosa93',
  password : '',
  database : "c9",
  dbport   : 3306
});

// Initialize a new instance of socket.io by passing the http (the HTTP server) object.
var io = require('socket.io')(http);

// Define a route handler / that gets called when we hit our website home
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var numPlayers = 0;
var numQuestions = 1;
var numWantNew = 0;
var anonymusCount = 1;
var arrayRandom = [];
var actualQuestion;
var generatedQuestion = false;

// SQL CONNECTION *****
connection.connect();

connection.query("TRUNCATE players", function(err, res) {
  if (err) throw err
});

connection.query("TRUNCATE comments", function(err, res) {
  if (err) throw err
});

// Listen on the connection event for incoming sockets, and I log it to the console.
io.on('connection', function(socket){
  
  numPlayers++;
  console.log(socket.id + ' connected');
  socket.numAnswer = 0;
  socket.numComment = 0;
  console.log('number of players: ' + numPlayers);
  
  // Each socket also fires a special disconnect event
  socket.on('disconnect', function(){
    connection.query("DELETE FROM `c9`.`players` WHERE `players`.`socketID` = '"+ socket.id +"'", function(err, res) {
      if (err) throw err
    });
    numPlayers--;
    console.log(socket.id + ' disconnected');
  });
  
  socket.on('playerName', function(nm){
    // Check if the socket id has been used or not
    connection.query("SELECT socketID from players WHERE socketID = "+ socket.id, function(err, rows) {
      if (!err);
      if (rows == null){
        if (nm == ''){
          nm = "Anonymus" + anonymusCount;
          socket.nickname = nm;
          connection.query("INSERT INTO `c9`.`players` (`id`, `socketID`, `name`, `topic`, `answer` ,`answerID`, `likes`,`interaction`) VALUES (NULL, '"+socket.id+"', '" + socket.nickname + "', 'NULL', 'NULL', 'NULL', 0, 0)", function(err, res) {
            if (err) throw err
          });
          console.log('name: ' + socket.nickname);
          anonymusCount++;
        } else if (nm != '') {
          socket.nickname = nm;
          connection.query("INSERT INTO `c9`.`players` (`id`, `socketID`, `name`, `topic`, `answer` ,`answerID`, `likes`,`interaction`) VALUES (NULL, '"+socket.id+"', '" + socket.nickname + "', 'NULL', 'NULL', 'NULL', 0, 0)", function(err, res) {
            if (err) throw err
          });
          console.log('name: ' + socket.nickname);
        }
      }
    });
  });
  
  socket.on('gameTopic', function(tpc){
    socket.topic = tpc;
    connection.query("UPDATE  `c9`.`players` SET  `topic` =  '"+ socket.topic +"', `answerID` = '" + socket.nickname+"-?-"+numQuestions +"' WHERE  `players`.`socketID` = '"+ socket.id +"'", function(err, res) {
      if (err) throw err
      if (socket.topic != "Random")
      {
        connection.query("SELECT question from questions WHERE `topic` =  '"+ socket.topic +"'", function(err, rows) {
          if (!err)
          var bool = true;
          while (bool)
          {
            var newRandom = rows[randomIntInc(0, rows.length-1)].question;
            if (arrayRandom.indexOf(newRandom) == -1)
            {
              arrayRandom.push(newRandom);
              actualQuestion = newRandom;
              bool = false;
              console.log("number of question: "+numQuestions);
            }
          }
        });
      } else if (socket.topic == "Random")
      {
        connection.query("SELECT question from questions", function(err, rows) {
          if (!err)
          var bool = true;
          while (bool)
          {
            var newRandom = rows[randomIntInc(0, rows.length-1)].question;
            if (arrayRandom.indexOf(newRandom) == -1)
            {
              arrayRandom.push(newRandom);
              actualQuestion = newRandom;
              bool = false;
              console.log("number of question: "+numQuestions);
            }
          }
        }); 
      }
    });
    numWantNew = numPlayers + 3;
    console.log('topic: ' + socket.topic);
  });

  socket.on('answer', function(answr){
    if (numQuestions == 1)
    {
      if (answr != "")
      {
        connection.query("UPDATE  `c9`.`players` SET  `answer` =  '"+ answr +"' WHERE  `players`.`socketID` = '"+ socket.id +"'", function(err, res) {
          if (err) throw err
          });
        socket.numAnswer++;
      } else {
        answr = "*** NO ANSWER ***";
        connection.query("UPDATE  `c9`.`players` SET  `answer` =  '"+ answr +"' WHERE  `players`.`socketID` = '"+ socket.id +"'", function(err, res) {
          if (err) throw err
          });
      }
    } else {
      if (answr != "")
      {
        connection.query("INSERT INTO `c9`.`players` (`id`, `socketID`, `name`, `topic`, `answer` ,`answerID`,`likes`,`interaction`) VALUES (NULL, '"+socket.id+"', '" + socket.nickname + "', '" +socket.topic+ "', '"+ answr +"', '" + socket.nickname+"-?-"+numQuestions +"', 0, 0)", function(err, res) {
          if (err) throw err
          });
        socket.numAnswer++;
      } else {
        answr = "*** NO ANSWER ***";
        connection.query("INSERT INTO `c9`.`players` (`id`, `socketID`, `name`, `topic`, `answer` ,`answerID`,`likes`,`interaction`) VALUES (NULL, '"+socket.id+"', '" + socket.nickname + "', '" +socket.topic+ "', '"+ answr +"', '" + socket.nickname+"-?-"+numQuestions +"', 0, 0", function(err, res) {
          if (err) throw err
          });
      }
    }
    console.log('answer: ' + answr);
  });
  
  socket.on('comment', function(msg){
    var com = msg.comment;
    var cAnswerID = msg.to;
    if (com != "")
    {
      connection.query("INSERT INTO `c9`.`comments` (`id`, `cAnswerID`, `cName`, `comment`) VALUES (NULL, '"+ cAnswerID +"-?-"+numQuestions +"', '" + socket.nickname + "', '" + com + "')", function(err, res) {
        if (err) throw err
        });
      socket.numComment++;
      comments(socket);
    }
  });
  
  socket.on('like', function(lk){
    connection.query("SELECT likes from players WHERE name = '"+ lk +"'", function(err, rows) {
      if (!err)
      var likes = rows[0].likes;
      likes++;
      connection.query("UPDATE  `c9`.`players` SET  `likes` =  '"+ likes +"' WHERE  `players`.`name` = '"+ lk +"'", function(err, res) {
        if (err) throw err
      });
    });
  });
  
  socket.on('getPlayerNames', function(pnms){
    connection.query("SELECT name from players WHERE  `players`.`topic` = '"+ socket.topic +"'", function(err, rows) {
      if (!err)
      var data = "";
      for(var index in rows) {
        var names = rows[index].name;
        data += names + "\n";
      }
      socket.emit('getPlayerNames', data);
    });
  });
  
  socket.on('radioButton', function(data){
    connection.query("SELECT name from players WHERE  `players`.`topic` = '"+ socket.topic +"'", function(err, rows) {
      if (!err)
      socket.emit('radioButton', rows);
    });
  });
  
  socket.on('getTopicName', function(tpcnm){
    var obj = { name: socket.nickname, topic: socket.topic, numQ: numQuestions };
    socket.emit('getTopicName', obj);
  });
  
  socket.on('getName', function(nm){
    socket.emit('getName', socket.nickname);
  });
  
  socket.on('getQuestion', function(qstn){
    socket.numInteraction = socket.numAnswer+socket.numComment;
    connection.query("UPDATE  `c9`.`players` SET  `interaction` =  '"+ socket.numInteraction +"' WHERE  socketID = '"+ socket.id+"'", function(err, res) {
      if (err) throw err
    });
    socket.emit('getQuestion', actualQuestion);
  });
  
  socket.on('getComments', function(data){
    comments(socket);
  });
  
  socket.on('getStats', function(data){
    connection.query("SELECT likes from players WHERE socketID = '"+ socket.id+"'", function(err, rows1) {
      if (!err)
      connection.query("SELECT name, interaction from players ORDER BY `interaction` DESC", function(err, rows2) {
        if (!err)
        var numLikes = rows1[0].likes;
        var data = "Rank (interaction): \n";
        for(var index in rows2) {
          var name = rows2[index].name;
          var interaction = rows2[index].interaction;
          data += name + ": " + interaction + "\n";
        }
        var obj = { numA: socket.numAnswer, numC: socket.numComment, numL: numLikes, rank: data};
        socket.emit('getStats', obj);
      });
    });
  });
  
  socket.on('report', function(nm){
    connection.query("INSERT INTO `c9`.`report` (`id`, `name`, `date`) VALUES (NULL, '"+ nm +"', CURRENT_TIMESTAMP)", function(err, res) {
      if (err) throw err
    });
  });

  socket.on('generateQuestion', function(qstn){
    numWantNew++;
    generatedQuestion = false;
    
    if (generatedQuestion == false && numWantNew >= numPlayers){
        if (socket.topic != "Random"){
            connection.query("SELECT question from questions WHERE `topic` =  '"+ socket.topic +"'", function(err, rows) {
              if (!err)
              if (rows != null)
              {
                var bool = true;
                while (bool)
                {
                  var newRandom = rows[randomIntInc(0, rows.length-1)].question;
                  if (arrayRandom.indexOf(newRandom) == -1)
                  {
                    arrayRandom.push(newRandom);
                    actualQuestion = newRandom;
                    bool = false;
                    generatedQuestion = true;
                    numWantNew = 0;
                    numQuestions++;
                    console.log("number of question: "+numQuestions);
                    socket.emit('getQuestion', actualQuestion);
                  }
                }
              } else
              {
                actualQuestion = "No more questions in this topic!";
              }
        });
      } else if (socket.topic == "Random") {
            connection.query("SELECT question from questions", function(err, rows) {
              if (!err)
              if (rows != null)
              {
                var bool = true;
                while (bool)
                {
                  var newRandom = rows[randomIntInc(0, rows.length-1)].question;
                  if (arrayRandom.indexOf(newRandom) == -1)
                  {
                    arrayRandom.push(newRandom);
                    actualQuestion = newRandom;
                    bool = false;
                    generatedQuestion = true;
                    numWantNew = 0;
                    numQuestions++;
                    console.log("number of question: "+numQuestions);
                    socket.emit('getQuestion', actualQuestion);
                  }
                }
              } else
              {
                actualQuestion = "No more questions in this topic!";
              }
        });
      }
    }
    console.log(numWantNew + " : " + generatedQuestion);
  });
});

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function comments (socket) {
      connection.query("SELECT `name`, `answer`, `answerID` FROM `players` WHERE `answer` != 'NULL';", function(err, rows1) {
      if (!err)
      connection.query("SELECT `cName`, `comment`, `cAnswerID` FROM `comments`;", function(err, rows2) {
        if (!err)
        var data = "";
        for(var indexAnswer in rows1) {
          var answerID = rows1[indexAnswer].answerID;
          var name = rows1[indexAnswer].name;
          var answer = rows1[indexAnswer].answer;
          data += name + ": " + answer + "\n";
          for(var indexComment in rows2) {
            var cAnswerID = rows2[indexComment].cAnswerID;
            if (answerID == cAnswerID) {
              var cName = rows2[indexComment].cName;
              var comment = rows2[indexComment].comment;
              data += "\t" + cName + ": " + comment + "\n";
            }
          }
        }
        socket.emit('getComments', data);
      });
    });
}

// Make the http server listen on port 3000
http.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    addr = http.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});