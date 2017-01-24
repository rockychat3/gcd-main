module.exports = {
  attributes: {
    business_type: {
      type: 'text',
      notNull: true,
    },
    hex: {  // the location of the employer
      model: 'hexes',
      notNull: true,
      unique: true,
    },
    positions: {  // how many positions are currently open for workers to fill
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    wage: {  // amount per week paid to employees
      type: 'integer',
      defaultsTo: 0,
      notNull: true,
    },
    worker_count: {  // number of workers currently at this job
      type: 'integer',
      defaultsTo: 0,
    },
  }
};