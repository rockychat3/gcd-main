module.exports = {

  login: function(req, res) {
    if (req.param('name') == 'admin' && req.param('password') == 'admin') {
      req.session.name = req.param('name');
      req.session.password = req.param('password');
      res.send('Logged in');
    }
    else
      res.send('Unable to log in');
  },

  logout: function(req, res) {
    req.session.destroy(function (err) {
      return res.send('Logged out');
    });
  }

}