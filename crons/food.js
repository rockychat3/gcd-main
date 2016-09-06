module.exports = {

  run: function () {
    Food.query(`SELECT food.rate, food.mix, food.type, resource.amount, resource.hex, resource.id, hex.population FROM food INNER JOIN resource ON food.resource=resource.id INNER JOIN hex ON resource.hex=hex.id`, function (e, food) {
      for (var i in food.rows) {
        var mix;
        if (food.rows[i].type == 4) {
          mix = 100 - food.rows[i].mix;
        }
        else {
          mix = food.rows[i].mix;
        }

        Resource.query(`UPDATE resource SET amount = amount - ${mix * food.rows[i].rate / 10000 * food.rows[i].population >= food.rows[i].amount ? food.rows[i].amount : mix * food.rows[i].rate / 10000 * food.rows[i].population} WHERE id = ${food.rows[i].id}`);
      }
    });
  }

}