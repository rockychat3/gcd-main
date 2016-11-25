var bcrypt = require('bcrypt');  // module used to hash passwords

// Though used universally, this is officially part of the Players Microapp
module.exports = {

  // When authentication is needed, verify user permission and return default status object
  // input: request object
  // input: response object
  // input: permission string ("admin" for admin users, or a microservice name such as "players")
  // input: anonymous function to be executed upon successful completion
  authenticate: function (req, res, permission_required, callback) {
    if (!req.param('token')) return RespService.e(res, 'Missing token');  // check if token is present
    
    // database lookup by user_id
    Tokens.find({
      token: req.param('token')  // lookup the token in the database based on user input
    }).populate(['permission','user']).exec(function (err, results) {
      if (err) return RespService.e(res, 'Database lookup problem. Check input data. ' + err);
      if (!results.length) return RespService.e(res, 'Token not found in database');
      var token = results[0];  // find returns an array, but we only have one result each time
      
      // check if admin is required
      if (permission_required == "admin") {
        if (token.user.usertype != "admin") return RespService.e(res, 'Only admins can use this function');
        else return callback(req, res);  // if authorized, run the requested action (passed as a callback function)
      }
      
      if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');  // for non-admin, check if user_id is present
      
      // first check if the requesting user is the token owner
      if (token.user.id != parseInt(req.param('user_id'))) {
        // if not, check if the token's owner is an admin
        if (token.user.usertype != "admin") return RespService.e(res, 'This user does not have permission with this token');
      }
      
      // next, check if the token is a supertoken
      if (!token.supertoken) {
        // if not, check if it is the right permission type
        if (!token.permission) return RespService.e(res, 'Something is really broken');
        if (token.permission.name != permission_required) return RespService.e(res, 'Wrong permission type for this token');
      }
      
      return callback(req, res);  // if authorized, run the requested action (passed as a callback function)
    });
    
  },
  
  
  // When authentication is needed with a password, check it and verify user permission
  // input: request object
  // input: response object
  // input: permission string ("admin" for admin users, or a microservice name such as "players")
  // input: anonymous function to be executed upon successful completion
  password_authenticate: function (req, res, if_admin, callback) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');  // check if user_id is present
    if (!req.param('password')) return RespService.e(res, 'Missing password');  // check if token is present
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).exec(function (err, user) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      if (!user) return RespService.e(res, 'User not found in database');
      
      if (!bcrypt.compareSync(req.param('password'), user.password)) return RespService.e(res, 'Password does not match');
      
      if (if_admin && user.usertype != 'admin') return RespService.e(res, 'Admin priviledges required');  // admin check
      
      return callback(req, res);  // if authorized, run the requested action (passed as a callback function)*/
    });
    
  }

}