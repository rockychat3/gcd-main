module.exports = {
  connection: 'players',  // microapp
  attributes: {
    name: {
      type: 'text',
      unique: true,
      notNull: true
    },
    tokens: {  // this automatically creates a many-to-many join with the tokens model
      collection: 'tokens',
      via: 'permissions'
    }
  }
};