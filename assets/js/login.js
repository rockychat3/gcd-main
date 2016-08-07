function login() {
  name = $('#name').val();
  password = $('#password').val();
  console.log(name, password);

  $.post('/login', { name: name, password, password }, function (success) {
    // console.log(success);
    if (success == 'Logged in') {

      if (document.referrer && document.referrer != window.location.href && document.referrer.split('//')[1].split('/')[0] == window.location.host )
        window.location.href = document.referrer;
      else 
        window.location.href = '/';
    }
    else {
      window.location.reload();
    }
  });
}

function logout() {
  $.post('/logout', function() {
    window.location.reload();
  });
}