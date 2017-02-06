module.exports = {
  attributes: {
    // the government's name
    name: {  
      type: 'text',
      notNull: true,
      unique: true,
    },
    // the type of government, town or county
    govtype: {  
      type: 'string',
      enum: ['town', 'county'],
      defaultsTo: 'town',
    },
    user: {  // the user account linked to the government
      model: 'users',
    },
    primary_account: {  // where the money goes for government operations
      model: 'accounts',
    },
  },
};