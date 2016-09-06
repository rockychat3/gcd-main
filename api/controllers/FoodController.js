var time = 48 * 60 * 60 * 1000;

module.exports = {

  setRates: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('quantity') && req.param('mix')) {

      if (req.param('quantity') < 50 || req.param('quantity') > 100) {
        res.status(400);
        return res.json({ status: 'Enter a quantity between 50 and 100' });
      }

      if (req.param('mix') < 0 || req.param('mix') > 100) {
        res.status(400);
        return res.json({ status: 'Enter a mix between 0 and 100' });
      }

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 5`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid' });
        }

        Resource.query(`SELECT hex.id FROM resource INNER JOIN hex ON resource.hex=hex.id WHERE resource.owner = ${req.param('user_id')} ${req.param('plot_id') ? `AND hex.label = '${req.param('plot_id')}'` : ''}`, function (e, resource) {

          if (!resource.rows.length) {
            res.status(404);
            return res.json({ status: 'No food found' });
          }

          Food.query(`UPDATE food SET food.rate = ${req.param('quantity')}, food.mix = ${req.param('mix')} FROM food INNER JOIN resource ON resource.id=food.resource WHERE resource.owner = ${req.param('user_id')} ${req.param('plot_id') ? `AND resource.hex = ${resource.rows[0].id}` : ''}`, function (error, food) {
            return res.json({ status: 'Success' });
          });
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

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 5`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }
      
        Food.query(`SELECT food.rate, food.type, hex.label, resource.amount FROM food INNER JOIN resource ON food.resource=resource.id INNER JOIN hex ON hex.id=resource.hex WHERE resource.owner = ${req.param('user_id')} ORDER BY food.type ASC`, function (error, food) {
          
          if (!food.rows.length) {
            res.status(404);
            return res.send('No automatic allocations found');
          }

          var hexes = {};
          for (var i in food.rows) {
            hexes[food.rows[i].label] = { staple_quantity: undefined, staple_rate: undefined, premium_quantity: undefined, premium_rate: undefined }
          }

          for (var i in food.rows) {
            if (food.rows[i].type == 4) {
              hexes[food.rows[i].label].staple_quantity = food.rows[i].amount;
              hexes[food.rows[i].label].staple_rate = food.rows[i].rate;
            }
            else {
              hexes[food.rows[i].label].premium_quantity = food.rows[i].amount;
              hexes[food.rows[i].label].premium_rate = food.rows[i].rate;
            }
          }
          return res.json(hexes);
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: not enough/incorrect parameters entered');
    }
  }
    
}