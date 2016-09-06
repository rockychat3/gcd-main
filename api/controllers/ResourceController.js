var time = 48 * 60 * 60 * 1000;

module.exports = {

  mine: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('plot_id') && req.param('quantity')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 3`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }

        Hex.query(`SELECT resourcetype.type, hex.amount, hex.resource, hex.id FROM hex INNER JOIN resourcetype ON hex.resource=resourcetype.id WHERE hex.label = '${req.param('plot_id')}'`, function (er, hex) {
          if (!hex.rows.length) {
            res.status(404);
            return res.send('Error: no resource/hex found');
          }

          var actual_mined = hex.rows[0].amount > req.param('quantity') ? req.param('quantity') : hex.rows[0].amount;
          var actual_left = hex.rows[0].amount > req.param('quantity') ? hex.rows[0].amount - req.param('quantity') : 0; 
        
          Resource.query(`SELECT amount, id FROM resource WHERE owner = ${req.param('user_id')} AND type = ${hex.rows[0].resource} AND hex = ${hex.rows[0].id}`, function (errr, resource) {
            if (!resource.rows.length) {
              Resource.query(`INSERT INTO resource (owner, hex, amount, type) VALUES (${req.param('user_id')}, ${hex.rows[0].id}, ${actual_mined}, ${hex.rows[0].resource})`, function (r1, s1) {
                Hex.query(`UPDATE hex SET amount = ${actual_left} WHERE label = '${req.param('plot_id')}')`, function (r2, s2) {
                  return res.json({ quantity: actual_mined, type: hex.rows[0].type });
                });
              });
            }
            else {
              actual_mined += resource.rows[0].amount;
              
              Resource.query(`UPDATE resource SET amount = ${actual_mined} WHERE hex = ${hex.rows[0].id}`, function (r, s) {
                Hex.query(`UPDATE hex SET amount = ${actual_left} WHERE label = '${req.param('plot_id')}')`, function (r2, s2) {
                  return res.json({ quantity: actual_mined, type: hex.rows[0].type });
                });
              });
            }
          });
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  move: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_id') && req.param('destination_plot') && req.param('amount')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 3`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }

        Resource.query(`SELECT hex, type, amount FROM resource WHERE id = ${req.param('resource_id')} AND owner = ${req.param('user_id')}`, function (err, resource) {
          
          if (!resource.rows.length) {
            res.status(404);
            return res.send('Error: resource id not found');
          }

          Hex.query(`SELECT id, amount, label FROM hex WHERE id = ${resource.rows[0].hex} OR label = ${req.param('destination_plot').toUpperCase()}`, function (e, hexes) {
            if (hexes.rows.length != 2) {
              res.status(404);
              return res.send('Error: hex(es) not found');
            }

            var start = hexes.rows[0].id == resource.rows[0].hex ? 0 : 1;

            var amount;
            if (req.param('amount') > hexes.rows[start].amount) {
              amount = hexes.rows[start].amount;
            }
            else {
              amount = req.param('amount');
            }

            // I'm not implementing a complex travelling salesman, suck my nuts 
            var distance = Math.abs((hexes[start].label.split(''))[0].toUpperCase().charCodeAt(0) - (req.param('destination_plot').split(''))[0].toUpperCase().charCodeAt(0));
            distance += Math.abs((hexes[start].label.split(''))[1]  - (req.param('destination_plot').split(''))[1]);

            var date = new Date();
            date.setHours(date.getHours() + 12 * distance);

            Movingresource.query(`INSERT INTO movingresource SELECT ${resource.rows[0].type}, ${hexes.rows[Math.abs(start - 1)].id}, ${amount}, '${date.toLocaleString()}', false WHERE NOT EXISTS (SELECT resource FROM movingresource WHERE resource = ${req.param('resource_id')})`, function (er, m) {
              Resource.query(`UPDATE resource SET amount = amount - ${amount} WHERE id = ${req.param('resource_id')}`, function (e, r) {
                return res.json({ completion_date: date.toDateString() });
              });
            });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  estimate: function (req, res) {
    if ((req.param('resource_id') || req.param('starting_plot')) && req.param('destination_plot')) {

      if (req.param('starting_plot')) {
        Hex.query(`SELECT id FROM hex WHERE label = ${req.param('starting_plot').toUpperCase()} OR label = ${req.param('destination_plot').toUpperCase()}`, function (e, hexes) {
          if (hexes.rows.length != 2) {
            res.status(404);
            return res.send('Error: hexes not found');
          }

          // I'm not implementing a very complex travelling salesman, suck my nuts 
          var distance = Math.abs((req.param('starting_plot').split(''))[0].toUpperCase().charCodeAt(0) - (req.param('destination_plot').split(''))[0].toUpperCase().charCodeAt(0));
          distance += Math.abs((req.param('starting_plot').split(''))[1] - (req.param('destination_plot').split(''))[1]);

          var date = new Date();
          date.setDate(date.getDate() + distance);
          return res.json({ completion_date: date.toDateString() });
        });
      }
      else {
        Resource.query(`SELECT hex FROM resource WHERE id = ${req.param('resource_id')}`, function (err, resource) {
          
          if (!resource.rows.length) {
            res.status(404);
            return res.send('Error: resource id not found');
          }

          Hex.query(`SELECT id, label FROM hex WHERE id = ${resource.rows[0].hex} OR label = ${req.param('destination_plot').toUpperCase()}`, function (e, hexes) {
            if (hexes.rows.length != 2) {
              res.status(404);
              return res.send('Error: hex(es) not found');
            }

            var start = hexes.rows[0].id == resource.rows[0].hex ? 0 : 1;

            // I'm not implementing a complex travelling salesman, suck my nuts 
            var distance = Math.abs((hexes[start].label.split(''))[0].toUpperCase().charCodeAt(0) - (req.param('destination_plot').split(''))[0].toUpperCase().charCodeAt(0));
            distance += Math.abs((req.param('starting_plot').split(''))[1] - (req.param('destination_plot').split(''))[1]);

            var date = new Date();
            date.setDate(date.getDate() + distance);
            return res.json({ completion_date: date.toDateString() });
          });
        });
      }
      
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },  

  realify: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_id')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 3`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json({ status: 'Error: token not valid' });
        }

        Resource.query(`SELECT id FROM resource WHERE id = ${req.param('resource_id')}`, function (e, resource) {
          if (!resource.rows.length) {
            res.status(404);
            return res.json({ status: 'Error: no resource found' });
          }

          Resource.query(`DELETE FROM resource WHERE id = ${req.param('resource_id')}`, function (er, r) {
            return res.json({ status: 'Success' });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: please enter in the correct parameters' });
    }
  },

  digify: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('plot_id') && req.param('resource_type') && req.param('quantity')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.send('Error: Token has expired, please generate a new one');
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 3`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.send('Error: token not valid');
        }

        Resourcetype.query(`SELECT id FROM resourcetype WHERE type = '${req.param('resource_type')}'`, function (er, type) {
          if (!type.rows.length) {
            res.status(404);
            return res.send('Error: resource type not found');
          }

          Hex.query(`SELECT id FROM hex WHERE label = ${req.param('plot_id')} AND owner = ${req.param('user_id')}`, function (e, hex) {
            if (!hex.rows.length) {
              res.status(404);
              return res.send('Error: no hex found that you own');
            }

            Resource.query(`SELECT id, amount FROM resource WHERE id = ${req.param('resource_id')}`, function (e, resource) {
              if (!resource.rows.length()) {
                Resource.query(`INSERT INTO resource (owner, hex, amount, type) VALUES (${req.param('user_id')}, ${hex.rows[0].id}, ${Math.abs(parseInt(req.param('quantity')))}, ${type.rows[0].id})`, function (e, r) {
                  Resource.query(`SELECT id FROM resource WHERE owner = ${req.param('user_id')} ORDER BY id DESC LIMIT 1`, function (e, r) {
                    if (req.param('resourcetype') == 'basic food' || req.param('resourcetype') == 'premium food') {
                      Food.query(`INSERT INTO food (resource, resourcetype, rate, mix) VALUES (r.rows[0].id, ${req.param('resourcetype') == 'basic food' ? 4 : 5}, 50, 50)`, function (e, food) {
                        return res.json({ resource_id: r.rows[0].id });
                      });
                    }

                    return res.json({ resource_id: r.rows[0].id });
                  });
                });
              }
              else {
                var total = Math.abs(parseInt(resource.rows[0].amount + req.param()));

                Resource.query(`UPDATE resource SET amount = ${total} WHERE id = ${resource.rows[0].id}`, function (e, r) {
                  return res.json({ resource_id: resource.rows[0].id });
                });
              }
            });
          });
        });
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  view: function (req, res) {
    if (req.param('user_id')) {
      Player.query(`SELECT resource.id, resource.amount, resourcetype.type, hex.label FROM player INNER JOIN resource ON resource.owner=player.id INNER JOIN resourcetype ON resource.type=resourcetype.id WHERE player.id = ${req.param('user_id')}`, function (err, resources) {
        if (!resources.rows.length) {
          res.status(404);
          return res.send('Error: no resources found for player');
        }

        var data = [];
        for (var i in resources.rows) {
          data.push({ resource_id: resources.rows[i].id, type: resources.rows[i].type, location: resources.rows[i].label, quantity: resources.rows[i].amount });
        }

        return res.json(data);
      });
      
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  transfer: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_id') && req.param('recipient_id')) {

      // Automatically expire the token if it is now exprired
      if (parseInt(req.param('token').substr(0,13)) + time < Date.now()) {
        Token.query(`UPDATE token SET expired = true WHERE string = '${req.param('token')}'`, function (e, result) {
          res.status(403);
          return res.json({ status: 'Error: Token has expired, please generate a new one' });
        });
      }

      Token.query(`SELECT id FROM token WHERE string = '${req.param('token')}' AND player = ${req.param('user_id')} AND expired = false AND permission = 3`, function (err, token) {
        if (!token.rows.length) {
          res.status(401);
          return res.json('Error: token not valid');
        }

        Player.query(`SELECT resource.id, resource.owner FROM player INNER JOIN resource ON resource.owner=player.id WHERE player.id = ${req.param('user_id')} AND resource.id = ${req.param('resource_id')}`, function (error, resource) {
          if (!resource.rows.length) {
            res.status(404);
            return res.json({ status: 'Error: you don\'t own the desired resource' });
          }
          
          Resource.query(`UPDATE resource SET OWNER = ${req.param('recipient_id')}`, function (er, r) {
            if (err) {
              res.status(404);
              return res.json({ status: 'Error: recipient not found' });
            } 

            return res.json({ status: 'Success' });
          });
        });        
      });
    }
    else {
      res.status(400);
      return res.json({ status: 'Error: please enter in the correct parameters' });
    }
  }
    
}