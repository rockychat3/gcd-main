module.exports = {
  attributes: {
    owner: {  // the owner of the housing unit
      model: 'users',
      notNull: true,
    },
    hex: {  // the location of the housing unit
      model: 'hexes',
      notNull: true,
    },
    capacity: {
      type: 'integer',
      defaultsTo: 1,
      notNull: true,
    },
    /*res_count: {
      type: 'integer',
      defaultsTo: 0,
    },*/
    account: {
      model: 'accounts',
      notNull: true,
    },
    rent: {
      type: 'integer',
      defaultsTo: 1,
      notNull: true,
      positive: true,
    },
    upgraded: {
      type: 'boolean',
      defaultsTo: false,
    },
    renters: {  // this automatically creates a has-many join with the citizens model
      collection: 'citizens',
      via: 'home',
    },
  },
  
  types: {
    positive: function(value) {
      return (value > 0);
    }
  }
};
