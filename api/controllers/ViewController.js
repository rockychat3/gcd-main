var pg = require('pg');

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

        // var config = {
        //   user: req.session.db_name,
        //   password: req.session.password,
        //   host: openshift,
        //   port: openshift port,
        //   database: db;
        // };
        // var client = new pg.Client(config);

        // client.connect(function (err) {
          
          // query = 'select id, owner from game.hex where ';
          // for (var i in region[req.param('id')].hexes) {
          //   query += 'key between ' + parseInt(i) + ' and ' + parseInt(region[req.param('id')].hexes[i] + ' AND '
          // }
          // query = query.substring(0, query.length - 4);

          // client.query(query, function (err, result) {  
            return res.view('region', {title: 'Region ' + req.param('id'), missing: region[req.param('id')].missing, top: region[req.param('id')].top, hexes: undefined, user: req.session.name});
          // });
        // }
      }
    }
    else 
      return res.redirect('/login');
  },

  hex: function (req, res) {
    if (req.session.name) {
      // var config = {
      //   user: req.session.db_name,
      //   password: req.session.password,
      //   host: openshift,
      //   port: openshift port,
      //   database: db;
      // };
      // var client = new pg.Client(config);

      // client.connect(function (err) {
          
        // client.query('select * from game.hex where id = ' + req.param('id'), function (err, result) {
        //   if (!result)
        //     return res.view('hex', {title: 'Hex ' + req.param('id'), hex: undefined, user: req.session.name});

          return res.view('hex', {title: 'Hex ' + req.param('id'), hex: undefined, user: req.session.name});
        // });
    }
    else 
      return res.redirect('/login');
  },

  resources: function (req, res) {
    if (req.session.name) {
      // var config = {
      //   user: req.session.db_name,
      //   password: req.session.password,
      //   host: openshift,
      //   port: openshift port,
      //   database: db;
      // };
      // var client = new pg.Client(config);

      // client.connect(function (err) {

        // client.query('select hex.owner, player.name from hex inner join player on hex.player=player.id where hex.id = ' + req.param('id'), function (err, result) {
        //   if (result.name != req.session.name)
        //     return res.redirect('/hex/' + req.param('id'));

          return res.view('resources', {title: 'Resources for Hex ' + req.param('id'), user: req.session.name});
        // });
      // });
    }
    else 
      return res.redirect('/login');
  },

  player: function (req, res) {
    if (req.session.name) {
      // var config = {
      //   user: req.session.db_name,
      //   password: req.session.password,
      //   host: openshift,
      //   port: openshift port,
      //   database: db;
      // };
      // var client = new pg.Client(config);

      // client.connect(function (err) {

        // client.query('select player.name, player.money, hex.id from player inner join hex on hex.player=player.id where player.name = ' + req.param('name'), function (err, result) {
        //   if (!result)
        //     return res.view('player', {title: 'Player ' + req.param('name'), player: undefined, user: req.session.name, curr: false});
        //   else if (result[0].name == req.session.name)
        //     return res.view('player', {title: 'Player ' + req.param('name'), player: result, user: req.session.name, curr: true});

          return res.view('player', {title: 'Player ' + req.param('name'), player: /*result*/undefined, user: req.session.name, curr: false});
        // });
      // });
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
      // var config = {
      //   user: req.session.db_name,
      //   password: req.session.password,
      //   host: openshift,
      //   port: openshift port,
      //   database: db;
      // };
      // var client = new pg.Client(config);

      // client.connect(function (err) {
      //   client.query('show is_superuser', function (err, result) {
      //     if (result.is_superuser != 'on')
      //       return res.redirect('/');

      //     client.query('select name, email, password from game.temp', function (errs, results) {
            return res.view('admin', {title: 'Admin Control', players: /*results.rows*/undefined, user: req.session.name});
          // });
        // });
      // });
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
