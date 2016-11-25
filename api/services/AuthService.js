module.exports = {

  // When authentication is needed, verify user permission and return default status object
  authenticate: function (req, res, permission_required, callback) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
    if (!req.param('token')) return RespService.e(res, 'Missing token');
    
    // database lookup by user_id
    Tokens.find({
      token: req.param('token')  // lookup the token in the database based on user input
    }).populate(['permission','user']).exec(function (err, results) {
      if (err) return RespService.e(res, 'Database lookup problem. Check input data. ' + err);
      if (!results.length) return RespService.e(res, 'Token not found in database');
      var token = results[0];
      
      // first check if the requesting user is the token owner
      if (token.user.id != parseInt(req.param('user_id'))) {
        // if not, check if the token's owner is an admin
        if (token.user.usertype != "admin") return RespService.e(res, 'This user does not have permission with this token');
      }
      
      // next, check if the token is a supertoken
      if (!token.supertoken) {
        // if not, check if it is the right permission type
        if (!token.permission.name == permission_required) return RespService.e(res, 'Wrong permission type for this token');
      }
      
      callback(req, res);  // if authorized, run the requested action (passed as a callback function)
    });
    
  }

}