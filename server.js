/*jshint esversion: 6 */

let startTime = Date.now();

// Dependencies
const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
var ejs=require('ejs');
var mongoose=require('mongoose');
const app = express();
const server = http.Server(app);
const io = socketIO(server);
const port = process.env.PORT || 3000;
var dbo=require('./dbOperations');
var game = require("./controller");
var threeMinTimeout=0;
var bodyParser = require('body-parser');

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI || "mongodb://heroku_nft10gvf:822nen9r3b8inasjmj2bg8ks0h@ds049548.mlab.com:49548/heroku_nft10gvf";
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection;
//add collection  of words to the database
client.connect(err => {
    if (err) return console.error(err);
    collection = client.db('heroku_nft10gvf').collection("words");

//connecting to the database
// connect to MongoDB
mongoose.connect('mongodb://localhost:27017/DrawAndGuessGame')
  .then(() =>  console.log('connection succesful'))
  .catch((err) => console.error(err));

    // Starts the server.
    server.listen(port, function() {
        console.log('Server started on port ' + port);
    });
});

// number of words in database
let totalWords = 10;

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));
app.set("view engine", "ejs");
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));

// Routing
app.get('/', function(request, res) {
  //try to get login in index
    res.render(path.join(__dirname + '/static', 'index'));
});
//app.post('/login/',function(req, res){
  //the data comming from the form
  //console.log("request");
  //console.log(req.body);
app.post("/login/",game.login);
app.post('/register/',game.join);
//app.post('/userProfile/',game.userProfile);
app.post('/userProfile/',game.getStats);
let lobbies = [];
var gameStarted=false;
let Lobby = function() {
    let lobbyNum = lobbies.length;
    this.lobbyId = "lobby" + lobbyNum.toString();
    this.players = [];
    this.lastDataUrl = null;
    this.drawingPlayer = null;
    this.word = null;
    this.timer = null;
    this.timeLeft = null;
    this.guessedPlayers = [];
};

let playerLobbies = {};

//with the socket.emit we communicate between the frontend and the backend

// Add the WebSocket handlers
io.on('connection', function(socket) {
    socket.on('newPlayer', function(username) {
      var result;
      //if there are no rooms, create one
        if (lobbies.length == 0) {
            lobbies.push(new Lobby());
        } else if (lobbies[0].players.length == 8) {
            //if there are 8 players remove room
            lobbies.splice(0, 0, new Lobby());
        }
        //join the room
        socket.join(lobbies[0].lobbyId);
        //add a player to the room and add a sound on entrance
        console.log(username + " connected!");
        lobbies[0].players.push({ id: socket.id, username: username, score: 0 });
        io.in(lobbies[0].lobbyId).emit('joinSound');
        playerLobbies[socket.id] = lobbies[0];
        //if there are less then 3 players in the room, add forplay
        if (lobbies[0].players.length <3 ) {
            lobbies[0].drawingPlayer = lobbies[0].players[0].id;//socket.id;
            console.log("becomming a drawer");
            console.log(lobbies[0].players[0].username);

            //find a ranom word form the list
            let rnd = Math.floor(Math.random() * totalWords);
            collection.findOne({ _id: rnd }, (err, res) => {
                if (err) return console.error(err);
                io.to(lobbies[0].drawingPlayer).emit('letsDraw', res.word);
                lobbies[0].word = res.word;
                lobbies[0].guessedPlayers = [];
            });
            //emit to frontend that we are waiting for players
          //  io.in(lobbies[0].lobbyId).emit('waiting');
    //      if(lobbies[0].players.length==1)
      //    {
        //    io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
          //}else {
            //for all other players
            //io.in(lobbies[0].lobbyId).emit('waiting');
            console.log("waittin to start, this player is going to start the game ");
            console.log(lobbies[0].players[0].id);
            console.log("current socket id ");
            console.log(socket.id);
            if(lobbies[0].players.length==1)
                  {
                    io.in(lobbies[0].lobbyId).emit('firstPlayer',lobbies[0].players[0].id);
                    //io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
                  }

              io.in(lobbies[0].lobbyId).emit('waitingToStart',socket.id);

          //}
        }
        else if(gameStarted==false){
          //lobbies[0].drawingPlayer = lobbies[0].players[0].id;//socket.id;
          //console.log("player that starts the game is: ");
          //console.log(lobbies[0].players[0].username);
          //emit ti the frontend that we are waitting for player to start the game
        //  io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
          //gameStarted=true;
        //  io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
        io.in(lobbies[0].lobbyId).emit('waitingToStart',lobbies[0].players[0].id);
        }
        io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].players[0].id);

        //not good(have to set game started socket on method)

         /*else {

          //if the player count is more than 3, start the game
            if (lobbies[0].players.length >= 3) {
              //setting the drawer
                 result=next_turn(lobbies[0]);
                console.log("result of the next turn");
                console.log(result);
            }

            if(result==1)
            {
              //if result is 1(the game finish code-exit the game)
              return 0;
            }
              //setting ither players to watch when a player is made a drawer
              io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].drawingPlayer, lobbies[0].lastDataUrl);
              io.to(socket.id).emit('makeaguess', lobbies[0].drawingPlayer);
        }
        io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].drawingPlayer);
    */});
    socket.on('publicMessage',function(message,id){
      //  var player=lobbies[0].players[socket.id];
        for(var k=0;k<lobbies[0].players.length;k++)
        {
          if(socket.id==lobbies[0].players[k].id)
          {
            console.log(lobbies[0].players[k]);

            io.in(lobbies[0].lobbyId).emit('incommingMessage', message,lobbies[0].players[k].username);
          }
        }

    });
    socket.on('userStartedGame',function(){
      console.log("user has started the game");
      gameStarted==true;
        //game is started and player count is > than 3
        //if the player count is more than 3, start the game
          if (lobbies[0].players.length >= 3) {
            //setting the drawer
               result=next_turn(lobbies[0]);
              console.log("result of the next turn");
              console.log(result);
          }

          if(result==1)
          {
            //if result is 1(the game finish code-exit the game)
            return 0;
          }
            //setting ither players to watch when a player is made a drawer
            io.in(lobbies[0].lobbyId).emit('letsWatch', lobbies[0].drawingPlayer, lobbies[0].lastDataUrl);
            io.to(socket.id).emit('makeaguess', lobbies[0].drawingPlayer);

      io.in(lobbies[0].lobbyId).emit('updateSB', lobbies[0].players, lobbies[0].drawingPlayer);
    });

    socket.on('view', function(dataURL) {
        let currLobby = playerLobbies[socket.id];
        if (currLobby) {
            currLobby.lastDataUrl = dataURL;
            io.in(currLobby.lobbyId).emit('letsWatch', socket.id, dataURL);
        }
    });

    socket.on('guess', function(word) {
      //add logic to save points to user
        let currLobby = playerLobbies[socket.id];
        if (currLobby && socket.id != currLobby.drawingPlayer && word == currLobby.word && !currLobby.guessedPlayers.includes(socket.id)) {
            io.to(socket.id).emit('guessRes', "CORRECT!");
            //find the player who answered correctly and broadcast that he answered
            //correctly
            for(var k=0;k<currLobby.players.length;k++)
            {
              if(socket.id==currLobby.players[k].id)
              {

                io.in(currLobby.lobbyId).emit('boradcastAnsweredWord',currLobby.players[k].username,word);


              }
            }

            let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
            currLobby.players[i].score += (60 - Math.ceil((Date.now() - startTime - currLobby.timer._idleStart) / 1000)) + 1;
            let j = currLobby.players.map(function(e) { return e.id; }).indexOf(currLobby.drawingPlayer);
            currLobby.players[j].score += 20;
            io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
            console.log("pushing the player which has guessed");
            console.log(socket.id);
            currLobby.guessedPlayers.push(socket.id);
        } else if (currLobby && socket.id != currLobby.drawingPlayer && word != currLobby.word && !currLobby.guessedPlayers.includes(socket.id)) {
            io.to(socket.id).emit('guessRes', "TRY AGAIN!");
        }
    });

    socket.on('disconnect', function() {
        let currLobby = playerLobbies[socket.id];
        if (!currLobby) return;
        let i = currLobby.players.map(function(e) { return e.id; }).indexOf(socket.id);
        console.log(currLobby.players[i].username + " disconnected!");
        currLobby.players.splice(i, 1);
        io.in(currLobby.lobbyId).emit('disconnectSound');

        if (socket.id == currLobby.drawingPlayer) {
            currLobby.lastDataUrl = null;
            if (currLobby.players.length > 0) {
                clearInterval(currLobby.timer);

                clearInterval(currLobby.timeLeft);
                threeMinTimeout=0;
                if (i < currLobby.players.length)
                    currLobby.drawingPlayer = currLobby.players[i].id;
                else
                    currLobby.drawingPlayer = currLobby.players[0].id;
                let rnd = Math.floor(Math.random() * totalWords);
                collection.findOne({ _id: rnd }, (err, res) => {
                    if (err) return console.error(err);
                    io.to(currLobby.drawingPlayer).emit('letsDraw', res.word);
                    currLobby.word = res.word;
                    currLobby.guessedPlayers = [];
                });
                if (currLobby.players.length > 1) {
                    io.in(currLobby.lobbyId).emit('letsWatch', currLobby.drawingPlayer, currLobby.lastDataUrl);
                    io.in(currLobby.lobbyId).emit('makeaguess', currLobby.drawingPlayer);
                    next_turn(currLobby);
                    io.in(currLobby.lobbyId).emit('timer', "180");
                } else {
                    io.in(currLobby.lobbyId).emit('waiting');
                    let j = lobbies.map(function(e) { return e.lobbyId; }).indexOf(currLobby.lobbyId);
                    lobbies.splice(j, i);
                    lobbies.splice(0, 0, currLobby);
                }
            } else {
                lobbies = lobbies.filter(function(lobby) {
                    return lobby.lobbyId != currLobby.lobbyId;
                });
            }
        }

        if (currLobby.players.length < 2) {
            clearInterval(currLobby.timer);
            clearInterval(currLobby.timeLeft);
            threeMinTimeout=0;
            io.in(currLobby.lobbyId).emit('waiting');
        }

        io.in(currLobby.lobbyId).emit('updateSB', currLobby.players, currLobby.drawingPlayer);
    });
});

function next_turn(lobby) {
  //set an interval for the round and add function to it
    lobby.timer = setInterval(function() {
      //map players in lobby
        let i = lobby.players.map(function(e) { return e.id; }).indexOf(lobby.drawingPlayer);
        lobby.lastDataUrl = null;
        console.log("***player map(current position)***");
        console.log(i);

        if (i < lobby.players.length - 1) {
          //if we have 3 players, i is 1(1<3-1),
          //not the last player(let the next player be the drawer)
            lobby.drawingPlayer = lobby.players[i+1].id;
            console.log("***drawing player****");
            console.log(lobby.drawingPlayer);

        } else {
          //last player
            console.log("last player");
            console.log("***all players in the game***");
            console.log(lobby.players);
            var wonCount;
            //save the data of the players current game in the database
            for(var j=0;j<lobby.players.length;j++)
            {
              wonCount=0;
              //getting the players that guessed correctly(won a round)
              for (var k=0;k<lobby.guessedPlayers.length;k++)
              {
                console.log(lobby.guessedPlayers);
                console.log("guessed players");
                console.log("guessed number");

                console.log(k);
                console.log("current guessed player");

                console.log(lobby.guessedPlayers[k]);
                //checking the socket.id-s
                if(lobby.guessedPlayers[k]==lobby.players[j].id)
                  wonCount++;

              }
              console.log("***changing the players game status***");
              dbo.saveScore(lobby.players[j].username,lobby.players[j].score,wonCount,function(res){
                console.log("returned :");
                console.log(res);

            });
            }

            //send to frontend that the game is finished(add styles and scoreboard)
            io.in(lobbies[0].lobbyId).emit('gameFinished');

            return 1;
        //    lobby.drawingPlayer = lobby.players[0].id;
          //  console.log("***drawing player****");
          //  console.log(lobby.drawingPlayer);
        }
        //find random word
        let rnd = Math.floor(Math.random() * totalWords);
        collection.findOne({ _id: rnd }, (err, res) => {
            if (err) return console.error(err);
            io.to(lobby.drawingPlayer).emit('letsDraw', res.word);
            lobby.word = res.word;
            lobby.guessedPlayers = [];
        });
        //player who has drawen now watches
        io.in(lobby.lobbyId).emit('letsWatch', lobby.drawingPlayer, lobby.lastDataUrl);
        io.in(lobby.lobbyId).emit('makeaguess', lobby.drawingPlayer);
        io.in(lobby.lobbyId).emit('updateSB', lobby.players, lobby.drawingPlayer);
        io.in(lobby.lobbyId).emit('nextTurn');
    }, 180000);

    //setting the timer
    lobby.timeLeft = setInterval(function() {
      //get secconds
      if(threeMinTimeout==0)
      {
        threeMinTimeout+=Math.ceil(Date.now());
      }else {
        var change=(Math.ceil(Date.now()))-threeMinTimeout;
        console.log("three min timeout before the sh");
        console.log(threeMinTimeout);
        threeMinTimeout+=Math.ceil(change)/1000;

      }
        console.log("three min timeout");
        console.log(threeMinTimeout);


        console.log("time now");//threeMinTimeout) / 1000 ));//startTime - lobby.timer._idleStart) / 1000));
        let timeleft = (180 - Math.ceil((Date.now() -startTime - lobby.timer._idleStart) / 1000));
        console.log("time now");
        console.log(Date.now());
        console.log("start time");
        console.log(startTime/1000);
        console.log("Idle start");
        console.log(lobby.timer._idleStart/1000);
        console.log("Skupaj");
        console.log(Math.ceil((Date.now() - startTime - lobby.timer._idleStart) / 1000));
        console.log("Skupaj2");
        console.log(Math.ceil((Date.now() - threeMinTimeout) / 1000));

        io.in(lobby.lobbyId).emit('timer', timeleft.toString());
    }, 1000);
    return 0;
    lobby.timeLeftAfterAnswer = setInterval(function() {

        let timeleft = (10 - Math.ceil((Date.now() - startTime - lobby.timer._idleStart) / 1000));
        io.in(lobby.lobbyId).emit('timer', timeleft.toString());
    }, 1000);
    return 0;
}
