var bcrypt = require('bcrypt-nodejs');  // module used to hash passwords

module.exports = {
  attributes: {
    // the player's first and last name as a text string
    name: {  
      type: 'text',
      notNull: true
    },
    // the player's email address, must be unique for login purposes
    // note: use +something in gmail address to allow one person many accounts
    // ex: andy+extra@gmail.com when my real email is andy@gmail.com
    email: {  
      type: 'text',
      email: true,
      notNull: true
    },
    // the player's password, but hashed for protection of passwords
    password: {  
      type: 'text',
      notNull: true
    },
    // the type of user, generally a normal 'human', or admin, or town or county gov't
    usertype: {  
      type: 'string',
      enum: ['human', 'government', 'admin', 'corporation'],
      defaultsTo: 'human'
    },
    // this is a soft reference to the many tokens a player has, 
    // but the database key is stored in the tokens table
    tokens: {  
      collection: 'tokens',
      via: 'user'
    }
  },
  
  // this code runs before a password is added to the database -- 
  // it hashes the plain text password to make it more secure and overwrites the original
  beforeValidate: function (values, cb) {
    // Hash password
    if (!values.password) {
      cb();  // back out if no password
    } else {
      bcrypt.hash(values.password, null, null, function(err, hash) {  // 10 means 2^10 rehashes
        if(err) return cb(err);
        values.password = hash;  // overwrites original
        cb();  // callback, completes the function unless you give it a parameter (then acts as error)
      });
    }
  }
};