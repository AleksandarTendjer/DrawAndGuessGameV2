/*
Cntroller for all the database logic

*/


var db = require("./dbOperations");
var mongoose=require("mongoose");
// 显示所有玩家
exports.allgamers = function(req, res, next){
	db.allGamers(function(error, gamers){
		if(error){
			return next(error);
		}
		// 显示所有玩家
		// res.render("allgamers.html", {gamer: gamer});
	});
}

// 注册玩家
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

// 获取头像id
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

// 在线人数
exports.online = function(user, callback){
	var onlineList = [];
	for(var i=0; i<user.length; i++){
		db.online(user[i], function(error, data){
			onlineList.push(data);
			callback(onlineList);
		});
	}
}

exports.getStats=function(req,res){
  console.log("request body");
  console.log(req.body);
  var username=req.body.username;
  db.findByusername(username, function(error, user){
    res.send(user);
});
}
// 注册
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


// 登陆
exports.login = function(req, res, next){
  console.log("****body****");
  console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;
	//var avatorId =req.body.avatorId;
	//res.cookie("nickname", nickname);
	//res.cookie("avatorId", avatorId);

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
