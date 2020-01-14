var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var userSchema = new Schema({
  username: String,
  password: String,
  userId: {
    type: Number,
    default: 1
  },
  createData: Date,
  modifydate: {
    type: Date,
    default: Date.now()
  },
  score: {				//score of the player
    type: Number,
    default: 0
  },
  guessCount:{
    type: Number,
    default: 0
  },
  gamesCount: Number		//Reputation
}, {collection: 'user'});
module.exports = mongoose.model('user', userSchema);
