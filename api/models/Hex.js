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
      model: 'tier'
    },
    resource: {
      model: 'resourcetype'
    },
    amount: {
      type: 'integer'
    },
    population: {
      type: 'integer'
    }    
  }
};