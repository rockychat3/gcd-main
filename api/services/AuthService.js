module.exports = {

  // When authentication is needed, verify user permission and return default status object
  authenticate: function (req, permission_required) {
    if (!req.param('user_id')) return { pass: false, error: 'Missing user_id'};
    if (!req.param('token')) return { pass: false, error: 'Missing token'};
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).populate('tokens').exec(function (err, user) {
      if (err) return { pass: false, error: 'Database lookup problem. Check input data. ' + err};
      if (!user) return { pass: false, error: 'User not found in database'};
      
      return { pass: true };  // respond success w/ user data
    });
    
  }

}