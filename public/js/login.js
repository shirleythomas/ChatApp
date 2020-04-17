function login(){
    $.post( "", function(data) {
        console.log(data);
    }).done(function() {
        console.log("Success");
    })
    .fail(function(data) {
        console.log(data);
    });
}

function validate(){
    var username = $("#username").val();
    var password = $("#password").val();

    if(username === "" || password===""){
        return false;
    }

    return true;
}
