module.exports = {

  // response for errors
  e: function (res, error_message) {
    return res.json({ status: 'Error: ' + error_message});
  },
  
  // response for successes
  s: function (res, data) {
    return res.json({ status: 'success', data: data});
  },
  
  // helper for generic callbacks
  cb: function (options, name, return_val) {
    if ('callback' in options) {
      options[name] = return_val;
      callback_function = options.callback;
      delete options.callback;
      callback_function(options);
    } else {
      return RespService.s(options.res, return_val);
    }
  },

}