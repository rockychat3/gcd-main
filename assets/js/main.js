function logout() {
  $.post('/logout', function() {
    window.location.reload();
  });
}