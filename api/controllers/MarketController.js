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

        Resource.query(`SELECT hex FROM resource WHERE id = ${req.param('resource_id')}`, function (err, resource) {
          
          if (!resource.rows.length) {
            res.status(404);
            return res.send('Error: resource id not found');
          }

          Hex.query(`SELECT id, label FROM hex WHERE id = ${resource.rows[0].hex}`, function (e, hex) {
            if (hex.rows.length != 2) {
              res.status(404);
              return res.send('Error: hex(es) not found');
            }

            var start = hex.rows[0].id == resource.rows[0].hex ? 0 : 1;

            // I'm not implementing a complex travelling salesman, suck my nuts 
            var distance = Math.abs((hex[start].label.split(''))[0].toUpperCase().charCodeAt(0) - 'H'.charCodeAt(0));
            distance += Math.abs((req.param('starting_plot').split(''))[1] - (req.param('destination_plot').split(''))[1]);

            var date = new Date();
            date.setDate(date.getDate() + distance);

            Movingresource.query(`INSERT INTO movingresource SELECT ${req.param('resource_id')}, '${date.toDateString()}' WHERE NOT EXISTS (SELECT resource FROM movingresource WHERE resource = ${req.param('resource_id')})`, function (er, m) {
              Resource.query(`UPDATE resource SET hex = null WHERE id = ${req.param('resource_id')}`, function (e, r) {
                return res.json({ completion_date: date.toDateString() });
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

        Resource.query(`SELECT resource.hex, resourcetype.price FROM resource INNER JOIN resourcetype ON resource.type=resourcetype.id WHERE resource.id = ${req.param('resource_id')}`, function (err, resource) {
          
          if (!resource.rows.length) {
            res.status(404);
            return res.send('Error: resource id not found');
          }

          Hex.query(`SELECT id, label FROM hex WHERE id = ${resource.rows[0].hex}`, function (e, hex) {
            if (!hex.rows.length) {
              res.status(404);
              return res.send('Error: hex not found');
            }

            // I'm not implementing a complex travelling salesman, suck my nuts 
            var distance = Math.abs((hex[0].label.split(''))[0].toUpperCase().charCodeAt(0) - 'H'.charCodeAt(0));
            distance += Math.abs((req.param('starting_plot').split(''))[1] - (req.param('destination_plot').split(''))[1]);

            var date = new Date();
            date.setDate(date.getDate() + distance);

            Movingresource.query(`INSERT INTO movingresource SELECT ${req.param('resource_id')}, '${date.toDateString()}' WHERE NOT EXISTS (SELECT resource FROM movingresource WHERE resource = ${req.param('resource_id')})`, function (er, m) {
              Resource.query(`UPDATE resource SET hex = null WHERE id = ${req.param('resource_id')}`, function (e, r) {
                return res.json({ completion_date: date.toDateString(),  });
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

  // sell: function (req, res) {

  // },

  // buy: function (req, res) {

  // }
    
}