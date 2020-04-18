$(function(){

    // establish connection
    var socket = io.connect("http://localhost:3000")

    var message = $("#message")
    var username = $("#username")
    var recipient = $("#activeuser")
    
    var send_message = $("#send_message")

    var feedback = $("#feedback");

    var addcontact = $("#addcontact");
    var contactinfo = $("#contactinfo");

    var contact_submit = $("#contact_submit");

    send_message.click(function(){
        socket.emit("new_message",{message: message.val(), username: username.val(), recipient: recipient.val()});
        newMessage("sent", message.val());
    })

    socket.on("send_message",(data) => {
        if(data.username!==username.val()){
            newMessage("replies", data.message);
        }
    })
    
    message.bind("keypress", ()=>{
        socket.emit('typing', {username: username.val()})
    })

    socket.on("typing", (data) => {
        console.log("typing")
        feedback.html("<p><i>"+data.username+" is typing a message...</i></p>")
    })

    addcontact.click(function(){
      contactinfo.show();
    })

    contactinfo.focusout(function(){
      contactinfo.hide();
    })

    contact_submit.click(function(){
      event.preventDefault();
      contactinfo.hide();

      return false;
    })
})

$(".messages").animate({ scrollTop: $(document).height() }, "fast");

$("#profile-img").click(function() {
	$("#status-options").toggleClass("active");
});

$(".expand-button").click(function() {
  $("#profile").toggleClass("expanded");
	$("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function() {
	$("#profile-img").removeClass();
	$("#status-online").removeClass("active");
	$("#status-away").removeClass("active");
	$("#status-busy").removeClass("active");
	$("#status-offline").removeClass("active");
	$(this).addClass("active");
	
	if($("#status-online").hasClass("active")) {
		$("#profile-img").addClass("online");
	} else if ($("#status-away").hasClass("active")) {
		$("#profile-img").addClass("away");
	} else if ($("#status-busy").hasClass("active")) {
		$("#profile-img").addClass("busy");
	} else if ($("#status-offline").hasClass("active")) {
		$("#profile-img").addClass("offline");
	} else {
		$("#profile-img").removeClass();
	};
	
	$("#status-options").removeClass("active");
});

function newMessage(responseType, message) {
	
	if($.trim(message) == '') {
		return false;
	}
	$('<li class="'+responseType+'"><img src="img/female_avatar.jpg" alt="" /><p>' + message + '</p></li>').appendTo($('.messages ul'));
	$('.message-input input').val(null);
	$('.contact.active .preview').html('<span>You: </span>' + message);
	$(".messages").animate({ scrollTop: $(document).height() }, "fast");
};

/*$('.submit').click(function() {
  newMessage();
});*/

/*$(window).on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});*/