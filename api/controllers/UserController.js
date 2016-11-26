module.exports = {

  // /players/create_user/
  // admin action for creating new users
  //   token auth required (admin only)
  //   required inputs: name (of new player), email (of new player)
  //   optional input: usertype ("admin" or "government", or "human" is default)
  //   response: user object
  create_user: function (req, res) {
    AuthService.authenticate(req, res, "admin", function (req, res) { 

      // check for all required user input
      if (!req.param('name')) return RespService.e(res, 'Missing name');
      if (!req.param('email')) return RespService.e(res, 'Missing email');
      
      var new_user = { name: req.param('name'), email: req.param('email'), password: 'changeme' };
      if (req.param('usertype')) new_user.usertype = req.param('usertype');
      
      Users.create(new_user).exec(function (err, user){
        if (err) return RespService.e(res, 'User creation error: ' + err);
        return RespService.s(res, user);  // respond success w/ user data
      });
      
    });
  },
  
  // /players/update_user/
  // allows players to update their name or email
  //   token auth required (self or admin)
  //   required input: user_id (of player to update)
  //   optional inputs: name (of player), email (of player)
  //   response: user object
  update_user: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) { 

      // only allow the following attributes to be updated
      var to_update = {};
      if (req.param('name')) to_update.name = req.param('name');
      if (req.param('email')) to_update.email = req.param('email');
      if (req.param('password')) to_update.password = req.param('password');

      Users.update(req.param('user_id'),to_update).exec(function afterwards(err, updated){
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success w/ user data
      });

    });
  },
  
  // /players/list_users.
  // admin action to list all users
  //   token auth required (admin only)
  //   no required input
  //   response: array of user objects w/o passwords
  list_users: function (req, res) {
    AuthService.authenticate(req, res, "admin", function (req, res) { 
      
      Users.find({}).exec(function (err, users) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        users.forEach(function(user){ delete user.password; });  // don't include the password in the returned results
        return RespService.s(res, users);  // respond success w/ user data
      });
      
    });
  },

  // /players/list_user/
  // lists a single user
  //   token auth required (self or admin)
  //   required input: user_id
  //   response: user objects w/o password
  list_user: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) { 

      // database lookup by user_id
      Users.findOne(req.param('user_id')).exec(function (err, user) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        if (!user) return RespService.e(res, 'User not found in database');
        delete user.password;  // remove the password before returning results
        return RespService.s(res, user);  // respond success w/ user data
      });
      
    });
  },

  // /players/create_token/
  // create a new token for a given purpose
  //   password auth required (self only)
  //   required inputs: user_id, permission (the microapp being authorized, use "supertoken" for all apps)
  //   optional input: expiration (datetime when token stops working, defaults "false"),
  //   response: token object
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
      
      var new_token = { token: token_string, user: req.param('user_id') };

      if (req.param('permission') == "supertoken") {  // if creating a supertoken, set params and ignore permission
        new_token.supertoken = true;
        Tokens.create(new_token).exec(function (err, token_result){
          if (err) return RespService.e(res, 'Token creation error: ' + err);
          return RespService.s(res, token_result);  // respond success w/ token data
        });
      } else {  // if creating a normal token, set the permission id
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

  // /players/list_tokens/
  // list all of a given user's tokens
  //   password auth required (self only)
  //   no required inputs
  //   response: array of a player's token objects
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

}