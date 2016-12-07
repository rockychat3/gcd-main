module.exports = {
  connection: 'finances',  // microapp
  attributes: {
    user_id: {
      type: 'integer',
      notNull: true,
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
      via: "to"
    },
    income: { //money obtained
      collection: "transactions",
      via: "from"
    }
  }
};