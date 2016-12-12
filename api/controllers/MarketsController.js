module.exports = {
  
  //  /market/add_product/
  //  adds product to market
  //    token auth required (admin token)
  //    requires user_id and account_id
  //    requires product_id and item_name
  //    response: item is added to market
  add_product: function (req, res) {
    AuthService.authenticate(req, res, "admin", function (req, res) {
    
      if (!req.param('product_name')) return RespService.e(res, 'Missing Name'); //product name
      if (!req.param('product_cost')) return RespService.e(res, 'Missing Cost');
      
      // setting the buying/selling prices. The numbers should be moved to a settings file before release
      var sell_price = parseInt(req.param('product_cost'))*0.85;
      var buy_price = parseInt(req.param('product_cost'))*1.15;
      
      //creates array "new_product" with all the info provided in the call
      var new_product = {product_name: req.param('product_name'), product_cost: req.param('product_cost'), sell_price: sell_price, buy_price: buy_price};
     
        // creates the new product in the database with the created new_product object
      Products.create(new_product).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, products_object);  // respon-d success w/ user data
      }); // end create
    }); //end auth
  }, // end action
  
  remove_product: function (req, res) {
    AuthService.authenticate(req, res, "admin", function (req, res) {
      
      if (!req.param('product_name')) return RespService.e(res, 'Missing Name'); //product name
      
      Products.delete(req.param('product_name')).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, 'Delete successful');  // respond success
      }); // end delete
      
      /*
      Products.findOne(req.param('product_name')).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        if (!products_object) return RespService.e(res, 'Product not found in database');
        
        return RespService.s(res, products_object);  // respond success with user data
      }); // end delete
      */
      
    }); //end token auth
  }, // end action
 
  list_products: function (req, res) {
    AuthService.authenticate(req, res, "markets", function (req, res) {
      Products.find({}).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database Fail: ' +  err);
        return RespService.s(res, products_object);
      });
    });
  },
  
  get_price: function (req, res) {
    AuthService.authenticate(req, res, "markets", function (req, res) {
      Products.findOne(req.param('product_name')).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database Fail: ' +  err);
        return RespService.s(res, products_object);
      });
    });
  },
  
  buy_product:function (req, res) {
    AuthService.authenticate(req, res, "markets", function (req, res) {
      
    
    
  
    
    
    });
  },
  
  sell_product: function (req, res) {
    AuthService.authenticate(req, res, "markets", function (req, res) {
      
      
    
    
  
    
    
    });
  },
  
  edit_stock: function (req, res){
    AuthService.authenticate(req, res, "markets", function (req, res) {
      
      
    
    
  
    
    
    });
  }
}