function validate(event){
    var password = $("#password").val();
    var confirm = $("#confirm").val();

    if(password!==confirm){
        event.preventDefault();
        $("#status").val("Password and Confirm Password do not match.");
        return false;
    }

    return true;
}

$( "form" ).on( "submit", function( event ) {
    event.stopPropagation();
    //event.preventDefault();
    $("#login-submit").attr("disabled", true);
  });

  function readURL(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      
      reader.onload = function(e) {
        $('#preview').attr('src', e.target.result);
      }
      
      reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
  }
  
  $("#myavatar").change(function() {
    readURL(this);
  });
