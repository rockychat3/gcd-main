/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {
  connection: 'productionServer',  // put all tables in the gcd database @TODO: remove the default
  autoPK: true,  // ensure that ALL tables have a unique, auto-incrementing 'id' field as primary key
  migrate: 'alter'  // auto-modifies a table if the schema changes in the model @TODO: ONLY for development
};
