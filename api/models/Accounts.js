module.exports = {
  connection: 'finances',  // microapp
  attributes: {
    user_id: {
      type: 'integer',
      notNull: true,
      model: "users"
    },
    amount: {
      type: 'integer',
      defaultsTo: 0,
      notNull: true
    },
    account_name: {
      type: 'text',
      notNull:true
    },
    expenses: { //money given
      collection: "transactions",
      via: "from"
    },
    income: { //money obtained
      collection: "transactions",
      via: "from"
    }
  }
};