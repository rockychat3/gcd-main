module.exports = {
  //connection: 'markets',  // microapp
  attributes: {
    product_name: {
      type: 'text',
      notNull: true
    },
    sell_price: {
      type: 'integer',
      notNull:true
    },
    product_cost: { //money given
      type: 'integer',
      notNull:true
    },
    buy_price: { //money obtained
      type: 'integer',
      notNull:true
    },
    in_stock: { //object in stock
      type: 'boolean',
      notNull:true,
      defaultsTo: false
    }
  }
};