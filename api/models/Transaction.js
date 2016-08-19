module.exports = {
  
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    sending: {
      model: 'player',
      unique: true
    },
    receiving: {
      model: 'player',
      unique: true
    },
    amount: {
      type: 'int'
    },
    date: {
      type: 'date'
    },
    reason: {
      type: 'text'
    },
    sending: {
      complete: 'bool'
    }

  }
};