function login() {
  email = $('#email').val().replace(/\s+/, '');
  password = $('#password').val();
  $.post('/login', { email: email, password, password }, function (success) {
    if (success == 'Logged in') {
      if (document.referrer && document.referrer != window.location.href && document.referrer.split('//')[1].split('/')[0] == window.location.host )
        window.location.href = document.referrer;
      else 
        window.location.href = '/';
    }
    else {
      $('#password').val('');
      $('#err').html('<div class="alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Unable to find email/password combination</div>');
    }
  });
}

function logout() {
  $.post('/logout', function() {
    window.location.reload();
  });
}