module.exports = {

  //  /finances/create_account/
  //  allows players to create their own accounts
  //   token auth required
  //   required inputs: user_id, account_name
  //   response: account object
  create_account: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
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
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
    AuthService.authenticate(req, res, "players", function (req, res) {
      // calls the account authentication function of AuthService and makes sure that provided user id owns the account
      AuthService.account_authenticate(req, res, function(req, res) {
        
        // check for all required user input
        if (!req.param('account_id')) return RespService.e(res, 'Missing acount id');
        if (!req.param('new_name')) return RespService.e(res, 'Missing new name');
        
        // creates array "to_update" and adds new_name variable if it's provided in the API call
        var to_update = {};
        if (req.param('new_name')) to_update.account_name = req.param('new_name');
        
        // updates the account of the provided id with the array ("to_update") containing the update information
        Accounts.update(req.param('account_id'), to_update).exec(function afterwards(err, updated){
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success with account data
        });
      });
    });
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
  
  //  /finances/add_money/
  //  allows admins to add money to an account
  //    token auth required (admin only)
  //    required input: user_id, account_id (to be updated)
  //    optional input: amount (to be set at), add_amount (amount to be added)
  //    response: account object
  add_money: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
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
    });
  },
  
  //  /finances/check_balances/
  //  shows all of owned balances
  //    token auth required
  //    required input: user_id
  //    response: account object with amounts
  check_balances: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
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
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
    AuthService.authenticate(req, res, "players", function (req, res) {
      // calls the account authentication function of AuthService and makes sure that provided user id owns the account
      AuthService.account_authenticate(req, res, function(req, res){
        
        // find the row of the accounts table with the matching user and account id
        Accounts.findOne({user_id: req.param('user_id'), id: req.param('account_id')}).exec(function(err, accounts_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, accounts_object);  // respond success with user data
        });
      });
    });
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
  send_money: function (req, res) {
    // calls the token authenticate function of AuthService. Makes sure that user_id matches the posted token
    AuthService.authenticate(req, res, "players", function (req, res) {
      // calls the account authentication function of AuthService and makes sure that provided user id owns the account
      AuthService.account_authenticate(req, res, function(req, res){
        
        // check for all required user input
        if (!req.param('recipient_id')) return RespService.e(res, 'Missing recipient id');
        
        // checks if number was entered and not a word
        if(req.param('amount')) if (isNaN(req.param('amount'))) return RespService.e(res, 'try a number ya dummy');
        if(req.param('amount') < 0)  return RespService.e(res, 'Clever girl. Close, but no cigar');
        
        var amount_temp = parseInt(req.param('amount'), 10);
        
        var from = {};
        if (req.param('amount')) from.amount -= amount_temp;
        
        var to = {};
        if (req.param('amount')) to.amount += amount_temp;
        
        console.log(amount_temp);
        
        
        var transaction = {amount: req.param('amount'), notes: req.param('notes'), from: req.param('account_id'), to: req.param('recipient_id')};
        // respond success with transaction log
        Transactions.create(transaction).exec(function (err, transactions_object){
          if (err) return RespService.e(res, 'Transaction recording error: ' + err);
          
          Accounts.update(req.param('account_id'), from).exec(function afterwards(err, updated){  
            if (err) return RespService.e(res, 'First account update (from) failed! Database fail: ' + err);
          
            Accounts.update(req.param('recipient_id'), to).exec(function afterward(err, updated){  
              if (err) return RespService.e(res, 'Second account update (to) failed! Database fail: ' + err);
              
              return RespService.s(res, transactions_object);
            });
          });
        });
      });
    });  // auth end
  },  // action end
  
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
        
        if (req.param('sender')) {
          Accounts.find({from: req.param('account_id')}).exec(function (err, accounts_object) {
            if (err) return RespService.e(res, 'Database fail: ' + err);
            return RespService.s(res, accounts_object);  // respond success with user data
          });
        }
        else if (req.param('recipient')) {
          Accounts.find({to: req.param('account_id')}).exec(function (err, accounts_object) {
            if (err) return RespService.e(res, 'Database fail: ' + err);
            return RespService.s(res, accounts_object);  // respond success with user data
          });
        }
        else {
          return RespService.e(res, 'No results, you didn\'t specify whether you wanted to see transactions where you are the reciever or the sender');
        }
      });
    });
  },  // action end
}  // controller end

