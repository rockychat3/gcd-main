var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  internal function for creating new employers on the map
  //    req
  //    user_id
  //    wage (int > 0)
  //    business_type (string)
  internal_employer_create: function(req, user_id, wage, business_type) {
    // check hex for existance and proper ownership
    try { await(AuthService.hex_authenticate_async(req, user_id)); }  // verify that the user is the hex owner (or admin)
    catch(err) { throw new Error('Hex authentication error:' + err); };
    
    // creates object "new_employer" with the provided info
    var new_employer = {business_type: business_type, hex: req.param('hex_name'), wage: wage};
      
    // creates the new account in the database with the new_account object
    try { var employer_object = await(Employers.create(new_employer)); }
    catch(err) { throw new Error('Account creation error: ' + err); }
    return employer_object;
  },
  
}  // controller end

