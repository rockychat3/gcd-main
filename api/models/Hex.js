module.exports = {

  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },

    row: {
      type: 'integer'
    },

    col: {
      type: 'integer'
    },

    player: {
      model: 'player',
      unique: true
    },

    power: {
      type: 'integer'
    },

    tier: {
      type: 'text'
    }

  }

};