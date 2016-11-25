module.exports = {

  // response for errors
  e: function (res, error_message) {
    return res.json({ status: 'Error: ' + error_message});
  },
  
  // response for successes
  s: function (res, data) {
    return res.json({ status: 'success', data: data});
  }

}