module.exports = {

  api: function (res, error_message, data) {
    var return_json = { status: 'success'};
    if (data) return_json.data = data;
    if (error_message) return_json.status = 'Error: ' + error_message;
    return res.json(return_json);
  }

}