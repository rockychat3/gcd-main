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
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  move: function (req, res) {
    if (req.param('user_id') && req.param('token') && req.param('resource_id') && req.param('destination_plot')) {

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
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  estimate: function (req, res) {
    if ((req.param('resource_id') || req.param('starting_plot')) && req.param('destination_plot')) {

      
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },  

  realify: function (req, res) {
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
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter in the correct parameters');
    }
  },

  digify: function (req, res) {
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