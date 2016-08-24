module.exports = {

  price: function (req, res) {
    if (req.param('resource_type')) {
      Resourcetype.query(`SELECT price FROM resourcetype WHERE type = '${req.param('resource_type')}'`, function (err, type) {
        if (!type.rows.length) {
          res.status(404);
          return res.send('Error: resource type not found');
        }

        var baseprice = type.rows[0].price;
        return res.json({ market: baseprice, ship_sell: baseprice * 0.85, ship_buy: baseprice * 1.15 });
      });
    }
    else {
      res.status(400);
      return res.send('Error: please enter the correct parameters');
    }
  },

  shipsell: function (req, res) {
    
  },

  // sell: function (req, res) {

  // },

  shipbuy: function (req, res) {
    
  },

  // buy: function (req, res) {

  // }
    
}