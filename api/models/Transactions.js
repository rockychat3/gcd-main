module.exports = {
  connection: 'finances',  // microapp
  attributes: {
    amount: {
      type: 'integer',
      notNull: true
    },
    notes: {
      type: 'text',
      notNull: true
    },
    from: { //sender
      type: 'integer',
      notNull:true,
      model: 'accounts'
    },
    to: { //reciever
      type: 'integer',
      notNull:true,
      model: 'accounts'
    }
  }
};