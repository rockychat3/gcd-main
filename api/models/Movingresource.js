module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    type: {
      model: 'resourcetype'
    },
    target: {
      model: 'hex'
    },
    amount: {
      type: 'integer'
    },
    player: {
      model: 'player'
    },
    completion: {
      type: 'date'
    },
    selling: {
      type: 'boolean'
    }
  }  
};