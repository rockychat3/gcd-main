var bcrypt = require('bcrypt-nodejs');  // module used to hash passwords

module.exports = {
  
  //  /players/create_user/
  //  admin action for creating new users
  //    token auth required (admin only)
  //    required inputs: name (of new player), email (of new player)
  //    optional input: usertype ("admin" or "government", or "human" is default)
  //    response: user object
  create_user: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the provided password
    AuthService.password_authenticate(req, res, true, function (req, res) { //this call actually ends at the end of the function

      // checks for all required user input
      if (!req.param('name')) return RespService.e(res, 'Missing name');
      if (!req.param('email')) return RespService.e(res, 'Missing email');
      
      //creates array "new_user" with all the info provided in the call
      var user = { name: req.param('name'), email: req.param('email'), password: 'changeme' };
      if (req.param('usertype')) user.usertype = req.param('usertype');
      
      return create_user_internal({ req: req, res: res, user: user });
      
      
      
    }); // end password auth
  }, // end action
  
  create_user_internal: function () {
    
    if !('user' in options) return RespService.e(res, 'Internal error: user object missing');
    
    // creates the new user in the database with the new_user object
    Users.create(user)
      .then(function (user_object) { RespService.cb(options, 'users_object', user_object) })
      .catch(function (err) { return RespService.e(res, 'User creation error: ' + err); });
      
      return (req, res, users_object);
      
    }); // end creation
    
    
  }
  
  //  /players/update_user/
  //  allows players to update their name, email, or password
  //    token auth required (players)
  //    required input: user_id (of player to update)
  //    optional inputs: name (of player), email (of player), password (of player)
  //    response: user object
  update_user: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) { 

      // creates array "to_update" and adds name, email, and password variables if they're provided in the API call
      var to_update = {};
      if (req.param('name')) to_update.name = req.param('name');
      if (req.param('email')) to_update.email = req.param('email');
      if (req.param('password')) to_update.password = req.param('password');

      // updates the user of the provided id with the array ("to_update") containing the update information
      Users.update(req.param('user_id'), to_update).exec(function afterwards(err, updated){
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success with user data
      });
    });
  },
  
  //  /players/list_users.
  //  admin action to list all users
  //    token auth required (admin only)
  //    no required input
  //    response: array of user objects without passwords
  list_users: function (req, res) {
      // find all rows of the users table
      Users.find({}).exec(function (err, users_array) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        users_array.forEach(function(user){ delete user.password; }); //for each object in the array of users, delete the password variable
        return RespService.s(res, users_array); // respond success with user objects
      });
  },

  //  /players/list_user/
  //  lists a single user
  //    no token auth required
  //    required input: user_id
  //    response: user object without password
  list_user: function (req, res) {
      // find the row of the users table with the id matching the provided user_id
      Users.findOne(req.param('user_id')).exec(function (err, user_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        if (!user_object) return RespService.e(res, 'User not found in database');
        delete user_object.password;  // remove the password before returning results
        return RespService.s(res, user_object);  // respond success with user object
      });
  },

  //  /players/create_token/
  //  create a new token with a user provided permission level
  //    password auth required (self only)
  //    required inputs: user_id, permission (the microapp being authorized, use "supertoken" for all apps)
  //    optional input: expiration (datetime when token stops working, defaults "false"),
  //    response: token object
  create_token: function (req, res) {
    AuthService.password_authenticate(req, res, false, function (req, res) { 

      // check for all required user input
      if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
      if (!req.param('permission')) return RespService.e(res, 'Missing permission');
      
      // create the token string
      var token_string = Date.now().toString();
      for (var i=0;i<30;i++) {
        var start = Math.random() < 0.5 ? 65 : 97;
        token_string += String.fromCharCode(start+Math.floor(Math.random()*26));
      }
      
      // create array "new_token" with the generated token string and user id
      var new_token = { token: token_string, user: req.param('user_id') };

      if (req.param('permission') == "supertoken") {  // if creating a supertoken, set params and ignore permission
        new_token.supertoken = true;
        Tokens.create(new_token).exec(function (err, token_result){
          if (err) return RespService.e(res, 'Token creation error: ' + err);
          return RespService.s(res, token_result);  // respond success w/ token data
        });
      }
      else {  // if creating a normal token, set the permission id
        Permissions.findOne({ name: req.param('permission') }).exec(function (err, permission) {
          if (err) return RespService.e(res, 'Database fail: ' + err);
          if (!permission) return RespService.e(res, 'Permission not found in database');
          
          new_token.permission = permission.id;  // use the permission id from the database lookup
          Tokens.create(new_token).exec(function (err, token_result){
            if (err) return RespService.e(res, 'Token creation error: ' + err);
            return RespService.s(res, token_result);  // respond success w/ token data
          });
        });
      }
    });
  },

  //  /players/list_tokens/
  //  list all of a given user's tokens
  //    password auth required (self only)
  //    no required inputs
  //    response: array of a player's token objects
  list_tokens: function (req, res) {
    AuthService.password_authenticate(req, res, false, function (req, res) { 
      
      // check for all required user input
      if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
      
      Tokens.find({ user: req.param('user_id') }).exec(function (err, tokens) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, tokens);  // respond success w/ all tokens
      });
    });
  },
  
  // temporary API function to create the initial admin account
  /*first: function (req, res) {
    var new_user = { name: 'Superadmin', email: 'game@admin.com', password: req.param('password'), usertype: 'admin' };
    Users.create(new_user).exec(function (err, users_object){
      if (err) return RespService.e(res, 'SU creation error: ' + err);
      return sails.controllers.finances.beginning_account(req, res, users_object);
      //return RespService.s(res, users_object);  // respond success w/ all tokens
    });
  },
  
  second: function (req, res) {
    sails.controllers.users.second_helper(req, res, req.param('qty'))
  },
  
  second_helper: function (req, res, qty) {
    if (qty > 0) {
      var new_user = { name: 'Player', email: 'change@me.com', password: 'changeme' };
      Users.create(new_user).exec(function (err, users_object){
        if (err) return RespService.e(res, 'SU creation error: ' + err);
        
        var new_account = {account_name: "Default account for "+users_object.id, user_id: users_object.id};
        Accounts.create(new_account).exec(function (err, account_object){
          if (err) return RespService.e(res, 'Account creation error: ' + err);
          return sails.controllers.users.second_helper(req, res, qty-1);
        });
      });
    } else {
      return RespService.s(res, 'done');
    }
  },*/
  
}