module.exports = {

  // /players/user_data/
  // POST user_id: user_id of player of interest
  // RETURN status: “success” or “error: reason...”
  // RETURN data: {object: id, name, and email}
  user_data: function (req, res) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).exec(function (err, user) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      if (!user) return RespService.e(res, 'User not found in database');
      
      delete user.password;  // remove the password before returning results
      return RespService.s(res, user);  // respond success w/ user data
    });
    
  },


  // /players/update_user/
  // POST user_id: user_id of player of interest
  // POST token: player token used for authentication of this task (string)
  // POST (optional) name: player’s new name
  // POST (optional) email: player’s new email
  // POST (optional) password: player’s new password in plaintext
  // RETURN status: “success” or “error: reason...”
  // RETURN data: {object: id, name, and email}
  update_user: function (req, res) {
    //var return_json = authenticate(req, res);
    
    if (!req.param('user_id')) {  // if any parameters are missing
      return_json.status = 'Error: At least one required parameter is missing';
      return res.json(return_json);
    }
    
    Users.find({  // database lookup
      id: req.param('user_id')  // match input id to database
    }).exec(function (err, results) {
      
      if (err) {  // if the database barfs
        return_json.status = 'Error: Database lookup problem. Check input data.';
        return res.json(return_json);
      }
      if (!results.length) {  // if there are no results from the lookup
        return_json.status = 'Error: User not found in system';
        return res.json(return_json);
      }
      
      var user = results[0];  // the first result is our user
      delete user.password;  // remove the password before returning results
      return_json.data = user;  // set the cleaned up user data in the return object
      return res.json(return_json);
    });
    
  },

  // /players/authenticate/
  // POST user_id: user_id of player of interest
  // POST token: player token used for authentication of this task (string)
  // POST permission: the type of permission being requested, i.e. banking, mining, etc. (string, matches string in “players_permissions” table)
  // RETURN status: “success” or “error: reason...”
  // RETURN user_id: user_id of player
  // RETURN token_id: the database id of the token used for tracking purposes
  
  // /players/create_user/
  // POST token: player token used for authentication of this task (string)
  // POST name: player’s new name
  // POST email: player’s new email
  // RETURN status: “success” or “error: reason...”
  // RETURN data: {object: id, name, and email}
  
  // /players/issue_token/
  // POST user_id: user_id of player of interest
  // POST password: player’s password in plaintext
  // POST permissions: [array of ids for permission types]
  // POST (optional): expiration: datetime (when it expires) or “false”
  // RETURN status: “success” or “error: reason...”
  // RETURN data: {object: token, expiration, and [array of permissions]}
  
  // /players/list_tokens/
  // POST user_id: user_id of player of interest
  // POST password: player’s password in plaintext
  // RETURN status: “success” or “error: reason...”
  // RETURN data: [array of {object: token, expiration, and [array of permissions]}]

  
  
  // @TODO: break this up into a UI login that does server session and user authentication as its own API method
  login: function (req, res) {

    Users.find({
      email: req.param('email')
    }).exec(function (err, results) {
      // first handle all error cases on login
      if (err) {
        console.log(err)
        return res.send('Error: ' + err);
      }
      if (!results.length) return res.send('User not found in system');
      var user = results[0];
      if (req.param('password') != user.password) return res.send('Password is incorrect');

      // next store the logged-in user with a server session
      req.session.name = results.name;
      req.session.key = results.id;
      return res.send('Logged in');
    });
    
  },


  logout: function (req, res) {
    req.session.destroy(function (err) {
      if (err) {
        console.log(err)
        return res.send('Error: ' + err);
      }
      return res.send('Logged out');
    });
  },


  createToken: function (req, res) {
    if (!req.session.name) {
      res.status(401);
      res.send('No current session available, log in to receive a token!');
    }
    else {
      if (req.param('type') <= 5 || req.param('type') >= 1) {

        token = Date.now().toString();
        for(var i=0;i<30;i++) {
          start = Math.random() < 0.5 ? 65 : 97;
          token += String.fromCharCode(start+Math.floor(Math.random()*26));
        }
        
        Token.query(`INSERT INTO token (string, player, permission) VALUES ('${token}', ${req.session.key}, ${req.param('type')})`, function (err, results) {
          if (err) {
            res.status(500);
            return res.send('Could not add token to table');
          }

          // Expire any still active tokens of the same type and player
          Token.query(`UPDATE token SET expired = true WHERE permission = ${req.param('type')} AND player = ${req.session.key} AND string != '${token}'`, function (error, result) {
            return res.send(token);
          });

        });
      }

      else {
        res.status(400);
        return res.send('Index type out of range');
      }
    }
  },

  register: function(req, res) {
    if (req.param('name') && req.param('email') && req.param('password')) {
      Temp.query(`INSERT INTO temp (name, email, password) VALUES ('${req.param('name')}', '${req.param('email')}', '${req.param('password')}')`, function (err, temp) {
        return res.send('Success');
      });  
    }
    else {
      res.status(400);
      return res.send('Please enter in all fields');
    }
  },

  data: function (req, res) {
    // TODO
  },

  user: function (req, res) {
    if (req.param('user_id')) {
      Player.query(`SELECT player.name, hex.label FROM player LEFT OUTER JOIN hex ON hex.owner=player.id WHERE player.id = ${req.param('user_id')}`, function (err, player) {
        if (!player.rows.length) {
          res.status(404);
          return res.send('User not found, try again');
        }

        var data = {};
        data.name = player.rows[0].name;
        data.properties = player.rows.map((hex) => hex.label);
        return res.json(data);
      });
    }
    else {
      res.status(400);
      return res.send('user_id field not present, try again');
    }
  },

  authenticate: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('purpose')) {

      // Automatically expire the token if it is now expired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one', token_id: undefined });
        });
      }

      Token.query(`SELECT token.id, token.expired FROM token INNER JOIN permission ON token.permission=permission.id WHERE token.string = '${req.param('token')}' AND token.player = ${req.param('user_id')} AND permission.permission = '${req.param('purpose')}'`, function (err, token) {
        if (!token.rows.length) {
          res.status(404);
          return res.json({ status: 'Error: Token not found, try again', token_id: undefined });
        }
        else if (token.rows[0].expired) {
          res.status(403);
          return res.json({status: 'Error: Token has expired, please generate/use a new one', token_id: undefined});
        }
        else {
          return res.json({ status: 'success', token_id: token.rows[0].id });
        }
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: Please enter all required fields', token_id: undefined });
    }
  }

}