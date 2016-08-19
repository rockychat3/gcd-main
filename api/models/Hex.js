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
      model: 'player',
      unique: true
    },
    river: {
      type: 'bool'
    },
    tier: {
      type: 'text'
    },
    power: {
      type: 'integer'
    },
    power: {
      type: 'integer'
    }    
  }
};