module.exports = {
  //connection: 'players',  // microapp
  attributes: {
    token: {
      type: 'text',
      unique: true,
      notNull: true
    },
    expiration: {
      type: 'datetime',
      defaultsTo: null
    },
    supertoken: {
      type: 'boolean',
      defaultsTo: false
    },
    user: {  // tokens belong to one user (token creator/owner)
      model: 'users',
      notNull: true
    },
    permissions: {  // tokens have one permission
      model: 'permissions'
    }
  }
};