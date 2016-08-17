var pg = require('pg');

module.exports = {

  register: function(req, res) {

    // client.connect(function (err) {

      // client.query('insert into game.temp (name, password, email) select ' + req.param('name') + ', ' + 'req.param('password')' + ', ' + req.param('email') + ' where not exists (select 1 from table where name = ' + req.param('name'));
      res.send('Success');  
    // }
  },

  data: function (req, res) {

  },

  user: function (req, res) {

  },

  authenticate: function (req, res) {

  }

}