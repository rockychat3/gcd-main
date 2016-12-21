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
  'POST /players/create_user': 'UsersController.create_user',
  'POST /players/update_user': 'UsersController.update_user',
  'POST /players/list_users': 'UsersController.list_users',
  'POST /players/list_user': 'UsersController.list_user',
  'POST /players/create_token': 'UsersController.create_token',
  'POST /players/list_tokens': 'UsersController.list_tokens',
  'POST /players/first': 'UsersController.first',
  
  // Finances Microapp
   'POST /finances/create_account': 'FinancesController.create_account',
   'POST /finances/update_account': 'FinancesController.update_account',
   'POST /finances/list_accounts': 'FinancesController.list_accounts',
   'POST /finances/add_money': 'FinancesController.add_money',
   'POST /finances/check_balances': 'FinancesController.check_balances',
   'POST /finances/check_balance': 'FinancesController.check_balance',
   'POST /finances/reverse_transaction': 'FinancesController.reverse_transaction',
   'POST /finances/send_money': 'FinancesController.send_money',
   'POST /finances/view_transactions': 'FinancesController.view_transactions',
   
   //Market Microapp
   'POST /markets/add_product': 'MarketsController.add_product',
   'POST /markets/remove_product': 'MarketsController.remove_product',
   'POST /markets/list_products': 'MarketsController.list_products',
   'POST /markets/get_price': 'MarketsController.get_price',
   'POST /markets/buy_product': 'MarketsController.buy_product',
   'POST /markets/sell_product': 'MarketsController.sell_product',
   
};
