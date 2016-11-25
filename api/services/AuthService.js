module.exports = {

  // When authentication is needed, verify user permission and return default status object
  authenticate: function (req, res) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
    if (!req.param('token')) return RespService.e(res, 'Missing token');
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).populate('tokens').populate('permissions').exec(function (err, user) {
      if (err) return RespService.e(res, 'Database lookup problem. Check input data. ' + err);
      if (!user) return RespService.e(res, 'User not found in database');
      
      delete user.password;  // remove the password before returning results
      return RespService.s(res, user);  // respond success w/ user data
    });
    
  }

}