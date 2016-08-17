var pg = require('pg');

module.exports = {

  approve: function (req, res) {
    // var config = {
    //   user: req.session.db_name,
    //   password: req.session.password,
    //   host: openshift,
    //   port: openshift port,
    //   database: db;
    // };
    // var client = new pg.Client(config);

    // client.connect(function (err) {
    //   if (err) throw err;

      // client.query('show is_superuser', function (errs, success) {
      //   if (success.rows[0].is_superuser != 'on')
        //   return res.send('Nice try non superuser!');

        // client.query('insert into game.player (name, email, money, token, multiplier) values (' + result.param('name') + ', ' + result.param('email') + ', 0, null, null)');

        // // Create a new user on the database
        // client.query('create user ' + req.param('name').replace(/\s+/g, '_') + ' with password ' + req.param('password'));
        // // Assign the new user's permissions
        // client.query('grant select on game.players, game.hex to ' + req.param('name').replace(/\s+/g, '_'));
        // client.query('grant update on game.hex to ' + req.param('name').replace(/\s+/g, '_'));

        // client.query('delete from game.temp where name = ' + req.param('name'));

        // return res.send(req.param('name'));
      // });
    // }
  },

  reject: function (req, res) {
    // var config = {
    //   user: req.session.db_name,
    //   password: req.session.password,
    //   host: openshift,
    //   port: openshift port,
    //   database: db;
    // };
    // var client = new pg.Client(config);

    // client.connect(function (err) {
    //   client.query('show is_superuser', function (errs, success) {
    //     if (success.rows[0].is_superuser != 'on')
    //       return res.send('Something with wrong deleting user ' + req.param('name'));

    //     client.query('delete from game.temp where name = ' + req.param('name'));
    //     return res.send(req.param('name'));
    //   });
    // });
  },

  endRound: function (req, res) {

  }

}