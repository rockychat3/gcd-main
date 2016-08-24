module.exports = {

  balance: function (req, res) {
     if (req.param('user_id') && req.param('token')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

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

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Transaction.query(`SELECT sending, receiving, amount, date, reason FROM transaction WHERE sending = ${req.param('user_id')} OR receiving = ${req.param('user_id')}`, function (error, transact) {
          if (!transact.rows.length) {
            res.status(404);
            return res.send('Error: player not found');
          }
          
          var transactions = [];
          if (req.param('start_date')) {

          }
          if (req.param('end_date')) {
            
          }
          if (req.param('recipient_id')) {
            
          }
          if (req.param('payer_id')) {
            
          }
          if (req.param('limit')) {
            
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

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

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

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

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

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

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
      
      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

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