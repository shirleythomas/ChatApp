$(function(){


    var username = $("#username")
    var message = $("#message")
    var recipient = $("#activeuser")

    // establish connection
    var socket = io.connect("http://localhost:3000/");

    socket.on('connect',function(){
      socket.emit("connectioninfo",{user: username.val()});
    });
    
    var send_message_btn = $("#send_message")

    var feedback = $("#feedback");

    var addcontact = $("#addcontact");
    var contactinfo = $("#contactinfo");

    var contact_submit = $("#contact-submit");

    var search_contact = $("#searchcontact");

    var sendmessage = function(){
      var now = Date.now();
      socket.emit("new_message",{message: message.val(),
        username: username.val(),
        recipient: recipient.val(),
        time: now});
        $("#lastmsgtime").val(now);
      newMessage("sent", message.val(),recipient.val());

      var contactcard = $("#contacts ul li p.id:contains('"+recipient.val()+"')").closest("li");
      $( "#contacts ul" ).prepend(contactcard);
    }

    send_message_btn.click(function(){
        sendmessage();
    })

    socket.on("send_message",(data) => {
      console.log(data.recipient);
      console.log(username.val());
        //if(data.recipient === username.val()){
            newMessage("reply", data.message, data.username);
            $("#lastmsgtime").val(data.time);
            var contactcard = $("#contacts ul li p.id:contains('"+data.username+"')").closest("li");
            $( "#contacts ul" ).prepend(contactcard);
        //}
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
    })

    var contactname = $("#contactname");

    contactname.bind("keyup", (event)=>{
      $.get( "/contacts", { search: contactname.val() }).done(function( data ) {
        $('#contactlist').empty();
        console.log(data);
        var names = $(".name").map(function(){return $(this).html();}).get();
        //console.log(names);
        
        data.forEach(function (element) {
          if(element.username!==username.val() && !names.includes(element.displayname)){
            $("#contactlist").append( $("<option>").attr('data-value', element.username).text(element.displayname));
            
          }
        });
      });
    })


    socket.on("typing", (data) => {
      if(data.recipient === username.val()){
        feedback.html("<p><i>"+data.username+" is typing a message...</i></p>")
        setTimeout(function(){
          feedback.html("");
        }, 3000);
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

    /*contactinfo.focusout(function(){
      closeContact();
    })*/

    contact_submit.click(function(){
      var contacthtml = $("#contactlist").html();
      console.log(contacthtml);

      if($(contacthtml).attr("data-value")){
        $.post( "/addcontact", { username: username.val(),
                              contactid: $(contacthtml).attr("data-value"),
                              contactname: $(contacthtml).val() }).done(function( data ) {
                                console.log(data);
                              });
      }

      closeContact();
    })


    $("#contacts ul li").click(function() {
      $("#contacts ul li").removeClass("active");
      $(this).addClass("active");

      activeuser=$(this).find(".id")[0].innerHTML;
      recipient.val(activeuser);
      
      console.log(activeuser);
      $("#activedisplay").html($(this).find(".name")[0].innerHTML);
      $("#recipient_avatar").attr("src","avatar/"+activeuser);

      $.get("/chats", { "username": username.val(), "recipient": activeuser}).done(function( data ) {
              $(".messageul").hide();
              if( $("#"+activeuser).length ){ // if active user tab exists
                $("#"+activeuser).show();
              } else {
                $('<ul class="messageul" id="'+activeuser+'"></ul>').appendTo($(".messages"));

                data.forEach(function(element) {
                  newMessage(element.type, element.message, activeuser);
                })
              }
              
            }).fail(function(err) {
              console.log( err);
            });

    });

    function newMessage(responseType, message, user) {
	
      if($.trim(message) == '') {
        return false;
      }
      var avatar = (responseType==="sent")? username.val():recipient.val();
      var messagecard =$('<li class="'+responseType+'"><img src="avatar/'+avatar+'" alt="" /><div><p>' + message + '</p></div></li>');
      if(responseType==="sent"){
        messagecard.appendTo($('.messages ul:visible'));
      }else{
        console.log(user);
        messagecard.appendTo($('.messages ul#'+user));
      }
      $('.message-input input').val(null);
      
      //$('.contact.active .preview').html('<span>You: </span>' + message);
      var contactcard =$('#contacts ul li p.id:contains("'+user+'")');
      contactcard.siblings('.preview').html(message);
      $(".messages").animate({ scrollTop: $(document).height() }, "fast");
    };

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



/*$('.submit').click(function() {
  newMessage();
});*/

/*$(window).on('keydown', function(e) {
  if (e.which == 13) {
    newMessage();
    return false;
  }
});*/