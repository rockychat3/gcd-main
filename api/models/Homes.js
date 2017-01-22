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
    res_count: {
      type: 'integer',
      defaultsTo: 0,
    },
  }
};
