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
      type: 'int'
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