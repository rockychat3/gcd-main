var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /board/buy_new_hex/
  //  allows players to buy land from a town government (does NOT handle the money transfer)
  //    required auth: user_id, token
  //    required inputs: hex_id
  //    response: confirmation of purchase
  buy_new_hex: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, "board")); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('hex_id')) return RespService.e(res, 'Missing hex_id');
    
    // lookup the hex and check for ownership
    try { var hex_object = await(Hexes.findOne(req.param('hex_id'))); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
    if (hex_object.owner) return RespService.e(res, 'Hex is already owned -- the owner must use sell_hex to transfer');
    
    // set new owner and update db
    try { var updated = await(Hexes.update(req.param('hex_id'), {owner: req.param('user_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with account data
  }),
  
  //  /board/sell_hex/
  //  allows players to sell land to another player (does NOT handle the money transfer)
  //    required auth: user_id, token
  //    required inputs: hex_id, recipient_id
  //    response: confirmation of purchase
  sell_hex: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, "board")); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('hex_id')) return RespService.e(res, 'Missing hex_id');
    if (!req.param('recipient_id')) return RespService.e(res, 'Missing recipient_id');
    
    // lookup the hex and check for ownership
    try { var hex_object = await(Hexes.findOne(req.param('hex_id'))); }
    catch(err) { return RespService.e(res, 'Hex lookup error: ' + err); }
    if (!hex_object) return RespService.e(res, 'Hex not found');
    if (!hex_object.owner) return RespService.e(res, 'Hex is unowned -- use buy_new_hex to transfer');
    if (hex_object.owner != req.param('user_id')) return RespService.e(res, 'Hex is not yours');
    
    // lookup the new user
    try { var recipient_object = await(Users.findOne(req.param('recipient_id'))); }
    catch(err) { return RespService.e(res, 'User lookup error: ' + err); }
    if (!recipient_object) return RespService.e(res, 'Recipient not found');
    
    // set new owner and update db
    try { var updated = await(Hexes.update(req.param('hex_id'), {owner: req.param('recipient_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with account data
  }),
  
}  // controller end

