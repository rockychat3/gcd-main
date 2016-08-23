module.exports = {

  balance: function (req, res) {
     if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  transactions: function (req, res) {
    if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  send: function (req, res) {
    if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  request: function (req, res) {
    if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  view: function (req, res) {
    if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  approve: function (req, res) {
    if (req.param('user_id') && req.param('token')) {
      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (error, player) {
          if (!player.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          return res.json({ amount: player.rows[0].money })
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  }

}