var pg = require('pg');

module.exports = {

  login: function (req, res) {
    var config = {
      user: req.param('name').replace(/\s+/g, '_'),
      password: req.param('password'),
      host: OPENSHIFT_POSTGRESQL_DB_HOST,
      port: OPENSHIFT_POSTGRESQL_DB_PORT,
      database: 'v2'
    };
    var client = new pg.Client(config);

    client.connect(function (err) {
      if (err) 
        return res.send('Unable to log in');

      else {
        req.session.name = req.param('name');
        req.session.db_name = req.param('name').replace(/\s/g, '');
        req.session.password = req.param('password');

        res.send('Logged in');
      }

      // if (req.param('name') == 'admin' && req.param('password') == 'admin') {
      //   req.session.name = req.param('name');
      //   req.session.db_name = req.param('name').replace(/\s+/g, '_');
      //   req.session.password = req.param('password');
      //   return res.send('Logged in');
      // }
      // else
      //   return res.send('Unable to log in');
    });
  },

  logout: function (req, res) {
    req.session.destroy(function (err) {
      return res.send('Logged out');
    });
  },

  createToken: function (req, res) {
    if (!req.session.db_name) {
      res.send('No current session available, log in to receive a token!');
    }
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
      //   if (err) res.send('Unable to access database, try again');

        multiplier = Math.ceil(Math.random()*6);
        now = Date.now();

        token = (now*multiplier).toString();
        for(var i=0;i<30;i++) {
          start = Math.random() < 0.5 ? 65 : 97;
          token += String.fromCharCode(start+Math.floor(Math.random()*26));
        }

        // client.query('update game.player set token=' + token + ', multiplier=' + multiplier + ' where name = ' + req.session.name, function (err, result) {
        //   if (err) throw err;
        // });

        res.send(token);
      // });
    }
  }

}