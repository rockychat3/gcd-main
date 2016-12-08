module.exports = {
  
  // /market/add_product/
  // adds product to market
  // token auth required (admin token)
  // requires user_id and account_id
  // requires product_id and item_name
  // response: item is added to market
  
  new_product: function (req, res) {
    
    AuthService.authenticate(req, res, "admin", function (req, res) {
    
      if (!req.param('product_name')) return RespService.e(res, 'Missing Name'); //product name
      if (!req.param('product_cost')) return RespService.e(res, 'Missing Cost');
    
      //creates array "new_product" with all the info provided in the call
      var new_product = { name: req.param('product_name'), email: req.param('product_cost')};
   
      // creates the new product in the database with the created new_product object
      Product.create(new_product).exec(function (err, product_object){
        if (err) return RespService.e(res, 'Done Scrublord: ' + err);
        return RespService.s(res, product_object);  // respon-d success w/ user data
    
    
      }); // end create
    }); // end token auth
  }, // end action
  
  remove_product: function (req, res) {
    AuthService.authenticate(req, res, "admin", function (req, res) {
      
    
      Products.delete(req.param('product_name')).exec(function afterwards(err, updated) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success with user data
      }); // end delete
      
        //row('name').remove() unsure about this found it on google just wanna know if this is what we need to remove a row from a table
      
    }); //end token auth
  }, // end action
  /*
  // /market/get_price/
  list_products: function (req, res) {
    // finds all rows of the accounts table
    Products.find({}).exec(function (err, Products_object) {
      if (err) return RespService.e(res, 'Database fail: ' + err);
      Products_object.forEach(function(account){ delete account.amount; });  // deletes the amount from each object in the returned results
      return RespService.s(res, Products_object);  // respond success with user data
    });
    */
    
  //},
}