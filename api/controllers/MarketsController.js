var FinancesController = require("./FinancesController.js");

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
      if (!req.param('in_stock')) return RespService.e(res, 'Missing in_stock');
      if (req.param('in_stock') != 'true'||'false') return RespService.e(res, 'in_stock needs to be true or false');
      
      // setting the buying/selling prices. The numbers should be moved to a settings file before release
      var sell_price = parseInt(req.param('product_cost'))*0.85;
      var buy_price = parseInt(req.param('product_cost'))*1.15;
      
      //creates array "new_product" with all the info provided in the call
      var new_product = {product_name: req.param('product_name'), product_cost: req.param('product_cost'), sell_price: sell_price, buy_price: buy_price, in_stock: req.param('in_stock')};
     
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
      
      Products.destroy(req.param('product_name')).exec(function (err) {
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, 'Delete successful');  // respond success
      }); // end delete
    }); //end token auth
  }, // end action
  
    update_product: function (req, res){
    AuthService.authenticate(req, res, "markets", function (req, res) {
      
      // creates array "to_update" and adds product_name, product_cost, and in_stock variables if they're provided in the API call
      var to_update = {};
      if (req.param('product_name')) to_update.name = req.param('product_name');
      if (req.param('product_cost')) to_update.email = req.param('product_cost');
      if (req.param('in_stock')) to_update.password = req.param('in_stock');

      // updates the user of the provided id with the array ("to_update") containing the update information
      Markets.update(req.param('product_name'), to_update).exec(function afterwards(err, updated){
        if (err) return RespService.e(res, 'Database fail: ' + err);
        return RespService.s(res, updated);  // respond success with user data
      });
    });
  },
 
  list_products: function (req, res) {
      Products.find({}).exec(function (err, products_object) {
        if (err) return RespService.e(res, 'Database Fail: ' +  err);
        return RespService.s(res, products_object);
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
  
  
  buy_product: function (req, res) {
    AuthService.authenticate(req, res, "players", function (req, res) {
      AuthService.account_authenticate(req, res, "markets", function (req, res) {
        
        if (req.param('force') != 'true'||'false') return RespService.e(res, 'force needs to be true or false');
        
        Products.findOne(req.param('product_name')).exec(function (err, products_object) {
          
          
          
          if (req.param('force'));
          else if (products_object.in_stock != true) return RespService.e(res, 'The thing you\'re trying to buy isn\'t listed as in stock')
          
          req.param.user_id = req.param('user_id');
          req.param.token = req.param('token');
          req.param.account_id = req.param('account_id');
          req.param.spend_amount = products_object.buy_price;
          
          FinancesController.spend_money(req, res);
           
           
           /* var options = {
            host: 'https://gcd-students-1-andypethan.c9users.io/',
            port: 8080,
            path: '/finances/add_money/',
            method: 'POST'
          };

            var req = http.request(options, function(res) {
            console.log('STATUS: ' + res.statusCode);
            console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
           });
          });

          req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });

          // write data to request body
          req.write('data\n');
          req.write('data\n');
          req.end(); */
        });
      });
    });
  },
  
  sell_product: function (req, res) {
    AuthService.authenticate(req, res, "markets", function (req, res) {
      AuthService.account_authenticate(req, res, "markets", function (req, res) {
        
        var to_update;
        to_update.in_stock = true;
        
        Products.update(req.param('product_name'), to_update);
        
        Products.findOne(req.param('product_name')).exec(function (err, products_object) {
        });
      });
    });
  },
}