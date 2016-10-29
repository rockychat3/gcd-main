var time = 48 * 60 * 60 * 1000;

module.exports = {

  price: function (req, res) {
    if (req.param('resource_type')) {
      Resourcetype.query(`SELECT price FROM resourcetype WHERE type = '${req.param('resource_type')}'`, function (err, type) {
        if (!type.rows.length) {
          res.status(404);
          return res.send('Error: resource type not found');
        }

        var baseprice = type.rows[0].price;
        return res.json({ market: baseprice, ship_sell: baseprice * 0.85, ship_buy: baseprice * 1.15 });
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter the correct parameters');
    }
  },

  shipsell: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_id') && req.param('amount')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 4`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }

        Resource.query(`SELECT resource.hex, resource.amount, resourcetype.price FROM resource INNER JOIN resourcetype ON resource.type=resourcetype.id WHERE resource.id = ${req.param('resource_id')} AND resource.owner = ${req.param('user_id')}`, function (err, resource) {
          
          if (!resource.rows.length) {
            res.status(404);
            return res.send('Error: resource id not found');
          }

          if (resource.rows[0].amount < req.param('amount')) {
            res.status(400);
            return res.send('Error: you attempted to send more than you have');
          }

          if (parseInt(req.param('amount')) == NaN) {
            res.status(400);
            return res.send('Error: couldn\'t parse amount');
          }

          Hex.query(`SELECT id, amount, label FROM hex WHERE id = ${resource.rows[0].hex}`, function (e, hex) {
            if (!hex.rows.length) {
              res.status(404);
              return res.send('Error: hex(es) not found');
            }

            var amount;
            if (req.param('amount') > hex.rows[0].amount) {
              amount = hexes.rows[start].amount;
            }
            else {
              amount = req.param('amount');
            }

            // I'm not implementing a complex travelling salesman
            var distance = Math.abs((req.param('starting_plot').split(''))[0].toUpperCase().charCodeAt(0) - 'H'.charCodeAt(0));
            distance += Math.abs((req.param('starting_plot').split(''))[1] - 41);

            var date = new Date();
            date.setHours(date.getHours() + 12 * distance);

            Movingresource.query(`INSERT INTO movingresource SELECT ${req.param('resource_id')}, 1000, ${amount}, '${date.toLocaleString()}', ${Math.abs(parseInt(req.param('amount')))}, true WHERE NOT EXISTS (SELECT resource FROM movingresource WHERE resource = ${req.param('resource_id')})`, function (er, m) {
              Resource.query(`UPDATE resource SET amount = amount - ${amount} WHERE id = ${req.param('resource_id')}`, function (e, r) {
                return res.json({ date_sold: date.toLocaleString(), amount: resource.rows[0].price * 0.85 * Math.abs(parseInt(req.param('amount'))) });
              });
            });
          });
        });
      });
    }  
    else {
      res.status(400);
      return res.send('Error: please enter the correct parameters');
    }
  },

  shipbuy: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_type') && req.param('amount') && req.param('destination_plot')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 4`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }

        Resourcetype.query(`SELECT id, price FROM resourcetype WHERE type = '${req.param('resource_type')}'`, function (err, type) {
          
          if (!type.rows.length) {
            res.status(404);
            return res.send('Error: resource type not found');
          }

          Hex.query(`SELECT id FROM hex WHERE label = '${req.param('destination_plot')}' AND owner = ${req.param('user_id')}`, function (e, hex) {
            if (!hex.rows.length) {
              res.status(404);
              return res.send('Error: hex not found');
            }

            // I'm not implementing a complex travelling salesman
            var distance = Math.abs((req.param('destination_plot').split(''))[0].toUpperCase().charCodeAt(0) - 'H'.charCodeAt(0));
            distance += Math.abs((req.param('destination_plot').split(''))[1] - 41);

            var date = new Date();
            date.setHours(date.getHours() + 12 * distance);

            Player.query(`SELECT money FROM player WHERE id = ${req.param('user_id')}`, function (e, player) {
              if (player.rows[0].money < type.rows[0].price * 1.15 * Math.abs(parseInt(req.param('amount')))) {
                res.status(400);
                return res.send('Error: not enough money to buy order');
              }

              Movingresource.query(`INSERT INTO movingresource SELECT ${type.rows[0].id}, ${hex.rows[0].id}, ${req.param('amount')}, '${date.toLocaleString()}', ${Math.abs(parseInt(req.param('amount')))}, false WHERE NOT EXISTS (SELECT resource FROM movingresource WHERE resource = ${req.param('resource_id')})`, function (er, m) {
                Hex.query(`SELECT resource.id FROM hex INNER JOIN resource ON resource.hex=hex.id WHERE hex.label = '${req.param('destination_plot')}'`, function (e, re) {
                  if (!re.rows[0].length) {
                    Resource.query(`INSERT INTO resource (owner, hex, amount, type) VALUES (${req.param('user_id')}, ${hex.rows[0].id}, 0, ${type.rows[0].id})`, function (e, r) {

                      Player.query(`UPDATE player SET money = money - ${type.rows[0].price * 1.15 * Math.abs(parseInt(req.param('amount')))} WHERE id = ${req.param('user_id')}`, function (e, p) {
                        Resource.query(`SELECT id FROM resource ORDER BY id DESC LIMIT 1`, function (e, r) {
                          return res.json({ resource_id: r.rows[0].id, completion_date: date.toLocaleString(), amount: type.rows[0].price * 1.15 * Math.abs(parseInt(req.param('amount'))) });
                        });
                      });               

                    });
                  }
                  else {
                    Player.query(`UPDATE player SET money = money - ${type.rows[0].price * 1.15 * Math.abs(parseInt(req.param('amount')))} WHERE id = ${req.param('user_id')}`, function (e, p) {
                      return res.json({ resource_id: re.rows[0].id, completion_date: date.toLocaleString(), amount: type.rows[0].price * 1.15 * Math.abs(parseInt(req.param('amount'))) });
                    });               
                  }
                });
              });
            });
          });
        });
      });
    }  
    else {
      res.status(400);
      return res.send('Error: please enter the correct parameters');
    }
  },
    
}
