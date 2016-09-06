function token(type) {
  $.ajax({
    url: '/createToken',
    method: 'POST',
    data: {
      type: type
    },
    statusCode: {
      400: function() {alert('Please enter a type between 1 and 5');},
      500: function() {alert('Something went wrong creating the token');},
    },
    success: function(token) {
      $('#token').html(`<div class="alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Token: ${token}</div>`);
    }
  });
}