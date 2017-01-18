module.exports = {
  attributes: {
    product_name: {
      type: 'text',
      notNull: true
    },
    sell_price: {  // generated price to sell to market
      type: 'integer',
      notNull:true
    },
    product_cost: {  // user provided
      type: 'integer',
      notNull:true
    },
    buy_price: {  // generated purchase price
      type: 'integer',
      notNull:true
    },
    in_stock: {  // object in stock
      type: 'boolean',
      notNull:true,
      defaultsTo: false
    }
  }
};