/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 */

module.exports.routes = {

  // Players Microapp
  'GET /players/create_user': 'UsersController.create_user',
  'GET /players/update_user': 'UsersController.update_user',
  'GET /players/list_users': 'UsersController.list_users',
  'GET /players/list_user': 'UsersController.list_user',
  'GET /players/create_token': 'UsersController.create_token',
  'GET /players/list_tokens': 'UsersController.list_tokens',

  // Finances Microapp
  'GET /finances/create_account': 'FinancesController.create_account',
  'GET /finances/update_account': 'FinancesController.update_account',
  'GET /finances/list_accounts': 'FinancesController.list_accounts',
  'GET /finances/add_money': 'FinancesController.add_money',
  'GET /finances/check_balances': 'FinancesController.check_balances',
  'GET /finances/reverse_transaction': 'FinancesController.reverse_transaction',
  'GET /finances/send_money': 'FinancesController.send_money',
  'GET /finances/view_transactions': 'FinancesController.view_transactions',
  'GET /finances/spend_money/': 'FinancesController.spend_money',
   
  //Market Microapp
  'GET /markets/add_product': 'MarketsController.add_product',
  'GET /markets/remove_product': 'MarketsController.remove_product',
  'GET /markets/list_products': 'MarketsController.list_products',
  'GET /markets/get_price': 'MarketsController.get_price',
  'GET /markets/buy_product': 'MarketsController.buy_product',
  'GET /markets/sell_product': 'MarketsController.sell_product',
  
};
