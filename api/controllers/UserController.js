var time = 48 * 60 * 60 * 1000;

module.exports = {

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