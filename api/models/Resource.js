module.exports = {
  
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    owner: {
      model: 'player',
      unique: true
    },
    hex: {
      model: 'hex',
      unique: true
    },
    amount: {
      type: 'int'
    },
    type: {
      model: 'resourcetype',
      unique: true
    }

  }
};