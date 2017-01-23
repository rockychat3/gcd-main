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
    positions: {
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    wage: {
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    worker_count: {
      type: 'integer',
      defaultsTo: 0,
    },
  }
};