module.exports = {

  // When authentication is needed, verify user permission and return default status object
  authenticate: function (req, res) {
    if (!req.param('user_id')) return RespService.api(res, 'Missing user_id');
    if (!req.param('token')) return RespService.api(res, 'Missing token');
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).populate('tokens').populate('permissions').exec(function (err, user) {
      if (err) return RespService.api(res, 'Database lookup problem. Check input data. ' + err);
      if (!user) return RespService.api(res, 'User not found in database');
      
      delete user.password;  // remove the password before returning results
      return RespService.api(res, false, user);  // respond success w/ user data
    });
    
  }

}