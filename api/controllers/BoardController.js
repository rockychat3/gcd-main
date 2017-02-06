var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /board/buy_hex/
  //  allows players to buy land from a town government (does NOT handle the money transfer)
  //    required auth: token
  //    required inputs: hex_name, recipient_id
  //    response: confirmation of purchase
  government_sell_hex: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('hex_name')) return RespService.e(res, 'Missing hex_name');
    if (!req.param('recipient_id')) return RespService.e(res, 'Missing recipient_id');

    // lookup the hex and check for ownership
    try { var hex_object = await(Hexes.findOne(req.param('hex_name')).populate('town')); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
    if (hex_object.owner) return RespService.e(res, 'Hex is already owned -- the owner must use sell_hex to transfer');
    
    // verify that this is the government account authorized to sell the land (or admin)
    if ((hex_object.town.user != user_id) && (user_id > 0)) RespService.e(res, 'Only towns have the right to sell a hex.');;
    
    // lookup the new user
    try { var recipient_object = await(Users.findOne(req.param('recipient_id'))); }
    catch(err) { return RespService.e(res, 'User lookup error: ' + err); }
    if (!recipient_object) return RespService.e(res, 'Recipient not found');
    
    // set new owner and update db
    try { var updated = await(Hexes.update(req.param('hex_name'), {owner: req.param('recipient_id')})); }
    catch(err) { return RespService.e(res, 'Database fail on set owner: ' + err); }
    
    return RespService.s(res, updated);  // respond success with account data
  }),
  
  
  //  /board/sell_hex/
  //  allows players to sell land to another player (does NOT handle the money transfer)
  //    required auth: token
  //    required inputs: hex_name, recipient_id
  //    response: confirmation of purchase
  sell_hex: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.hex_authenticate_async(req, user_id)); }  // verify that the user is the hex owner (or admin)
    catch(err) { return RespService.e('Hex authentication error:' + err); };
    
    // check for all required user input
    if (!req.param('recipient_id')) return RespService.e(res, 'Missing recipient_id');

    // lookup the new user
    try { var recipient_object = await(Users.findOne(req.param('recipient_id'))); }
    catch(err) { return RespService.e(res, 'User lookup error: ' + err); }
    if (!recipient_object) return RespService.e(res, 'Recipient not found');
    
    // set new owner and update db
    try { var updated = await(Hexes.update(req.param('hex_name'), {owner: req.param('recipient_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with hex data
  }),
  
  
  //  /board/lookup_hex/
  //  checks the region, owner, town, and use of a given tile
  //    required auth: none
  //    required inputs: hex_name
  //    response: hex object
  lookup_hex: asyncHandler(function(req, res) {
    try { var hex_object = await(Hexes.findOne(req.param('hex_name'))); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
      
    return RespService.s(res, hex_object);
  }),
  
  //  /board/set_residency/
  //  lets a player change the hex that their rasperry pi is on
  //    required auth: token
  //    required inputs: hex_name
  //    response: hex object
  set_residency: asyncHandler(function(req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.hex_authenticate_async(req, user_id)); }  // verify that the user is the hex owner (or admin)
    catch(err) { return RespService.e('Hex authentication error:' + err); };
    
    try { var updated = Users.update(user_id, { residence: req.param('hex_name') }); }
    catch(err) { return RespService.e(res, 'Residence reset error: ' + err); }
    
    return RespService.s(res, updated);  // respond success with user data
  }),
        
  
  //  /board/set_region/
  //  admin function to add hex to a region
  //    required auth: token (admin)
  //    required inputs: hex_name, new_region
  //    response: hex object
  set_region: asyncHandler(function(req,res) {
    try { var user_object = await(AuthService.authenticate_async(req, true)); }  // admin required
    catch (err) { return RespService.e(res, 'Sorry ol chap but ya power level isnt high enough') }
    
    if (!req.param('new_region')) return RespService.e(res, 'Missing new_region');
    
    try { var updated = await(Hexes.update(req.param('hex_name'), { region: req.param('new_region') })); }
    catch (err) { return RespService.e(res, 'Hex db update fail: ' + err) }
    
    return RespService.s(res, updated);// respond success with new data
  }),
  
  
  //  /board/merge_regions/
  //  admin function to merge one region into another
  //    required auth: token (admin)
  //    required inputs: old_region, new_region
  //    response: hex object
  merge_regions: asyncHandler(function(req,res) {
    try { var user_object = await(AuthService.authenticate_async(req, true)); }
    catch (err) { return RespService.e(res, 'Sorry ol chap but ya power level isnt high enough') }
    
    if (!req.param('old_region')) return RespService.e(res, 'Missing old_region');
    if (!req.param('new_region')) return RespService.e(res, 'Missing new_region');
    
    try { var updated = await(Hexes.update({ region: req.param('old_region') }, { region: req.param('new_region') })); }
    catch (err) { return RespService.e(res, 'Hex db update fail: ' + err) }
    
    return RespService.s(res, updated);// respond success with new data
  }),
  
  
  //  /board/set_town/
  //  admin function to add hex to a town
  //    required auth: token (admin)
  //    required inputs: hex_name, new_town
  //    response: hex object
  set_town: asyncHandler(function(req,res) {
    try { var user_object = await(AuthService.authenticate_async(req, true)); }  // admin required
    catch (err) { return RespService.e(res, 'your power levels need to be OVER 9000 to access this functionality') }
    
    if (!req.param('new_town')) return RespService.e(res, 'Missing new_town');
    
    try { var updated = await(Hexes.update(req.param('hex_name'), { town: req.param('new_town') })); }
    catch (err) { return RespService.e(res, 'Hex db update fail: ' + err) }
    
    return RespService.s(res, updated);// respond success with new data
  }),
  
  
}  // controller end

