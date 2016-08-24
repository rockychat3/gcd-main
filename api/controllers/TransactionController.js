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
          
          var transactions = transact.rows;

          if (req.param('start_date')) {
            var date = new Date(req.param('start_date'));
            if (date == 'Invalid Date') {
              res.status(400);
              return res.send('Error: malformed start_date');
            }

            var pass = [];
            for (var i in transactions) {
              if (new Date(transactions[i].date) >= date) {
                pass.push(transactions[i]);
              }
            }
            transactions = pass;
            pass = [];
          }

          if (req.param('end_date')) {
            var date = new Date(req.param('end_date'));
            if (date == 'Invalid Date') {
              res.status(400);
              return res.send('Error: malformed end_date');
            }

            var pass = [];
            for (var i in transactions) {
              if (new Date(transactions[i].date) <= date) {
                pass.push(transactions[i]);
              }
            }
            transactions = pass;
            pass = [];
          }

          if (req.param('recipient_id')) {
            var pass = [];
            for (var i in transactions) {
              if (transactions[i].receiving == req.param('recipient_id')) {
                pass.push(transactions[i]);
              }
            }
            transactions = pass;
            pass = [];
          }

          if (req.param('payer_id')) {
            var pass = [];
            for (var i in transactions) {
              if (transactions[i].sending == req.param('payer_id')) {
                pass.push(transactions[i]);
              }
            }
            transactions = pass;
            pass = [];
          }

          if (req.param('limit')) {
            if (req.param('limit') < 0) {
              res.status(400);
              return res.send('Error: please enter a positive limit');
            }

            transactions.splice(req.param('limit'));
          }

          return res.json(transactions);
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  send: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('recipient_id') && req.param('amount') && req.param('reason')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid' });
        }
      
        Player.query(`SELECT id, money FROM player WHERE id = ${req.param('user_id')} OR id = ${req.param('recipient_id')}`, function (error, players) {
          if (players.rows.length != 2) {
            res.status(404);
            return res.json({ status: 'Error: player(s) not found' });
          }
          
          var self = players.rows[0].id == req.param('user_id') ? 0 : 1;
          var rec = self ? 0 : 1;
          var self_new, rec_new;

          if (req.param('amount') % 1 != 0 || req.param('amount') <= 0) {
            res.status(400);
            return res.json({ status: 'Error: please enter a positive whole number' });
          }
          else {
            self_new = players.rows[self].money > req.param('amount') ? players.rows[self].money - req.param('amount') : 0;
            rec_new = players.rows[self].money > req.param('amount') ? players.rows[rec].money + req.param('amount') : players.rows[rec].money + players.rows[self].money;
          }

          Player.query(`UPDATE player SET money = ${self_new} WHERE id = ${req.param('user_id')}`, function (e1, oplayer) {
            Player.query(`UPDATE player SET money = ${rec_new} WHERE id = ${req.param('recipient_id')}`, function (e2, rplayer) {
              
              Transaction.query(`INSERT INTO transaction (sending, receiving, amount, date, reason, complete) VALUES (${req.param('user_id')}, ${req.param('recipient_id')}, ${req.param('amount')}, (new Date().toLocaleString()), ${req.param('reason')}, true)`, function (m,t) {
                return res.json({ status: 'Success' });
              });
                
            });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: not enough/incorrect parameters entered' });
    }
  },

  request: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('player_id') && req.param('amount') && req.param('reason')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid' });
        }
      
        Player.query(`SELECT id, money FROM player WHERE id = ${req.param('user_id')} OR id = ${req.param('recipient_id')}`, function (error, players) {
          if (players.rows.length != 2) {
            res.status(404);
            return res.json({ status: 'Error: player(s) not found' });
          }
          
          var self = players.rows[0].id == req.param('user_id') ? 0 : 1;
          var send = self ? 0 : 1;
          var self_new, send_new;

          if (req.param('amount') % 1 != 0 || req.param('amount') <= 0) {
            res.status(400);
            return res.json({ status: 'Error: please enter a positive whole number' });
          }
          else {
            send_new = players.rows[send].money > req.param('amount') ? players.rows[send].money - req.param('amount') : 0;
            self_new = players.rows[send].money > req.param('amount') ? players.rows[self].money + req.param('amount') : players.rows[self].money + players.rows[send].money;
          }

          Player.query(`UPDATE player SET money = ${self_new} WHERE id = ${req.param('user_id')}`, function (e1, oplayer) {
            Player.query(`UPDATE player SET money = ${send_new} WHERE id = ${req.param('player_id')}`, function (e2, rplayer) {
              
              Transaction.query(`INSERT INTO transaction (sending, receiving, amount, date, reason, complete) VALUES (${req.param('player_id')}, ${req.param('user_id')}, ${req.param('amount')}, (new Date().toLocaleString()), ${req.param('reason')}, false)`, function (m,t) {
                return res.json({ status: 'Sent' });
              });
                
            });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: not enough/incorrect parameters entered' });
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
      
        Transaction.query(`SELECT id, receiving, amount, reason, date FROM player WHERE sending = ${req.param('user_id')} AND complete = false ORDER BY id ASC`, function (error, transact) {
          if (!transact.rows.length) {
            res.status(404);
            return res.send('Error: no requests found');
          }
          
          return res.json(transact.rows);
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  },

  approve: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('request_id')) {
      
      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 2`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid');
        }
      
        Transaction.query(`SELECT id FROM transaction WHERE id = ${req.param('request_id')}`, function (error, request) {
          if (!request.rows.length) {
            res.status(404);
            return res.json({ status: 'Error: request not found' });
          }
          
          Transaction.query(`UPDATE transaction SET complete = true WHERE id = ${req.param('request_id')}`, function (er, a) {
            return res.json({ status: 'Sent' });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: not enough/incorrect parameters entered' });
    }
  }

}