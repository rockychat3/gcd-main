var await = require('asyncawait/await');
var bcrypt = require('bcrypt-nodejs');  // module used to hash passwords

module.exports = {

  // When authentication is needed, verify user permission and return default status object
  // required inputs: request object, permission string ("admin" for admin users, or a microservice name such as "players"),
  // returns the user's id (for admin, returns -1)
  authenticate_async: function (req, f_admin_required) {
    if (!req.param('token')) throw new Error('Missing token');
    
    // lookup token and connected permissions and user info 
    try { var token = await(Tokens.findOne({token: req.param('token')}).populate('user')); } 
    catch(err) { throw new Error('Token lookup problem. Check input data. ' + err); }
    
    if (!token) throw new Error('Token not found in database');

    // check if token is expired
    // @TODO
      
    // check if admin is required
    if (f_admin_required) {
      if (token.user.usertype != "admin") throw new Error('Only admins can use this function');
      return -1;  // if authorized, allow the requesting action to proceed
    }

    // admin user_id overwrite
    var user_id = token.user.id;
    if ((req.param('admin'))&&(token.user.usertype == "admin")) user_id = -1;
    
    return user_id;  // if authorized, allow the requesting action to proceed
  },
  
  
  // verifies that the account is yours
  account_authenticate_async: function (req, user_id) {
    if (!req.param('account_id')) throw new Error('Missing account_id');
    
    // lookup account in db
    try { var accounts_object = await(Accounts.findOne(req.param('account_id'))); }
    catch(err) { throw new Error('Account lookup problem. Check input data. ' + err); }
    if (!accounts_object) throw new Error('account not found in database');
      
    console.log(user_id);
    // check if the requesting user is the account owner, and if not, if the requesting token is admin
    if ((accounts_object.user != user_id) && (user_id != -1)) throw new Error('This isn\'t your account, you don\'t have permission');

    return;  // if authorized, allow the requesting action to proceed
  },
  
  
  // verifies that the hex is yours
  hex_authenticate_async: function (req, user_id) {
    if (!req.param('hex_name')) throw new Error('Missing hex_name');
    
    // lookup account in db
    try { var hex_object = await(Hexes.findOne(req.param('hex_name'))); }
    catch(err) { throw new Error('Hex lookup problem. Check input data. ' + err); }
    if (!hex_object) throw new Error('hex not found in database');
      
    // check if the requesting user is the account owner, and if not, if the requesting token is admin
    if ((hex_object.owner != user_id) && (user_id != -1)) throw new Error('This isn\'t your hex, you don\'t have permission');

    return hex_object;  // if authorized, allow the requesting action to proceed
  },
  
  
  // When authentication is needed with a password, check it and verify user permission
  // required inputs: request object, if admin priviledge is required (bool)
  password_authenticate_async: function (req, if_admin) {
    if (!req.param('user_id')) throw new Error('Missing user_id');
    if (!req.param('password')) throw new Error('Missing password');
    
    try { var user_object = await(Users.findOne(req.param('user_id'))); }
    catch(err) { throw new Error('Database fail: ' + err); }
    if (!user_object) throw new Error('User not found in database');
      
    if (!bcrypt.compareSync(req.param('password'), user_object.password)) throw new Error('Password does not match');
      
    if (if_admin && user_object.usertype != 'admin') throw new Error('Admin privileges required');  // admin check
      
    return;  // if authorized, allow the requesting action to proceed
  },
  
  
  
  ////// CODE BELOW IS ONLY FOR TRANSITION PERIOD -- IT IS ALL DEPRICATED ///////
  
  password_authenticate: function (req, res, if_admin, callback) {
    if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');  // check if user_id is present
    if (!req.param('password')) return RespService.e(res, 'Missing password');  // check if token is present
    
    // database lookup by user_id
    Users.findOne(req.param('user_id')).exec(function (err, user_object) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      if (!user_object) return RespService.e(res, 'User not found in database');
      
      if (!bcrypt.compareSync(req.param('password'), user_object.password)) return RespService.e(res, 'Password does not match');
      
      if (if_admin && user_object.usertype != 'admin') return RespService.e(res, 'Admin privileges required');  // admin check
      
      return callback(req, res);  // if authorized, run the requested action (passed as a callback function)*/
    });
  },
  
  
}