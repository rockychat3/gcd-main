module.exports = {
  attributes: {
    home: {  // where the person lives
      model: 'homes',
      defaultsTo: 0,
      notNull: true,
    },
    employer: {  // where the person works
      model: 'employers',
    },
    excess_income: {
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    health: {
      type: 'integer',
      defaultsTo: 0,
    },
    happiness: {
      type: 'integer',
      defaultsTo: 0,
    },
  }
};