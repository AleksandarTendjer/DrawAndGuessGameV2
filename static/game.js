/*jshint esversion: 6 */

(function() {
    let socket = io();
    "use strict"; // jshint ignore:line
    //https://www.reddit.com/r/discordapp/comments/4ytdf0/where_are_sound_files_stored/
    let joinSound = new Audio('static/sfx/joinSound.mp3');
    let disconnectSound = new Audio('static/sfx/disconnectSound.mp3');
    //http://soundbible.com/tags-tick.html
    let tick = new Audio('static/sfx/tick.mp3');
    //https://www.freesoundeffects.com/cat/correct-292/
    let correct = new Audio('static/sfx/correct.mp3');
    //https://www.youtube.com/watch?v=4k8XfsqkU3o
    let nextTurn = new Audio('static/sfx/nextTurn.mp3');

    let alphanumeric = /^[0-9a-zA-Z]+$/;

    let msgID = document.getElementById('msgID');
    msgID.addEventListener('keyup', function onEvent(e) {
        if (e.keyCode === 13) {
            if (msgID.value.match(alphanumeric)) {
                msgID.placeholder = "What is your guess?";

                socket.emit("guess", msgID.value.toLowerCase());
                msgID.value = "";
            } else {
                msgID.placeholder = "invalid input";
                msgID.value = "";
            }
        }
    });
    //hiding elements on login
      document.getElementById("canvasDraw").style.display = "none";
    document.getElementById("canvasView").style.display = "none";
    hideClass(document.getElementsByClassName("utils"));
    hideClass(document.getElementsByClassName("msg"));
    showClass(document.getElementsByClassName("start-btn"));
    hideClass(document.getElementsByClassName("word"));
    hideClass(document.getElementsByClassName("info"));
    hideClass(document.getElementsByClassName("drawing"));
    hideClass(document.getElementsByClassName("chat-section"));
    hideClass(document.getElementsByClassName("type_me"));
    hideClass(document.getElementsByClassName("type_normal"));
    hideClass(document.getElementsByClassName("type_private"));
    hideClass(document.getElementsByClassName("type_right"));

    //have to create the login logic here(when loggedIn)
    let usernameID = document.getElementById('usernameID');

    var regisertForm= document.getElementById('registerForm');
    var loginForm= document.getElementById('loginForm');
    var startBtn= document.getElementById('start-game-btn');



function registrationFun(data)
{
  var username=data.username.value;
  var password=data.password.value;

//add user
  $.post({
      type: 'POST',
      url: 'http://localhost:3000/regster',
    //  contentType: "application/json",
  data: {username:username,password:password},//JSON.stringify(Status),
    //dataType: "json",
      //$.toJSON({ sendData: dataPackage })
      success: function(data){
        //redirect to login
        debugger;
          alert("The user has been succesfully created! ");

          window.location.assign('http://localhost:3000/');
        //change the value of the field that was changed
        //  location.reload();
    },          error: function(XMLHttpRequest, textStatus, errorThrown) {
                    debugger;
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }

  });

}
function loggedInFunction(data) {
//  usernameID.addEventListener('keyup', function onEvent(e) {
  //    if (e.keyCode === 13) {
    //      if (usernameID.value.match(alphanumeric)) {

              document.getElementsByClassName("login-section")[0].style.display = "none";
              showClass(document.getElementsByClassName("utils"));
              //this is where we emit the new player

              socket.emit('newPlayer',data.username/* usernameID.value*/);
              showClass(document.getElementsByClassName("word"));
              showClass(document.getElementsByClassName("info"));
              showClass(document.getElementsByClassName("drawing"));
              showClass(document.getElementsByClassName("chat-section"));


          }



function loginFun(username,password)
{
  //event.preventDefault();
	debugger;
	//username or password(mainly username for now )

//add user
  $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/login/',
    //  contentType: "application/json",
  data: {username:username,password:password},
  success:function(data){
    debugger;
  loggedInFunction(data);
},
error: function()
{
  alert("incorrect password");
}
			//JSON.stringify(Status),
});
}
//start game
startBtn.addEventListener('click',function(e){
e.preventDefault();
  //socket.emit('view');
  socket.emit('userStartedGame');
});

loginForm.addEventListener("submit",function(e){
debugger;
e.preventDefault();
  loginFun(this.email.value,this.password.value)
});

    function hideClass(cls) {
        for (let elem of cls) {
            elem.style.display = "none";
        }
    }

    function showClass(cls) {
        for (let elem of cls) {
            elem.style.display = "initial";
        }
    }

    socket.on('joinSound', function() {
        joinSound.play();
    });

    socket.on('disconnectSound', function() {
        disconnectSound.play();
    });

    socket.on('nextTurn', function() {
        nextTurn.play();
    });

    socket.on('updateSB', function(players, drawingPlayer) {
        let turns = document.getElementById('turnsID');
        turns.innerHTML = '';
        for (let player of players) {
            let div = document.createElement('div');
            div.className = 'playerCard';
            if (player.id == drawingPlayer) {
                div.id = 'drawingPlayerCard';
            }
            div.innerHTML =
                '<div class="scoreBoard">' +
                '<div>' + player.username + '</div>' +
                '<div>' + player.score + '</div>' +
                '</div>' +
                '<div class="arrowRight"></div>';
            turns.appendChild(div);
        }

        //end card
        let end = document.createElement('div');
        end.className = 'endOfRound';
        end.innerHTML = '<div>END OF ROUND!</div>';
        turns.appendChild(end);
    });

    socket.on('guessRes', function(res) {
        let wordElem = document.getElementById('wordID');
        wordElem.textContent = res;
        if (res == "CORRECT!")
            correct.play();
    });

    socket.on('timer', function(timeleft) {
        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = timeleft + "\r\nSECONDS\r\nREMAINING!";
        if (parseInt(timeleft) <= 5) {
            tick.play();
        }
    });
    socket.on('boradcastAnsweredWord',function(username,word){
      //say who anwered the questions correctly
      debugger;
    var chat=document.getElementsByClassName('chat_content_inner')[0];
    var html='<div class="chat_message type_normal cf"><p class="message"> '+username+' just guessed correctly the word '+word+'</p></div>';
    var htmlObj=$(html);
    chat.append(htmlObj[0]);

    });
    socket.on('waiting', function() {
        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = "WAITING FOR\r\nADDITIONAL\r\nPLAYERS...";
    });

    socket.on('waitingtoStart', function(leaderSocket) {
      console.log('waiting to start');
      console.log(socket.id);

      if(socket.id==leaderSocket){
        showClass(document.getElementsByClassName("start-btn"));
    }else{
        infoElem = document.getElementById('infoID');
        infoElem.setAttribute('style', 'white-space: pre;');
        infoElem.textContent = "WAITING FOR\r\nPLAYER TO\r\n START THE\r\nGAME\r\n";
      }
    });
    socket.on('gameFinished',function(){
      console.log("the game is finished");
      var infoHeaderBig=document.getElementsByClassName('all_elems')[0];
        infoHeaderBig.innerHTML='';
        infoHeaderBig.innerHTML='<h1 align="center">The game has been finished.Want to have another one.<h1>';
        infoHeaderBig.innerHTML='  <button type="submit" class="btn btn-primary btn-block">play another game</button>';

    });
    socket.on('letsWatch', function(leaderSocket, dataURL) {
        if (socket.id != leaderSocket) {
            document.getElementById("canvasDraw").style.display = "none";
            document.getElementById("canvasView").style.display = "initial";
            hideClass(document.getElementsByClassName("utils"));
            showClass(document.getElementsByClassName("msg"));

            let context = document.getElementById("canvasView").getContext("2d");
            let image = new Image();
            image.onload = function() {
                context.clearRect(0, 0, canvasView.width, canvasView.height);
                context.drawImage(image, 0, 0);
            };
            if (dataURL)
                image.src = dataURL;
            else {
                let context = document.getElementById("canvasView").getContext("2d");
                context.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
            }
        }
    });

    socket.on('makeaguess', function(leaderSocket) {
        if (socket.id != leaderSocket) {
            let wordElem = document.getElementById('wordID');
            wordElem.textContent = "Make a guess...";
        }
    });

    socket.on('letsDraw', function(word) {
        document.getElementById("canvasDraw").style.display = "initial";
        document.getElementById("canvasView").style.display = "none";
        showClass(document.getElementsByClassName("utils"));
        hideClass(document.getElementsByClassName("msg"));

        let wordElem = document.getElementById('wordID');
        wordElem.textContent = "It's your turn to draw: " + word.toUpperCase();

        let context = document.getElementById("canvasDraw").getContext("2d");

        // canvas drawing functions base code from
        // http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/ and
        // https://github.com/ThierrySans/CSCC09/blob/master/lectures/02/src/html5/js/draw.js
        let clickX = [];
        let clickY = [];
        let clickDrag = [];
        let clickColor = [];
        let clickSize = [];
        let paint = false;
        let currentColor = "#000000";
        let currentSize = 4;

        let prepareCanvas = function() {
            clearCanvas();

            canvasDraw.onmousedown = function(e) {
                let rect = canvasDraw.getBoundingClientRect();
                let mouseX = e.pageX - this.offsetLeft;
                let mouseY = e.pageY - this.offsetTop;

                let scaleX = canvasDraw.width / rect.width;
                let scaleY = canvasDraw.height / rect.height;

                paint = true;
                addClick(mouseX * scaleX, mouseY * scaleY, false);
                redraw();
            };

            canvasDraw.onmousemove = function(e) {
                if (paint) {
                    let rect = canvasDraw.getBoundingClientRect();
                    let mouseX = e.pageX - this.offsetLeft;
                    let mouseY = e.pageY - this.offsetTop;

                    let scaleX = canvasDraw.width / rect.width;
                    let scaleY = canvasDraw.height / rect.height;

                    addClick(mouseX * scaleX, mouseY * scaleY, true);
                    redraw();
                }
            };

            canvasDraw.onmouseup = function(e) {
                paint = false;
            };

            canvasDraw.onmouseleave = function(e) {
                paint = false;
            };
        };

        function addClick(x, y, dragging) {
            clickX.push(x);
            clickY.push(y);
            clickDrag.push(dragging);
            clickColor.push(currentColor);
            clickSize.push(currentSize);
        }

        let clearCanvas = function() {
            context.clearRect(0, 0, canvasDraw.width, canvasDraw.height);
        };

        let redraw = function() {
            clearCanvas();
            context.lineJoin = "round";
            for (let i = 0; i < clickX.length; i++) {
                if (clickX[i] == -1)
                    clearCanvas();
                else {
                    context.beginPath();
                    if (clickDrag[i] && i)
                        context.moveTo(clickX[i - 1], clickY[i - 1]);
                    else
                        context.moveTo(clickX[i] - 1, clickY[i]);
                    context.lineTo(clickX[i], clickY[i]);
                    context.closePath();
                    context.strokeStyle = clickColor[i];
                    context.lineWidth = clickSize[i];
                    context.stroke();
                }
            }
            let dataURL = canvasDraw.toDataURL();
            socket.emit('view', dataURL);
        };

        let resetCanvas = function() {
            if (clickX[clickX.length - 1] == -1)
                return;
            clickX.push(-1);
            clickY.push(null);
            clickDrag.push(null);
            clickColor.push(null);
            clickSize.push(null);
            redraw();
        };

        let undoLast = function() {
            clickX.pop();
            clickY.pop();
            clickDrag.pop();
            clickColor.pop();
            clickSize.pop();
            redraw();
        };

        let changeColor = function() {
            currentColor = this.value;
        };

        let setSizeSmall = function() {
            currentSize = 2;
        };

        let setSizeRegular = function() {
            currentSize = 4;
        };

        let setSizeBig = function() {
            currentSize = 8;
        };

        // function base code from
        // https://stackoverflow.com/questions/79816/need-javascript-code-for-button-press-and-hold
        function heldDown(btn, action, initial, start = initial) {
            let t;

            let repeat = function() {
                action();
                t = setTimeout(repeat, start);
                if (start > 8)
                    start = start / 2;
            };

            btn.onmousedown = function() {
                repeat();
            };

            btn.onmouseup = function() {
                clearTimeout(t);
                start = initial;
            };

            btn.onmouseleave = btn.onmouseup;
        }

        prepareCanvas();
        document.getElementById("clearID").onclick = resetCanvas;
        heldDown(document.getElementById("undoID"), undoLast, 250);
        document.getElementById("colorID").oninput = changeColor;
        document.getElementById("smallID").onclick = setSizeSmall;
        document.getElementById("mediumID").onclick = setSizeRegular;
        document.getElementById("largeID").onclick = setSizeBig;
    });
})();
