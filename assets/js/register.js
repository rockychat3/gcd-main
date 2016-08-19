function register() {
  email = $('#email').val();
  name = $('#fname').val().replace(/\s+/, '') + ' ' + $('#lname').val().replace(/\s+/, '');
  pass1 = $('#password').val();
  pass2 = $('#repassword').val();

  if (pass1 != pass2) {
    $('#err').html('<div class="alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> Passwords do not match</div>');
    $('#password').val('');
    $('#repassword').val('');
  }
  else {
    $.post('/register', { email: email, name: name, password: pass1 }, function (success) {
      if (success == 'Success') {
        alert('Successfully registered! Awaiting approval...');
        window.location.href = '/';
      }
      else {
        $('#password').val('');
        $('#repassword').val('');
        $('#err').html('<div class="alert alert-danger"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>User already registered, try again</div>');
      }
    });
  }
}