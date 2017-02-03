var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /board/buy_hex/
  //  allows players to buy land from a town government (does NOT handle the money transfer)
  //    required auth: user_id, token
  //    required inputs: hex_name
  //    response: confirmation of purchase
  buy_hex: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, "board")); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('hex_name')) return RespService.e(res, 'Missing hex_name');
    
    // lookup the hex and check for ownership
    try { var hex_object = await(Hexes.findOne(req.param('hex_name'))); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
    if (hex_object.owner) return RespService.e(res, 'Hex is already owned -- the owner must use sell_hex to transfer');
    
    // set new owner and update db
    try { var updated = await(Hexes.update(req.param('hex_name'), {owner: user_id})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with account data
  }),
  
  
  //  /board/sell_hex/
  //  allows players to sell land to another player (does NOT handle the money transfer)
  //    required auth: user_id, token
  //    required inputs: hex_name, recipient_id
  //    response: confirmation of purchase
  sell_hex: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, "board")); }  // verify permission to use finances app
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
      // check for all required user input
    if (!req.param('hex_name')) return RespService.e(res, 'Missing hex_name');

    try { var hex_object = await(Hexes.findOne(req.param('hex_name'))); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
      
    return RespService.s(res, hex_object);
  }),
  
  //  /board/set_residency/
  //  lets a player change the hex that their rasperry pi is on
  //    required auth: user_id, token
  //    required inputs: hex_name
  //    response: hex object
  set_residency: asyncHandler(function(req, res) {
    //check if hex is owned
    try { var hex_object = await(Hexes.findOne(req.param('hex_name'))); } 
    catch(err) { return RespService.e(res, 'hex lookup error: ' + err); }  
    
    try { await(AuthService.hex_authenticate_async(req, user_id)); }  // verify that the user is the hex owner (or admin)
    catch(err) { return RespService.e('whomst\'d\'ve do you think thou\'st art?:' + err); }
    
    var to_update = {};
    if (req.param('hex_name')) to_update.name = req.param('hex_name');
    
    Hexes.update(req.param('hex_name'), to_update).exec(function afterwards(err, updated){
      if (err) return RespService.e(res, 'Database fail: ' + err);
      return RespService.s(res, updated);  // respond success with user data
    })
  }),
        
  
  
  set_region: asyncHandler(function(req,res) {
    try { var user_object = await(AuthService.authenticate_async(req, "admin")); }
    catch (err) { return RespService.e(res, 'Sorry ol chap but ya power level isnt high enough') }
    
  }),
  
  merge_regions: asyncHandler(function(req,res) {
    try { var user_object = await(AuthService.authenticate_async(req, "admin")); }
    catch (err) { return RespService.e(res, 'Sorry ol chap but ya power level isnt high enough') }
    
    var to_update = {};
    if (req.param('new_region')) to_update.region = req.param('old_region');
    
    Hexes.update(req.param('old_region'), to_update).exec(function afterwards(err, updated){
      if (err) return RespService.e(res, 'Database fail: ' + err);
      return RespService.s(res, updated);// respond success with user data
    })
    
    
    }),
  
  set_residency: asyncHandler(function(req, res) {
    
  }),
  
  set_town: asyncHandler(function(req,res) {
     try { var user_object = await(AuthService.authenticate_async(req, "admin")) }
     catch (err) { return RespService.e(res, 'Sorry ol chap but ya power level isnt high enough')}
  }),
  
 
  
  
}  // controller end

