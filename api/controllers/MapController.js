module.exports = {

  plot: function (req, res) {
    if (req.param('plot_id')) {
      Hex.query(`SELECT hex.population, player.id, player.name, tier.capacity FROM hex LEFT OUTER JOIN player ON hex.owner=player.id INNER JOIN tier ON hex.tier=tier.tier WHERE hex.label = '${req.param('plot_id')}'`, function (err, hex) {
        if (!hex.rows.length) {
          res.status(404);
          return res.json({population: undefined, capacity: undefined, owner: undefined});
        }
        else if (hex.rows[0].id && hex.rows[0].name) {
          return res.json({ population: hex.rows[0].population, capacity: hex.rows[0].capacity, owner: { owner_id: hex.rows[0].id, owner_name: hex.rows[0].name } });
        }
        else {
          return res.json({ population: hex.rows[0].population, capacity: hex.rows[0].capacity, owner: undefined });
        }
      }); 
    }
    else {
      res.status(400);
      return res.json({ population: undefined, capacity: undefined, owner: undefined });
    }
  },

  growth: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('plot_id')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 1`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid'});
        }
      
        Hex.query(`SELECT id, owner FROM hex WHERE label = '${req.param('plot_id')}'`, function (error, hex) {
          if (!hex.rows.length) {
            res.status(404);
            return res.json({ status: 'Error: Hex not found' });
          }
          else if (hex.rows[0].owner !== req.param('user_id')) {
            res.status(403);
            return res.json({ status: 'Error: You don\'t own this hex' });
          }
          else {
            Player.query(`UPDATE player SET growing = ${hex.rows[0].id} WHERE id = ${req.param('user_id')}`, function (e, player) {
              return res.json({ status: 'Success' });
            });
          }
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: not enough/incorrect parameters entered' })
    }
  },

  residents: function (req, res) {
    if (req.param('user_id')) {
      Player.query(`SELECT hex.label, hex.population, hex.label, tier.capacity FROM player LEFT OUTER JOIN hex ON player.id=hex.owner LEFT OUTER JOIN tier ON hex.tier=tier.id WHERE player.id = ${req.param('user_id')}`, function (err, hexes) {
        if (!hexes.rows.length) {
          res.status(404);
          return res.send('404 User not found');
        }
        else if (!hexes.rows[0].label) {
          return res.json([]);
        }
        else {
          data = [];
          for (var i in hexes.rows) {
            data.push({ plot_id: hexes.rows[i].label, total_residents: hexes.rows[i].population, plot_capacity: hexes.rows[i].capacity });
          }
          return res.json(data);
        }
      });
    }
    else {
      res.status(400);
      return res.json(undefined);
    }
  },

  migrate: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('origin_plot_id') && req.param('destination_plot_id') && req.param('quantity')) {
      
      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 1`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid'});
        }
        else 

        Hex.query(`SELECT label, owner, population FROM hex WHERE label = '${req.param('origin_plot_id')}' OR label = '${req.param('destination_plot_id')}' ORDER BY id ASC`, function (error, hexes) {
          if (hexes.rows.length != 2) {
            res.status(404);
            return res.json({ status: 'Error: Hex(es) not found' });
          }
          else if (hexes.rows[0].owner == req.param('user_id') && hexes.rows[1].owner == req.param('user_id')) {
            var origin = hexes.rows[0].label == req.param('origin_plot_id') ? 0 : 1;
            var dest = origin ? 0 : 1;
            var origin_new, dest_new;

            if (req.param('quantity') % 1 != 0 || req.param('quantity') < -1) {
              res.status(400);
              return res.json({ status: 'Error, please enter a valid whole number quantity or -1 for all' });
            }
            else if (req.param('quantity') == -1) {
              origin_new = 0;
              dest_new = hexes.rows[dest].population + hexes.rows[origin].population;
            }
            else {
              origin_new = hexes.rows[origin].population > req.param('quantity') ? hexes.rows[origin].population - req.param('quantity') : 0;
              dest_new = hexes.rows[origin].population > req.param('quantity') ? hexes.rows[dest].population + req.param('quantity') : hexes.rows[dest].population + hexes.rows[origin].population;
            }

            Hex.query(`UPDATE hex SET population = ${origin_new} WHERE label = '${req.param('origin_plot_id')}'`, function (e1, ohex) {
              Hex.query(`UPDATE hex SET population = ${dest_new} WHERE label = '${req.param('destination_plot_id')}'`, function (e2, dhex) {
                return res.json({ status: 'Success' });
              });
            });
          }
          else {
            res.status(403);
            return res.json({ status: 'Error: You don\'t own this hex' });
          }
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: not enough/incorrect parameters entered' })
    }
  }
    
}