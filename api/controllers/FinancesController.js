module.exports = {

   // /finances/create_account/
  //   token auth required
  //   required inputs: name (of new account)
  //   response: account object
  create_account: function (req, res) {
    AuthService.authenticate(req, res, "finances", function (req, res) { 

      // check for all required user input name = account name
      if (!req.param('account_name')) return RespService.e(res, 'Missing name');
      
      var new_account = { account_name: req.param('account_name'), user_id: req.param('user_id')};
      
      Accounts.create(new_account).exec(function (err, account_object){
        if (err) return RespService.e(res, 'Account creation error: ' + err);
        return RespService.s(res, account_object);  // respond success w/ user data
      });
      
    });
  },
  
  // /players/update_user/
  // allows players to update their name or email
  //   token auth required (self or admin)
  //   required input: user_id (of player to update)
  //   optional inputs: name (of player), email (of player)
  //   response: user object
  update_account: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) { 
      
      // check for all required user input
      if (!req.param('user_id')) return RespService.e(res, 'Missing user id');
      if (!req.param('account_id')) return RespService.e(res, 'Missing acount id');
      if (!req.param('new_name')) return RespService.e(res, 'Missing new name');
      Accounts.findOne({user_id: req.param('user_id'), id: req.param('account_id')}).exec(function(err, account_object) {
        // only allow the following attributes to be updated
        var to_update = {};
        if (account_object.new_name) to_update.account_name = req.param('new_name');
        
        Accounts.update(req.param('account_id'),to_update).exec(function afterwards(err, updated){
          if (err) return RespService.e(res, 'Database fail: ' + err);
          return RespService.s(res, updated);  // respond success w/ user data
        });
        
      });

    });
  },
  
  add_money: function (req, res) {
      AuthService.authenticate(req, res, "players", function (req, res) {
      if (!req.param('account_id')) return RespService.e (res, 'Missing account id'); //account id of where admin is injectiong money
      
    
      
      });
  },
  
  // /finances/list_accounts.
  // admin action to list all users
  //   token auth required (admin only)
  //   no required input
  //   response: array of user objects w/o passwords
  list_accounts: function (req, res) {
    
      Accounts.find({}).exec(function (err, accounts_array) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        accounts_array.forEach(function(account){ delete account.amount; });  // don't include the amount in the returned results
        return RespService.s(res, accounts_array);  // respond success w/ user data
      });
  },
  // /finances/check_balances/ shows all of owned balances.
  // 
  check_balances: function (req, res) {
    
    AuthService.authenticate(req, res, "finances", function (req, res) { 
      Accounts.find({}).exec(function (err, accounts_array) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
//        accounts_array.forEach(function(account){ if (account.user_id==); });  // don't include the amount in the returned results
        return RespService.s(res, accounts_array);  // respond success w/ user data
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
      Users.findOne(req.param('user_id')).exec(function (err, user_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        if (!user_object) return RespService.e(res, 'User not found in database');
        delete user_object.password;  // remove the password before returning results
        return RespService.s(res, user_object);  // respond success w/ user data
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