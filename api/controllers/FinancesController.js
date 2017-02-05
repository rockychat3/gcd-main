var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  /finances/create_account/
  //  allows players to create their own accounts
  //    required auth: token
  //    required inputs: account_name
  //    optional inputs: user_id
  //    response: account object
  create_account: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // in case an admin wants to lookup another user
    if (user_id<0) user_id = req.param('user_id');
    
    // check for all required user input
    if (!req.param('account_name')) return RespService.e(res, 'Missing account_name');
    
    // creates object "new_account" with the provided account name and user id
    var new_account = {account_name: req.param('account_name'), user: req.param('user_id')};
      
    // creates the new account in the database with the new_account object
    try { var account_object = await(Accounts.create(new_account)); }
    catch(err) { return RespService.e(res, 'Account creation error: ' + err); }

    return RespService.s(res, account_object);  // respond success with account data
  }),
  
  
  //  /finances/update_account/
  //  allows players to update the name of their account
  //    required auth: token
  //    required input: account_id (to be updated), new_name (for the account)
  //    response: account object
  update_account: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('new_name')) return RespService.e(res, 'Missing new_name');
        
    // updates the account of the provided id with the array ("to_update") containing the update information
    try { var updated = await(Accounts.update(req.param('account_id'), {account_name: req.param('new_name')})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, updated);  // respond success with account data
  }),
  
  
  //  /finances/list_accounts/
  //  lists the account names of all the users (but not the amount of money they have)
  //    no token auth required
  //    no required input
  //    response: list of user objects without amounts
  list_accounts: asyncHandler(function (req, res) {
    // finds all rows of the accounts table
    try { var accounts_list = await(Accounts.find({})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    accounts_list.forEach(function(account){ delete account.amount; });  // deletes the amount from each object in the returned results
    return RespService.s(res, accounts_list);  // respond success with user data
  }),
  
  
  //  /finances/check_balances/
  //  shows all of owned balances
  //    required auth: token
  //    optional inputs: user_id
  //    response: account object with amounts
  check_balances: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // in case an admin wants to lookup another user
    if (user_id<0) user_id = req.param('user_id');
    
    try { var accounts_object = await(Accounts.find({user: user_id})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, accounts_object);  // respond success with user data
  }),


  //  /finances/reverse_transaction/
  //  undoes a previous transaction (may ONLY be called by the recipient of the previous transaction)
  //    required auth: token
  //    required input: account_id, transaction_id
  //    response: account and transactions object
  reverse_transaction: asyncHandler(function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };
    
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
  //    required auth: token
  //    required input: account_id, recipient_id, amount, notes
  //    response: account and transactions object
  send_money: asyncHandler( function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };
    
    // check for all required user input (that isn't verified by AuthService)
    if ((!req.param('recipient_id')) || isNaN(req.param('recipient_id'))) return RespService.e(res, 'Missing recipient id');
    if (!req.param('notes')) return RespService.e(res, 'Missing notes');
    if (!req.param('amount')) return RespService.e(res, 'Missing amount to be transferred');

    // call internal money transfer function
    try { var results = await(this.internal_money_transfer(req.param('account_id'), req.param('recipient_id'), req.param('amount'), req.param('notes'))); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  
  //  /finances/view_transactions/
  //  view transactions that happened
  //    required auth: token
  //    required input: account_id
  //    response: transactions list from account holder
  view_transactions: asyncHandler( function (req, res) {
    try { var user_id = await(AuthService.authenticate_async(req, false)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    try { await(AuthService.account_authenticate_async(req, user_id)); }  // verify that the user is the account owner (or admin)
    catch(err) { return RespService.e(res, "Account authentication error:" + err); };
    
    // right now if both are set to return then the game server crashes
    try { var transactions_list = await(Transactions.find({or: [{from: req.param('account_id')}, {to: req.param('account_id')}]})); }
    catch(err) { return RespService.e(res, 'Database fail: ' + err); }
    
    return RespService.s(res, transactions_list);  // respond success with user data
  }),
  
  
  
  //  /finances/remove_money/
  //  allows admins to take away money
  //    admin token auth required 
  //    required input: user_id, account_id, amount (to spend), notes (reason for spending)
  //    optional input: amount (to be set at), spend_amount (amount to be added)
  //    response: account and transactions object
  remove_money: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, true)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('account_id')) return RespService.e (res, 'Missing account_id');
    if (!req.param('amount')) return RespService.e(res, 'Missing amount');
    if (!req.param('notes')) return RespService.e(res, 'Missing notes -- specify exactly what is being purchased');

    // call the internal transfer with recipient=0
    try { var results = await(this.internal_money_transfer(req.param('account_id'), 0, req.param('amount'), req.param('notes'))); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  
  //  /finances/add_money/
  //  allows the admin to add or remove money from accounts
  //    admin token auth required
  //    required input: user_id, account_id, amount (to be added)
  //    optional input: notes
  //    response: account and transactions object
  add_money: asyncHandler(function (req, res) {
    try { await(AuthService.authenticate_async(req, true)); }  // verify permission to use finances app
    catch(err) { return RespService.e(res, "User authentication error:" + err); };
    
    // check for all required user input
    if (!req.param('account_id')) return RespService.e (res, 'Missing account_id');
    if (!req.param('amount')) return RespService.e(res, 'Missing amount');
    var notes = (req.param('notes') ? req.param('notes') : "Admin money addition");  // creates a default note if none is specified

    // call the internal transfer with sender=0
    try { var results = await(this.internal_money_transfer(0, req.param('account_id'), req.param('amount'), notes)); }
    catch(err) { return RespService.e(res, 'Money transfer issue:' + err); }
    
    // respond with the transaction confirmation and new amounts
    return RespService.s(res, results);
  }),
  
  
  
  //  internal function for tranferring, adding, or spending money
  //    sender_account_id (int, 0 if earning money from a sale / federal pay)
  //    recipient_account_id (int, 0 if spending money from a market purchase)
  //    transfer_amount (int > 0)
  //    notes (string)
  internal_money_transfer: function(sender_account_id, recipient_account_id, transfer_amount, notes) {
    if (transfer_amount <= 0) throw new Error('No negative/zero transfers');
    transfer_amount = parseInt(transfer_amount);
    
    // check the sender and make sure there is enough money in the account
    if (sender_account_id) {
      try { var sender_object = await(Accounts.findOne(sender_account_id)); }
      catch(err) { throw new Error('Finding account row failed! Error:' + err); }
      if (sender_object.amount < transfer_amount) throw new Error('Insufficient funds in your account to complete transaction');
    }
    
    // lookup the recipient
    if (recipient_account_id) {
      try { var recipient_object = await(Accounts.findOne(recipient_account_id)); }
      catch(err) { throw new Error('Finding recipient row failed! Error:' + err); }
    }
    
    // create the transaction record
    var transactions_object = {amount: transfer_amount, notes: notes, from: sender_account_id, to: recipient_account_id};
    try { transactions_object = await(Transactions.create(transactions_object)); }
    catch(err) { throw new Error('Transaction recording error: ' + err); }

    // update the sender's total amount
    var sender_object_update = {};
    if (sender_account_id) {
      sender_object_update = { amount: sender_object.amount-transfer_amount };
      try { await(Accounts.update(sender_account_id, sender_object_update)); }
      catch(err) { throw new Error('First account update (send/from) failed! Database fail: ' + err); }
    }
    
    // update the recipient's total amount
    var recipient_object_update = {};
    if (recipient_account_id) {
      recipient_object_update = { amount: recipient_object.amount+transfer_amount };
      try { await(Accounts.update(recipient_account_id, recipient_object_update)); }
      catch(err) { throw new Error('Second account update (recieve/to) failed! Database fail: ' + err); }
    }
    
    return {transaction: transactions_object, sender: sender_object_update, recipient: recipient_object_update};
  },
  
}  // controller end

