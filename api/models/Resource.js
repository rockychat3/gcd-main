module.exports = {
  
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    owner: {
      model: 'player'
    },
    hex: {
      model: 'hex'
    },
    amount: {
      type: 'int'
    },
    type: {
      model: 'resourcetype'
    }

  }
};