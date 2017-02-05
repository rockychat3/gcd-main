var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {
  
  //  /markets/list_products
  //  returns all products and their attributes
  //    no auth required
  //    no input required
  //    response: list of product objects
  list_products: asyncHandler(function (req, res) {
    try { var products_list = await(Products.find({})); }
    catch(err) { return RespService.e(res, 'Database Fail: ' +  err); }

    return RespService.s(res, products_list);
  }),
  
  
  //  /markets/list_product
  //  returns a single product based on id lookup
  //    required input: product_id
  //    response: product object
  list_product: asyncHandler(function (req, res) {
    try { var products_object = await(Products.findOne(req.param('product_id'))); }
    catch(err) { return RespService.e(res, 'Database Fail: ' +  err); }
    
    return RespService.s(res, products_object);
  }),
  
  
  //  /markets/buy_product
  //  allows a player to buy a product from the open market
  //    required auth: token
  //    required input: account_id, product_id, quantity
  //    response: transaction object
  buy_product: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('product_id')) return RespService.e(res, 'Missing product_id');
    if (!req.param('quantity')) return RespService.e(res, 'Missing quantity');

    // lookup the product to check its price
    try { var products_object = await(Products.findOne(req.param('product_id'))); }
    catch(err) { return RespService.e(res, 'Database Fail: ' +  err); }
    if (!products_object) return RespService.e(res, 'Product not found in database');

    // call the internal transfer with recipient=0
    if ((!products_object.in_stock)&&(!req.param('force'))) RespService.e(res, 'Product not in stock (use force=true to override)');
    var total_cost = req.param('quantity') * products_object.buy_price;
    var notes = "Market purchase: " + req.param('quantity') + "x " + products_object.product_name;
    try { var results = await(sails.controllers.finances.internal_money_transfer(req.param('account_id'), 0, total_cost, notes)); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  
  //  /markets/sell_product
  //  allows a player to sell a product to the open market
  //    required auth: token
  //    required input: account_id, product_id, quantity
  //    response: transaction object
  sell_product: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };

    // check for all required user input
    if (!req.param('product_id')) return RespService.e(res, 'Missing product_id');
    if (!req.param('quantity')) return RespService.e(res, 'Missing quantity');
    
    // first, look-up the product
    try { var products_object = await(Products.findOne(req.param('product_id'))); }
    catch(err) { return RespService.e(res, 'Product lookup issue:' + err); }
    if (!products_object) return RespService.e(res, 'Product not found');
    
    // first, update the in-stock status since there is now at least one unit available
    try { await(Products.update(req.param('product_id'), {in_stock: true})); }
    catch(err) { return RespService.e(res, 'Product status update issue:' + err); }
    
    // call the internal transfer with sender=0
    var total_value = req.param('quantity') * products_object.sell_price;
    var notes = "Sale back to market: " + req.param('quantity') + "x " + products_object.product_name;
    try { var results = await(sails.controllers.finances.internal_money_transfer(0, req.param('account_id'), total_value, notes)); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  
  
  //  /market/add_product/
  //  adds product to market
  //    token auth required (admin token)
  //    requires product_id and item_name
  //    response: item is added to market
  add_product: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, true)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };

    if (!req.param('product_name')) return RespService.e(res, 'Missing product_name'); 
    if (!req.param('product_cost')) return RespService.e(res, 'Missing product_cost');
    if (!req.param('in_stock')) return RespService.e(res, 'Missing in_stock');
    if ((req.param('in_stock') != ('true'||'false'))) return RespService.e(res, 'in_stock needs to be true or false');
    
    // setting the buying/selling prices. The numbers should be moved to a settings file before release
    var sell_price = parseInt(req.param('product_cost'))*0.85;
    var buy_price = parseInt(req.param('product_cost'))*1.15;
      
    //creates object "new_product" and adds to database
    var new_product = {product_name: req.param('product_name'), product_cost: req.param('product_cost'), sell_price: sell_price, buy_price: buy_price, in_stock: req.param('in_stock')};
    try { var products_object = await(Products.create(new_product)); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, products_object);  // respond success w/ product object
  }),
  
  
  remove_product: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, true)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };

    // check for all required user input
    if (!req.param('product_id')) return RespService.e(res, 'Missing product_id');
    
    try { var products_object = await(Products.find(req.param('product_id'))); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    if (!products_object) return RespService.e(res, 'Product not found');
    
    try { await(Products.destroy(req.param('product_id'))); }
    catch(err) { return RespService.e(res, 'Destroy fail: ' + err); }
    
    return RespService.s(res, 'Delete successful');  // respond success
  }),
  
  
  update_product: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, true)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };

    // creates array "to_update" and adds product_name, product_cost, and in_stock variables if they're provided in the API call
    var to_update = {};
    if (req.param('product_name')) to_update.product_name = req.param('product_name');
    if (req.param('product_cost')) to_update.product_cost = req.param('product_cost');
    if (req.param('in_stock')) to_update.in_stock = req.param('in_stock');

    // updates the user of the provided id with the array ("to_update") containing the update information
    try { var updated = await(Markets.update(req.param('product_name'), to_update)); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with user data
  }),
}