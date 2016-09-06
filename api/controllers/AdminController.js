module.exports = {

  approve: function (req, res) {
    if (req.session.name) {
      // Confirm the user is an admin
      Player.query(`SELECT name FROM player WHERE name = '${req.session.name}' AND admin = true`, function (e, admin) {
        if (!admin.rows.length) {
          res.status(401);
          return res.send('Not an admin');
        }

        Player.query(`INSERT INTO player (name, email, password, money, admin) values ('req.param('name')', 'req.param('email')', 'req.param('password')', 0, false)`, function (err, player) {
          if (err) {
            res.status(500);
            res.send('Unable to add user');
          }

          Temp.query(`DELETE FROM temp WHERE name = 'req.param('name')' AND email = 'req.param('email')'`, function (error, temp) {
            res.send('Success');
          });
        });
      });
    }
    else { 
      res.status(401);
      res.send('Not logged in');
    }
  },

  reject: function (req, res) {
    Player.query(`SELECT name FROM player WHERE name = '${req.session.name}' AND admin = true`, function (e, admin) {
      if (!admin.rows.length) {
        res.status(401);
        return res.send('Not an admin');
      }

      Temp.query(`DELETE FROM temp WHERE name = 'req.param('name')'`, function (err, temp) {
        res.send('Success');
      });
    });
  },

  edit: function (req, res) {
    Player.query(`SELECT name FROM player WHERE name = '${req.session.name}' AND admin = true`, function (e, admin) {
      if (!admin.rows.length) {
        res.status(401);
        return res.send('Not an admin');
      }

      Hex.query(`UPDATE hex SET ${req.param('key')} = ${req.param('value')} WHERE id = ${req.param('hex')}`, function (err, temp) {
        if (err) {
          res.status(400);
          res.send('Unable to edit hex');
        }

        res.send('Success');
      });
    });
  },

  startGame: function (req, res) {
    Player.query(`SELECT name FROM player WHERE name = '${req.session.name}' AND admin = true`, function (e, admin) {
      if (!admin.rows.length) {
        res.status(401);
        res.send('Not an admin');
      }

      start = (new Date()).toLocaleString();
      World.query(`INSERT INTO world VALUES ('${start}', true)`, function (err, result) {
        res.send('Started game on ' + start);
      });
    });
  }

}