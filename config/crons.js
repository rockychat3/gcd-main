module.exports.crons = {

  cron: function () {
    var times = [];
    //times.push({ interval: '* 15 * * * *', method: 'move' });
    //times.push({ interval: '* * 1 * * *', method: 'food' });
    //times.push({ interval: '* * 1 * * *', method: 'populate' });

    return times;
  },

  move: function () {
    require('../crons/move.js').run();
  },

  food: function () {
    require('../crons/food.js').run();
  },

  populate: function () {
    require('../crons/populate.js').run();
  }

}