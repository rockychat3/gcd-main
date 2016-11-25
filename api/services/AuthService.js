module.exports = {

  // When authentication is needed, verify user permission and return default status object
  authenticate: function (req, res, permission_required, callback) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
    if (!req.param('token')) return RespService.e(res, 'Missing token');
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).populate('tokens').exec(function (err, user) {
      if (err) return RespService.e(res, 'Database lookup problem. Check input data. ' + err);
      if (!user) return RespService.e(res, 'User not found in database');
      
      callback(req, res);  // if authorized, run the requested action (passed as a callback function)
    });
    
  }

}