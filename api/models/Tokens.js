module.exports = {
  connection: 'players',  // microapp
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
    user: {
      model: 'users'
    },
    permissions: {  // this automatically creates a many-to-many join with the permissions model
      collection: 'permissions',
      via: 'tokens'
    }
  }
};