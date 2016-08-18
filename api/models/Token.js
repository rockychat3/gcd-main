module.exports = {
  
  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    string: {
      type: 'text'
    },
    player: {
      model: 'player',
      unique: true
    },
    type: {
      type: 'text'
    }

  }
};