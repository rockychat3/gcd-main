module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    label: {
      type: 'text'
    },
    owner: {
      model: 'player'
    },
    river: {
      type: 'boolean'
    },
    tier: {
      type: 'text'
    },
    power: {
      type: 'integer'
    },
    water: {
      type: 'integer'
    },
    population: {
      type: 'integer'
    }    
  }
};