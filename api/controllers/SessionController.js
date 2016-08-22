module.exports = {

  login: function (req, res) {

    Player.query(`SELECT id, name FROM player WHERE email = '${req.param('email')}' AND password = '${req.param('password')}'`, function (err, results) {
      if (!results.rows.length) return res.send('Unable to log in');

      req.session.name = results.rows[0].name;
      req.session.key = results.rows[0].id;

      return res.send('Logged in');
    });
  },

  logout: function (req, res) {
    req.session.destroy(function (err) {
      return res.send('Logged out');
    });
  },

  createToken: function (req, res) {
    if (!req.session.name) {
      res.status(401);
      res.send('No current session available, log in to receive a token!');
    }
    else {
      if (req.param('type') <= 6 || req.param('type') >= 1) {

        token = Date.now().toString();
        for(var i=0;i<30;i++) {
          start = Math.random() < 0.5 ? 65 : 97;
          token += String.fromCharCode(start+Math.floor(Math.random()*26));
        }
        
        Token.query(`INSERT INTO token (string, player, type) VALUES ('${token}', ${req.session.key}, ${req.param('type')})`, function (err, results) {
          if (err) {
            res.status(500);
            return res.send('Could not add token to table');
          }

          // Expire any still active tokens of the same type and player
          Token.query(`UPDATE token SET expired = true WHERE type = ${req.param('type')}) AND player = ${req.session.key} AND token != '${token}'`, function (error, result) {
            return res.send(token);
          });

        });
      }

      else {
        res.status(400);
        return res.send('Index type out of range');
      }
    }
  }

}