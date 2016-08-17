function approve(name, email, password) {
  $.post('/admin/approve_student', { name: name, email: email, password: password }, function (success) {
    if (success == name) 
      window.location.reload();
  });
}

function reject(name) {
  $.post('/admin/reject_student', { name: name }, function (success) {
    if (success == name)
      window.location.reload();
  });
}

function endround() {
  $.post('/endround', function (res) {

  });
}
