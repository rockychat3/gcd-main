module.exports = {

  // testing: function (req, res) {
  //   Player.query('SELECT * FROM game.player', function (err, results) {
  //     // console.log(results);
  //     return res.view('main', {title: 'hello world', text: results.rows[0].name});
  //   });

  // },

  board: function (req, res) {
    return res.view('board', {title: 'Board', user: req.session.name});
  },

  region: function (req, res) {
    return res.view('region', {title: 'Region ' + req.param('id'), user: req.session.name});
  },

  hex: function (req, res) {
    return res.view('hex', {title: 'Hex ' + req.param('id'), user: req.session.name});
  },

  resources: function (req, res) {
    return res.view('resources', {title: 'Resources for Hex ' + req.param('id'), user: req.session.name});
  },

  player: function (req, res) {
    return res.view('player', {title: 'Player ' + req.param('name'), user: req.session.name});
  },

  login: function (req, res) {
    return res.view('login', {title: 'Log in', user: req.session.name});
  },

  register: function (req, res) {
    return res.view('register', {title: 'Register'});
  },

  admin: function (req, res) {
    return res.view('admin', {title: 'Admin Control', user: req.session.name});
  }

}