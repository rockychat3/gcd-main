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
    try { 
      await(AuthService.authenticate_async(req, "finances"));  // verify permission to use finances app
    } catch(err) { return RespService.e(res, err); };
    
    try { var accounts_object = await(Accounts.find({user_id: req.param('user_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, accounts_object);  // respond success with user data
  },
  
  //  /finances/check_balance/
  //  shows one balance
  //    token auth required
  //    required input: user_id, account_id
  //    response: account object with amount
  check_balance: asyncHandler(function (req, res) {
    try { 
      await(AuthService.authenticate_async(req, "finances"));  // verify permission to use finances app
      await(AuthService.account_authenticate_async(req));  // verify that the user is the account owner (or admin)
    } catch(err) { return RespService.e(res, err); };
    
    // find the row of the accounts table with the matching user and account id
    try { var accounts_object = await(Accounts.findOne({user_id: req.param('user_id'), id: req.param('account_id')})); }
    catch(err) {  return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, accounts_object);  // respond success with user data
  }),
  
  // requires the user_id, account_id, and transaction_id.  Only valid for users on the receiving end of a transaction.
  reverse_transaction: asyncHandler(function (req, res) {
    try { 
      await(AuthService.authenticate_async(req, "finances"));  // verify permission to use finances app
      await(AuthService.account_authenticate_async(req));  // verify that the user is the account owner (or admin)
    } catch(err) { return RespService.e(res, err); };
    
    if (!req.param('transaction_id')) return RespService.e(res, 'Missing transaction id');
    
    try { var transactions_object = await(Transactions.findOne({id: req.param('transaction_id'), to: req.param('account_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    if (!transactions_object) return RespService.e(res, 'Transaction not found or you are not the recipient of this transaction');
    
    // simply create a reverse transaction of the original rather than deleting records
    try { var results = await(this.internal_money_transfer(transactions_object.to, transactions_object.from, transactions_object.amount, "REVERSED:" + transactions_object.notes)); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
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
    if (!req.param('notes')) return RespService.e(res, 'Missing notes');
    // also make sure the amount is present, numeric, positive, and parsed
    if (!req.param('amount')) return RespService.e(res, 'Missing amount to be transferred');
    // checks if number was entered and not a word, and if the number entered is > 0
    if(req.param('amount')) if (isNaN(req.param('amount'))) return RespService.e(res, 'Not a number: try entering a number');
    if(req.param('amount') < 0)  return RespService.e(res, 'Nice try.');
    var transfer_amount = parseInt(req.param('amount'));
    
    // call internal money transfer function
    try { var results = await(this.internal_money_transfer(req.param('account_id'), req.param('recipient_id'), transfer_amount, req.param('notes'))); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  internal_money_transfer: function(sender_account_id, recipient_account_id, transfer_amount, notes) {
    // check the sender and make sure there is enough money in the account
    try { var sender_object = await(Accounts.findOne(sender_account_id)); }
    catch(err) { throw new Error('Finding account row failed! Error:' + err); }
    if (sender_object.amount < transfer_amount) throw new Error('Insufficient funds in your account to complete transaction');
    
    // lookup the recipient
    try { var recipient_object = await(Accounts.findOne(recipient_account_id)); }
    catch(err) { throw new Error('Finding recipient row failed! Error:' + err); }
    
    // create the transaction record
    var transactions_object = {amount: transfer_amount, notes: notes, from: sender_account_id, to: recipient_account_id};
    try { transactions_object = await(Transactions.create(transactions_object)); }
    catch(err) { throw new Error('Transaction recording error: ' + err); }

    // update the sender's total amount
    var sender_object_update = { amount: sender_object.amount-transfer_amount };
    try { await(Accounts.update(sender_account_id, sender_object_update)); }
    catch(err) { throw new Error('First account update (send/from) failed! Database fail: ' + err); }
       
    // update the recipient's total amount
    var recipient_object_update = { amount: recipient_object.amount+transfer_amount };
    try { await(Accounts.update(recipient_account_id, recipient_object_update)); }
    catch(err) { throw new Error('Second account update (recieve/to) failed! Database fail: ' + err); }
    
    return {transaction: transactions_object, sender: sender_object_update, recipient: recipient_object_update};
  },
  
  //  /finances/view_transactions/
  //  view transactions that happened
  //    token auth required
  //    required input: user_id, account_id
  //    response: account object with amount
  view_transactions: asyncHandler( function (req, res) {
    try { 
      await(AuthService.authenticate_async(req, "finances"));  // verify permission to use finances app
      await(AuthService.account_authenticate_async(req));  // verify that the user is the account owner (or admin)
    } catch(err) { return RespService.e(res, err); };
    
    // right now if both are set to return then the game server crashes
    try { var accounts_object = await(Transactions.find({from: req.param('account_id'), to: req.param('account_id')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, accounts_object);  // respond success with user data
  }),
  
}  // controller end

