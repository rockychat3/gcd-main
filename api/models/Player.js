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
    },
    money: {
      type: 'integer'
    },
    growing: {
      model: 'hex',
      unique: true
    },
    admin: {
      type: 'boolean'
    }
  }
};