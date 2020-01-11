/*
 * -----------DAO------------
 * @ Aleksandar Tendjer
 * -------------------------
 *
 */


var dburl = 'mongodb://localhost:27017/DrawAndGuessGame' // link  to MongoDB


var mongoose = require('mongoose');
//user scheme
var User = require('./models/user.js');
//room scheme

exports.connect = function(){
	mongoose.connect(dburl)
	  .then(() =>  console.log('connection succesful'))
	  .catch((err) => console.error(err));
}

exports.disconnect = function(callback){
	mongoose.disconnect(callback);
}

exports.setup = function(callback){
	callback(null);
}





//working entity(addidng input items in this function
var userEntity = new User();

exports.emptyData = {}

// add user
exports.add = function(data, callback){
	userEntity.username = data.username;
	userEntity.password = data.password;
//	userEntity.userId = data.userId;
	console.log("data to insert");
	console.log(data);
	console.log("User entity");
	console.log(userEntity);

	// if somebody is registered with this username, it should not be used yet again
	exports.findByusername(data.username, function(error, user){
	    if(error){
	    	console.log(error);
	    }else{
	    	if(!user){
	    		userEntity.save(function(error){
					if(error){
						console.log("error in registering" + error);
					}else{
						console.log("*****************");
						console.log(userEntity.username);
						console.log(userEntity.password);
	//					console.log(userEntity.userId);
						console.log("*****************");
						callback(null);
					}
				});
	    	}else{

	    		callback("same user");
	    	}
	    }
	});

}

// enter username get id(username is also unique)
exports.getuserId = function(username, callback){
	exports.findByusername(username, function(error, user){
	    if(error) {
	        // console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	// console.log("id"+user);
	    	callback(null, user.userId)
	    }
	});
}
exports.online = function(username, callback){
	exports.findByusername(username, function(error, user){
	    if(error) {
	        callback("error", error);
	    } else {
	    	callback(null, {
	    		userId: user.userId,
	    		username: user.username,
	    		score: user.score
	    	});
	    }
	});
}


// verification of login
exports.login = function(data, callback){
	console.log("****db operations login*****");
	exports.findByusername(data.username, function(error, user){
		console.log("done finding te user");
			if(error) {
	        console.log("FATAL " + error);
	        callback("error", error);
	    } else {
				//the user is null
				console.log("found the user");
	    	console.log(user);
	    	callback(null, user.password);
	    }
	});
}

// delete the user
exports.delete = function(id, callback){
	exports.findUserById(id, function(error, user){
		if(error){
			callback(error)
		}else{
			console.log("delete success");
			user.remove();
			callback(null);
		}
	});
}
exports.userProfile = function(username, callback){
	exports.findByusername(username, function(error, user){
	    if(error) {
	        // console.log("FATAL " + error);
	        callback("error", error);
	    } else {
	    	// console.log("id"+user);
	    	callback(null, user);
	    }
	});
}


// add a score
exports.saveScore = function(username, score,guessCount, callback){
	exports.findByusername(username, function(error, user){
		if(error){
			callback(error);
		}else{
			user.modifydate = new Date();
			user.score = score;
      user.guessCount=guessCount;
      //add one more game(three round)
      user.gamesCount=user.gameCount+1;
      user.markModified("score");
      user.markModified("gameCount");
      user.markModified("guessCount");

      user.markModified("modifydate");
			user.save(function(error){
				if(error){
					console.log("FATAL " + error);
					callback(error);
				}else{
					callback(null);
				}
			});
		}
	});
}


exports.allUsers = function(callback){
	User.find({}, callback);
}


//finding data by id
var findUserById = exports.findUserById = function(id, callback){
    User.findOne({_id: id}, function(error, user){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, user);
    });
}

// finding data by name
exports.findByusername = function(username, callback) {
    User.findOne({username: username}, function(error, user){
        if(error){
            console.log('FATAL ' + error);
            callback(error, null);
        }
        callback(null, user);
    });
}
