var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /food/establish_farm/
  //  when first starting a farm, it needs to be established in the virtual board as an employer (even if there is no initial production/hiring)
  //    required auth: token
  //    required inputs: hex_name
  //    response: confirmation of new farm
  establish_farm: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // call internal employer creation
    try { var results = await(sails.controllers.citizens.internal_employer_create(req, user_id, 300, "farm")); }
    catch(err) { return RespService.e(res, 'Employer creation issue:' + err); }
    
    return RespService.s(res, results);  // respond success with account data
  }),
  
  
}  // controller end

