function validate(event){
    var password = $("#password").val();
    var confirm = $("#confirm").val();

    if(password!==confirm){
        event.preventDefault();
        return false;
    }

    return true;
}
