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
    catch(err) { throw new Error('Hex authentication error:' + err); };
    
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
    
    if (hex_object.owner != req.param("user_id")) {
       return RespService.e(res, 'whomst\'d\'ve do you think thou\st art?');
     }
  }),
        
  
  
  set_region: asyncHandler(function(req,res){
    try { var user_id = await(AuthService.authenticate_async(req, "board")); }
  }),
  
  
  
  
}  // controller end

