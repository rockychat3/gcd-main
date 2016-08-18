function login() {
  name = $('#name').val();
  password = $('#password').val();
  $.post('/login', { name: name, password, password }, function (success) {
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