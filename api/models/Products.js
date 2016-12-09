module.exports = {
  connection: 'markets',  // microapp
  attributes: {
    user_id: {
      type: 'integer',
      notNull: true,
    },
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
    }
  }
};