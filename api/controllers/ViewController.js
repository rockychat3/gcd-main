module.exports = {

  board: function (req, res) {
    if (req.session.name) 
      return res.view('board', {title: 'Board', user: req.session.name});
    else 
      return res.redirect('/login');
  },

  region: function (req, res) {
    if (req.session.name) {

      if (region[req.param('id')] == undefined)
        return res.view('region', {title: 'Region ' + req.param('id'), missing: undefined, top: undefined, hexes: undefined, user: req.session.name});

      else {
        query = 'SELECT label, owner, tier FROM hex WHERE ';
        for (var i in region[req.param('id')].hexes) {
          query += `id BETWEEN ${i} AND ${region[req.param('id')].hexes[i]} OR `;
        }
        query = query.substring(0, query.length - 3);
        query += ' ORDER BY id ASC';

        Hex.query(query, function (err, result) {  
          return res.view('region', {title: 'Region ' + req.param('id'), missing: region[req.param('id')].missing, top: region[req.param('id')].top, hexes: result.rows, user: req.session.name});
        });
      }
    }
    else 
      return res.redirect('/login');
  },

  hex: function (req, res) {
    if (req.session.name) {   
      Hex.query(`SELECT hex.label, hex.tier, hex.power, hex.water, hex.population, player.name, resource.amount, resourcetype.type FROM hex LEFT OUTER JOIN player ON hex.owner=player.id LEFT OUTER JOIN resource ON resource.hex=hex.id LEFT OUTER JOIN resourcetype ON resource.type=resourcetype.id WHERE hex.label = '${req.param('id')}'`, function (err, hex) {
        if (!result.rows.length)
          return res.view('hex', {title: 'Hex ' + req.param('id'), hex: undefined, user: req.session.name});

        return res.view('hex', {title: 'Hex ' + req.param('id'), hex: hex.rows, user: req.session.name});
      });
    }
    else 
      return res.redirect('/login');
  },

  player: function (req, res) {
    if (req.session.name) {
      Player.query(`SELECT player.id, player.name, player.money, hex.label FROM player LEFT OUTER JOIN hex ON hex.owner=player.id WHERE player.name = '${req.param('name')}' ORDER BY hex.id ASC`, function (err, player) {
        if (!player.rows.length)
          return res.view('player', {title: 'Player ' + req.param('name'), player: undefined, user: req.session.name, curr: false});
        else if (player.rows[0].name == req.session.name)
          return res.view('player', {title: 'Player ' + req.param('name'), player: player.rows, user: req.session.name, curr: true});

        return res.view('player', {title: 'Player ' + req.param('name'), player: player.rows, user: req.session.name, curr: false});
      });
    }
    else 
      return res.redirect('/login');
  },

  login: function (req, res) {
    return res.view('login', {title: 'Log in', user: req.session.name});
  },

  register: function (req, res) {
    return res.view('register', {title: 'Register'});
  },

  admin: function (req, res) {
    if (req.session.name) {
      var async = require('async');

      // Confirm the user is an admin
      Player.query(`SELECT name FROM player WHERE name = '${req.session.name}' AND admin = true`, function (e, admin) {
        if (!admin.rows.length) {
          res.status(401);
          return res.redirect('/');
        }

        async.series({
          temp: function (callback) {
            Temp.query(`SELECT name, email, password FROM temp`, function (err, temps) {
              if (err)
                callback(err, null);

              callback(null, temps.rows);
            });
          },
          player: function (callback) {
            Player.query(`SELECT name FROM player WHERE admin = false`, function (err, players) {
              if (err)
                callback(err, null);

              callback(null, players.rows);
            });
          },
          hex: function (callback) {
            Hex.query(`SELECT label FROM hex ORDER BY id ASC`, function (err, hexes) {
              if (err)
                callback(err, null);

              callback(null, hexes.rows);
            });
          },
          type: function (callback) {
            Resourcetype.query(`SELECT type FROM resourcetype`, function (err, type) {
              if (err)
                callback(err, null);

              callback(null, type.rows);
            });
          },
          started: function (callback) {
            World.query(`SELECT start FROM world`, function (err, start) {
              if (err)
                callback(err, null);

              callback(null, start.rows.length >= 1);
            });
          }
        }, function (err, data) { 
          return res.view('admin', {title: 'Admin Control', temp: data.temp, players: data.player, hexes: data.hex, resources: data.type, started: data.started, user: req.session.name })
        });
      });
    }
    else 
      return res.redirect('/login');
  }

}

// region var defining region characteristics
var region = {
  "A": {
    "missing": -1,
    "top": true,
    "hexes": {
      "1": "10",
      "40": "49",
      "80": "89",
      "119": "128",
      "159": "168",
      "198": "207",
      "238": "247",
      "277": "286"
    }
  },
  "B": {
    "missing": 0,
    "top": true,
    "hexes": {
      "10": "20",
      "50": "59",
      "89": "99",
      "129": "138",
      "168": "178",
      "208": "217",
      "247": "257",
      "287": "296"
    }
  },
  "C": {
    "missing": 0,
    "top": true,
    "hexes": {
      "20": "30",
      "60": "69",
      "99": "109",
      "139": "148",
      "178": "188",
      "218": "227",
      "257": "267",
      "297": "306"
    }
  },
  "D": {
    "missing": 1,
    "top": true,
    "hexes": {
      "30": "39",
      "70": "79",
      "109": "118",
      "149": "158",
      "188": "197",
      "228": "237",
      "267": "276",
      "307": "316"
    }
  },
  "E": {
    "missing": -1,
    "top": false,
    "hexes": {
      "317": "326",
      "357": "366",
      "396": "405",
      "436": "445",
      "475": "484",
      "516": "525",
      "554": "563",
      "594": "603"
    }
  },
  "F": {
    "missing": 0,
    "top": false,
    "hexes": {
      "327": "336",
      "366": "376",
      "406": "415",
      "445": "455",
      "485": "494",
      "525": "535",
      "564": "573",
      "603": "613"
    }
  },
  "G": {
    "missing": 0,
    "top": false,
    "hexes": {
      "337": "346",
      "376": "476",
      "416": "425",
      "455": "465",
      "495": "504",
      "534": "544",
      "574": "583",
      "613": "623"
    }
  },
  "H": {
    "missing": 1,
    "top": false,
    "hexes": {
      "347": "356",
      "386": "395",
      "426": "435",
      "465": "474",
      "505": "514",
      "544": "553",
      "584": "593",
      "623": "632"
    }
  },
}
