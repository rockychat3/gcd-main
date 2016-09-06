function approve(name, email, password) {
  $.post('/admin/approve_student', { name: name, email: email, password: password }, function (success) {
    if (success == 'Success') 
      window.location.reload();
    else
        alert(success);
  });
}

function reject(name) {
  $.post('/admin/reject_student', { name: name }, function (success) {
    if (success == 'Success')
      window.location.reload();
    else
      alert(success); 
  });
}

function commit() {
  $.post('/admin/edit', { hex: $('#hex').val(), key: $('#field').val(), value: $('#value').val() }, function (success) {
    if (success == 'Success')
      window.location.reload();
    else
      alert(success); 
  });
}

function startGame() {
  $.post('/admin/start', function (res) {
    alert(res);
    window.location.reload();
  });
}
