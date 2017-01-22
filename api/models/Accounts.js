module.exports = {
  attributes: {
    user: {  // tokens belong to one user (token creator/owner)
      model: 'users',
      notNull: true,
    },
    amount: {
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    account_name: {
      type: 'text',
      notNull:true,
    },
    expenses: { //money given
      collection: "transactions",
      via: "to",
    },
    income: { //money obtained
      collection: "transactions",
      via: "from",
    },
  }
};