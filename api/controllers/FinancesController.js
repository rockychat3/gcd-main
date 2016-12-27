var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /finances/create_account/
  //  allows players to create their own accounts
  //   token auth required
  //   required inputs: user_id, account_name
  //   response: account object
  create_account: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) { 

      // check for all required user input
      if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
      if (!req.param('account_name')) return RespService.e(res, 'Missing name');
      
      // creates object "new_account" with the provided account name and user id
      var new_account = {account_name: req.param('account_name'), user_id: req.param('user_id')};
      
      // creates the new account in the database with the new_account object
      Accounts.create(new_account).exec(function (err, account_object){
        if (err) return RespService.e(res, 'Account creation error: ' + err);
        return RespService.s(res, account_object);  // respond success with user data
      });
    });
  },
  
  //  /finances/update_account/
  //  allows players to update the name of their account
  //    token auth required
  //    required input: user_id, account_id (to be updated), new_name (for the account)
  //    response: account object
  update_account: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) {
      AuthService.account_authenticate(req, res, function(req, res) {
        
        // check for all required user input
        if (!req.param('account_id')) return RespService.e(res, 'Missing acount id');
        
        // creates array "to_update" and adds new_name variable if it's provided in the API call
        var to_update = {};
        if (req.param('new_name')) to_update.account_name = req.param('new_name');
        
        // updates the account of the provided id with the array ("to_update") containing the update information
        Accounts.update(req.param('account_id'), to_update).exec(function afterwards(err, updated){
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success with account data
        }); // end update
      }); // end account auth
    }); // end token auth
  },
  
  //  /finances/list_accounts
  //  lists the accounts of all the users
  //    no token auth required
  //    no required input
  //    response: array of user objects without amounts
  list_accounts: function (req, res) {
    // finds all rows of the accounts table
    Accounts.find({}).exec(function (err, accounts_object) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      accounts_object.forEach(function(account){ delete account.amount; });  // deletes the amount from each object in the returned results
      return RespService.s(res, accounts_object);  // respond success with user data
    });
  },
  
  //  /finances/spend_money/
  //  allows admins to add money to an account
  //    token auth required (admin only)
  //    required input: user_id, account_id (to be updated)
  //    optional input: amount (to be set at), spend_amount (amount to be added)
  //    response: account object
  spend_money: function (req, res, spend_object) {
    // check for all required user input
    if (!spend_object.account_id) return RespService.e (res, 'Missing account id');
    if(!spend_object.spend_amount) return RespService.e (res, 'Missing spend amount');
        
    // checks to see if number was entered and not a word
    if (isNaN(spend_object.spend_amount)) return RespService.e(res, 'try a number ya dummy');
    if((spend_object.spend_amount) < 0) return RespService.e(res, 'Nice try.');
        
    // creates array "to_update" and adds new_name variable if it's provided in the API call
    var to_update = {};
    if (spend_object.spend_amount) to_update.amount -= parseInt(spend_object.spend_amount);
        
    // updates the account of the provided id with the array ("to_update") containing the update information
    Accounts.update(spend_object.account_id, to_update).exec(function afterwards(err, updated){
      return RespService.s(res, updated);  // respond success with account data
    });
  },
  
  //  /finances/spend_money/
  //  allows people to remove money from their account (burn it)
  //    token auth required
  //    required input: user_id, account_id (to be updated)
  //    optional input: amount (to be set at), add_amount (amount to be added)
  //    response: account object
  add_money: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) {
      
      // check for all required user input
      if (!req.param('account_id')) return RespService.e (res, 'Missing account id');
      
      // checks to see if number was entered and not a word
      if(req.param('amount')) if (isNaN(req.param('amount'))) return RespService.e(res, 'try a number ya dummy');
      if(req.param('add_amount')) if (isNaN(req.param('add_amount'))) return RespService.e(res, 'try a number ya dummy');
      
      // creates array "to_update" and adds new_name variable if it's provided in the API call
      var to_update = {};
      if (req.param('amount')) to_update.amount = parseInt(req.param('amount'));
      else if (req.param('add_amount')) to_update.amount += parseInt(req.param('add_amount'));
      
      // updates the account of the provided id with the array ("to_update") containing the update information
      Accounts.update(req.param('account_id'), to_update).exec(function afterwards(err, updated){
        return RespService.s(res, updated);  // respond success with account data
      });
    }); // end token auth
  },
  
  //  /finances/check_balances/
  //  shows all of owned balances
  //    token auth required
  //    required input: user_id
  //    response: account object with amounts
  check_balances: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) {
      
      // check for all required user input
      if (!req.param('user_id')) return RespService.e(res, 'Missing user_id');
      
      // finds all rows of the accounts table
      Accounts.find({user_id: req.param('user_id')}).exec(function(err, accounts_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, accounts_object);  // respond success with user data
      });
    });
  },
  
  //  /finances/check_balance/
  //  shows one balance
  //    token auth required
  //    required input: user_id, account_id
  //    response: account object with amount
  check_balance: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) {
      AuthService.account_authenticate(req, res, function (req, res){
        
        // find the row of the accounts table with the matching user and account id
        Accounts.findOne({user_id: req.param('user_id'), id: req.param('account_id')}).exec(function(err, accounts_object) {
          if (err) return RespService.e(res, 'Database fail: ' + err);
          return RespService.s(res, accounts_object);  // respond success with user data
        });
      }); // end account auth
    }); // end token auth
  },
  
  reverse_transaction: function (req, res) {
    if (!req.param('transaction_id')) return RespService.e(res, 'Missing transaction id');
    
    Transactions.findOne({id: req.param('transaction_id')}).exec(function(err, transactions_object) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      req.param.recipient_id = transactions_object.sender_id;
      req.param.sender_id = transactions_object.recipient_id;
      req.param.amount = transactions_object.amount;
      send_money(req, res);
    });
  },
  
  //  /finances/send_money/
  //  send money to another account
  //    token auth required
  //    required input: user_id, account_id
  //    response: account object with amount
  send_money: asyncHandler( function (req, res) {
    try { 
      await(AuthService.authenticate_async(req, "finances"));  // verify permission to use finances app
      await(AuthService.account_authenticate_async(req));  // verify that the user is the account owner (or admin)
    } catch(err) { return RespService.e(res, err); };
    
    // check for all required user input (that isn't verified by AuthService) starting with recipient_id
    if ((!req.param('recipient_id')) || isNaN(req.param('recipient_id'))) return RespService.e(res, 'Missing recipient id');
    // also make sure the amount is present, numeric, positive, and parsed
    if (!req.param('amount')) return RespService.e(res, 'Missing amount to be transferred');
    // checks if number was entered and not a word, and if the number entered is > 0
    if(req.param('amount')) if (isNaN(req.param('amount'))) return RespService.e(res, 'Not a number: try entering a number');
    if(req.param('amount') < 0)  return RespService.e(res, 'Nice try.');
    var transfer_amount = parseInt(req.param('amount'));
    
    // check the sender and make sure there is enough money in the account
    try { var sender_object = await(Accounts.findOne(req.param('account_id'))); }
    catch(err) { return RespService.e(res, 'Finding account row failed! Error:' + err); }
    if (sender_object.amount < transfer_amount) return RespService.e(res, 'Insufficient funds in your account to complete transaction');
    
    // lookup the recipient
    try { var recipient_object = await(Accounts.findOne(req.param('recipient_id'))); }
    catch(err) { return RespService.e(res, 'Finding recipient row failed! Error:' + err); }
    
    // create the transaction record
    var transactions_object = {amount: transfer_amount, notes: req.param('notes'), from: req.param('account_id'), to: req.param('recipient_id')};
    try { transactions_object = await(Transactions.create(transactions_object)); }
    catch(err) { return RespService.e(res, 'Transaction recording error: ' + err); }

    // update the sender's total amount
    var sender_object_update = { amount: sender_object.amount-transfer_amount };
    try { await(Accounts.update(req.param('account_id'), sender_object_update)); }
    catch(err) { return RespService.e(res, 'First account update (send/from) failed! Database fail: ' + err); }
       
    // update the recipient's total amount
    var recipient_object_update = { amount: recipient_object.amount+transfer_amount };
    try { await(Accounts.update(req.param('recipient_id'), recipient_object_update)); }
    catch(err) { return RespService.e(res, 'Second account update (recieve/to) failed! Database fail: ' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, {transaction: transactions_object, sender: sender_object_update, recipient: recipient_object_update});
  }),
  
  //  /finances/view_transactions/
  //  view transactions that happened
  //    token auth required
  //    required input: user_id, account_id
  //    response: account object with amount
  view_transactions: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
    AuthService.authenticate(req, res, "players", function (req, res) {
      // calls the account authentication function of AuthService and makes sure that provided user id owns the account
      AuthService.account_authenticate(req, res, function(req, res){
        
          // right now if both are set to return then the game server crashes
          Transactions.find({from: req.param('account_id'), to: req.param('account_id')}).exec(function (err, accounts_object) {
            if (err) return RespService.e(res, 'Database fail: ' + err);
            if (req.param('sender')) return RespService.s(res, accounts_object);  // respond success with user data
          });
        //else return RespService.e(res, 'No results, you didn\'t specify whether you wanted to see transactions where you are the reciever or the sender');
      });
    });
  },  // action end
}  // controller end

