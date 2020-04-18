$(function(){

    // establish connection
    var socket = io.connect("http://localhost:3000")

    var message = $("#message")
    var username = $("#username")
    var recipient = $("#activeuser")
    
    var send_message_btn = $("#send_message")

    var feedback = $("#feedback");

    var addcontact = $("#addcontact");
    var contactinfo = $("#contactinfo");

    var contact_submit = $("#contact-submit");

    var search_contact = $("#searchcontact");

    var sendmessage = function(){
      socket.emit("new_message",{message: message.val(),
        username: username.val(),
        recipient: recipient.val()});
      newMessage("sent", message.val());
    }

    send_message_btn.click(function(){
        sendmessage();
    })

    socket.on("send_message",(data) => {
      console.log(data.recipient);
      console.log(username.val());
        if(data.recipient === username.val()){
            newMessage("replies", data.message);
        }
    })
    
    message.bind("keypress", (event)=>{
        socket.emit('typing', {username: username.val(), recipient: recipient.val()})
        if (event.which == 13) {
          sendmessage();
          return false;
        }
    })

    search_contact.bind("keyup", (event)=>{
      console.log(event);
      $(".name").each(function() {
        if($( this ).html().toLowerCase().indexOf(search_contact.val().toLowerCase()) >= 0){
          $( this ).closest( "li" ).show();
        }else{
          $( this ).closest( "li" ).hide();
        }
      });
      /*$(".name:contains('"+search_contact.val()+"')").each(function() {
        $( this ).closest( "li" ).show();
      });*/
    })

    var contactname = $("#contactname");
    contactname.bind("keyup", (event)=>{
      $.get( "/contacts", { search: contactname.val() }).done(function( data ) {
        console.log(data);
        var availableTags = [];
        var names = $(".name").map(function(){return $(this).html();}).get();
        console.log(names);
        data.forEach(function (element) {
          if(!names.includes(element.displayname)){
            availableTags.push(element.displayname);
          }
        });
        $( "#contactname" ).autocomplete({
          source: availableTags
        });
      });
    })

    socket.on("typing", (data) => {
      if(data.recipient === username.val()){
        feedback.html("<p><i>"+data.username+" is typing a message...</i></p>")
        setTimeout(function(){
          feedback.html("");
        }, 5000);
      }
    })

    addcontact.click(function(){
      contactinfo.show();
    })

    $("#addcontacticon").click(function(){
      contactinfo.show();
    })


    var closeContact = function(){
      contactinfo.hide();
      contactname.val("");
    }

    contactinfo.focusout(function(){
      closeContact();
    })

    contact_submit.click(function(){
      console.log(11);
      $("#contact-form").submit();
      closeContact();
    })

})

$(".messages").animate({ scrollTop: $(document).height() }, "fast");

$("#profile-img").click(function() {
	$("#status-options").toggleClass("active");
});

$(".expand-button").click(function() {
  var url = window.location.href;
  var index = url.indexOf("home");
  if(index>0) {
    url = url.replace('home', 'logout');
    window.location.href = url;
  }else{
    window.location.href = url+"logout";
  }
  //$("#profile").toggleClass("expanded");
	//$("#contacts").toggleClass("expanded");
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
	$('<li class="'+responseType+'"><img src="img/female_avatar.jpg" alt="" /><div><p>' + message + '</p></div></li>').appendTo($('.messages ul'));
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