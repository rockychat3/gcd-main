module.exports = {

  autoCreatedAt: false,
  autoUpdatedAt: false,
  attributes: {

    id: {
      type: 'integer',
      primaryKey: true
    },
    name: {
      type: 'text'
    },
    email: {
      type: 'text'
    },
    password: {
      type: 'text'
    }

  }
};