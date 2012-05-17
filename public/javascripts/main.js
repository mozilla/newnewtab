$(function() {
  // BrowserID login.
  $('#login').click(function() {
    navigator.id.getVerifiedEmail(function(assertion) {
      if (assertion) {
        $('form.login input[name="bid_assertion"]').val(assertion);
        $('form.login').submit();
      }
    });
  });
});
