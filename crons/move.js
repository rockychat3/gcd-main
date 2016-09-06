module.exports = {

  run: function () {
    Movingresource.query(`SELECT target, type, completion, amount, selling, player FROM movingresource`, function (e, moving) {
      if (moving.rows.length) {
        for (var i in moving.rows) {
          if (new Date() >= new Date(moving.rows[i].completion)) {

            Resource.query(`UPDATE resource SET amount = amount + ${moving.rows[i].amount} WHERE hex = ${moving.rows[i].target}`, function (e, target) {
              Movingresource.query(`DELETE FROM movingresource WHERE completion = '${moving.rows[i].completion}' AND target = ${moving.rows[i].target}`, function (e, m) {
                if (moving.rows[i].selling) {
                  Resourcetype.query(`SELECT price FROM resourcetype WHERE id = ${moving.rows[i].player}`, function (e, t) {  
                    Player.query(`UPDATE player SET money = money + ${t.rows[0].price * 0.85 * moving.rows[i].amount} WHERE id = ${moving.rows[i].player}`);
                  });   
                }
              });
            });

          }
        }
      }
    });
  }

}