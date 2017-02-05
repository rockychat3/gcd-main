module.exports = {
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
    user: {  // tokens belong to one user (token creator/owner)
      model: 'users',
      notNull: true
    },
  }
};