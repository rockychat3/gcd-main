module.exports = {
  
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    sending: {
      model: 'player'
    },
    receiving: {
      model: 'player'
    },
    amount: {
      type: 'integer'
    },
    date: {
      type: 'date'
    },
    reason: {
      type: 'text'
    },
    complete: {
      type: 'boolean'
    }

  }
};