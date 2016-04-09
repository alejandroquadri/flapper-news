var mongoose = require('mongoose');
var crypto = require('crypto');


var UserSchema = new mongoose.Schema({
  username: {
    type:String,
    lowercase:true,
    unique:true
  },
  hash:String,
  salt:String
});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');

  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  console.log(this.hash);
  return this.hash === hash;
};

mongoose.model('User',UserSchema);
