$(function() {
  $archiveButton = $('#archivebtn');
  $archiveButton.click(function(e) {
    $(this).prop('disabled', true);
    e.preventDefault();
  });
});
