module.exports = {

  run: function () {
    World.query(`SELECT start, started FROM world WHERE started = true`, function (err, world) {
      if (world && world.rows && world.rows.length) {          
        Player.query(`SELECT player.growing, hex.population FROM player INNER JOIN hex ON player.growing=hex.id WHERE admin = false`, function (e, hex) {
          if (hex && hex.rows && hex.rows.length) {

            // Accounts for first hour 
            var toAdd = Math.floor((new Date() - new Date(world.rows[0].start)) / 3600000) == 0 ? 0 : Math.ceil(28000 / (1 + Math.pow(Math.E, -0.2*(Math.floor((new Date() - new Date(world.rows[0].start)) / 3600000) / 168 - 15))) - 28000 / (1 + Math.pow(Math.E, -0.2*(Math.floor((new Date() - new Date(world.rows[0].start)) / 3600000 - 3600000) / 168 - 15))));
            var query = `UPDATE hex SET population = population + ${toAdd} WHERE `;
            
            for (var i in hex.rows) {
              query += `id = ${hex.rows[i].growing} OR `;
            }
            query = query.substr(0, query.length - 3);

            Hex.query(query);

          }
        });
      }
    });
  }

}