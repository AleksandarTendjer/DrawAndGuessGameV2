/*
Cntroller for all the database logic

*/


var db = require("./dbOperations");
var mongoose=require("mongoose");
// all players
exports.allgamers = function(req, res, next){
	db.allGamers(function(error, gamers){
		if(error){
			return next(error);
		}
		//was an idea
		// res.render("allgamers.html", {gamer: gamer});
	});
}

// new player
exports.new = function(req, res, next){
	var username = req.body.username || "";
	var password = req.body.password || "";
	var avatorId = req.body.avatorId || 1;
	var data = {
		username: username,
		password: password,
		avatorId: avatorId
	}
	db.add(data, function(error, row){
		if(error){
			return next(error);
		}
		res.redirect("/index");
	});
}


exports.view = function(req, res, next){
	res.redirect("/");
}

// get player id
exports.getAvatorId = function(req, res, next){
	var nickname = req.body.nickname;
	db.getAvatorId(nickname, function(error, id){
		if(error){
			console.log("error: "+error);
		}else{
			res.send({
				"avatorId": id
			});
		}
	});
}

// online users list
exports.online = function(user, callback){
	var onlineList = [];
	for(var i=0; i<user.length; i++){
		db.online(user[i], function(error, data){
			onlineList.push(data);
			callback(onlineList);
		});
	}
}
//get status of the  player
exports.getStats=function(req,res){
  console.log("request body");
  console.log(req.body);
  var username=req.body.username;
  db.findByusername(username, function(error, user){
    res.send(user);
});
}
// register
exports.join = function(req, res, next){
	var username = req.body.username;
	var password = req.body.password;
//	var avatorId = //req.body.avatorId;
//=mongoose.Types.ObjectId();
console.log("the user to register is:");
console.log(req.body);

	var data = {
		username: username,
		password: password
	}
	db.add(data, function(error, _password){
		if(error == "same"){
			res.send({
				type: "same name"
			});
		}else{
      console.log("added a user");
			res.send(data);
		}
	});
}


// login
exports.login = function(req, res, next){
  console.log("****body****");
  console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;


	var data = {
		username: username,
		password: password
	//	avatorId: avatorId
	}
	db.login(data, function(error, db_psw){
		if(error){
			console.log("error: "+ error);
		}else{
			if(password == db_psw){
				console.log("sssss")
				// res.send("../Client/views/index.html");
				//res.redirect("/index");
        res.send(data);
			}else{
				res.send({
					type: "error psw"
				});
				return false;
			}
		}
	});
}
