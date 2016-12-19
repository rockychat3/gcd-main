module.exports = {

  // This calls the next function in the list and continues the callback chain
  callNext: function (flow) {
    if (!flow.callbacks.length) return RespService.s(flow.res, flow.returnable_data);
    var next_call = flow.callbacks.shift();
    if ("params" in next_call) next_call.callback(flow, next_call.params);
    else next_call.callback(flow);
  }
}