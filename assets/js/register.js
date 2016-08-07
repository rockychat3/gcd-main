function register() {
  email = $('#email').val();
  name = $('#name').val();
  pass1 = $('#password').val();
  pass2 = $('#password2').val();

  if (pass1 != pass2) {
    $('#err').html('<p style="color:red;">Passwords do not match');
    $('#password').val('');
    $('#password2').val('');
  }
  else {
    
  }
}