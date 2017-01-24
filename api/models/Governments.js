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
    user: {  // player who owns the hex
      model: 'users',
    },
    primary_account: {  // interconnected region that connects to the hex
      model: 'accounts',
    },
  },
};