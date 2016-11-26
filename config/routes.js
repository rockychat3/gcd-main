/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  // Players Microservice
  'POST /players/create_user': 'UserController.create_user',
  'POST /players/update_user': 'UserController.update_user',
  'POST /players/list_users': 'UserController.list_users',
  'POST /players/list_user': 'UserController.list_user',
  
  'POST /players/create_token': 'UserController.create_token',
  'POST /players/list_tokens': 'UserController.list_tokens',
  

  // Web UI
  // 'GET /': 'ViewController.board',
  'GET /': 'ViewController.admin',

  // 'GET /board': 'ViewController.board',

  // 'GET /region/:id': 'ViewController.region',

  // 'GET /hex/:id': 'ViewController.hex',

  'GET /player/:name': 'ViewController.player',

  'GET /login': 'ViewController.login',

  // 'GET /register': 'ViewController.register',

  // 'POST /register': 'UserController.register',

  'POST /login': 'SessionController.login',

  'POST /logout': 'SessionController.logout',

  'GET /admin': 'ViewController.admin',

  'POST /admin/approve_student': 'AdminController.approve',

  'POST /admin/reject_student': 'AdminController.reject',

  // Restful API

  // 'POST /bank/check_balance': 'TransactionController.balance',

  // 'POST /bank/view_transactions': 'TransactionController.transactions',

  // 'POST /bank/send_money': 'TransactionController.send',

  // 'POST /bank/request_money': 'TransactionController.request',

  // 'POST /bank/view_requests': 'TransactionController.view',

  // 'POST /bank/approve_request': 'TransactionController.approve',

  // 'POST /resources/mine': 'ResourceController.mine',

  // 'POST /resources/move': 'ResourceController.move',

  // 'POST /resources/estimate_move': 'ResourceController.estimate',

  // 'POST /resources/realify': 'ResourceController.realify',

  // 'POST /resources/digify': 'ResourceController.digify',

  // 'POST /resources/view': 'ResourceController.view',

  // 'POST /resources/transfer_ownership': 'ResourceController.transfer',

  // 'POST /market/get_price': 'MarketController.price',

  // 'POST /market/ship_and_sell': 'MarketController.shipsell',

  // 'POST /market/ship_and_buy': 'MarketController.shipbuy',

  // 'POST /market/get_price': 'MarketController.price',

  // 'POST /food/set_rates': 'FoodController.setRates',

  // 'POST /food/view_available': 'FoodController.view'

};
