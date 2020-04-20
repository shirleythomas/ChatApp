const express = require("express")
const bodyParser = require('body-parser');
const passwordHash = require('password-hash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const formidable = require('formidable');
var fs = require('fs');

const app = express()
const port = 3000

const db = require('./database')

// Set template engine
app.set("view engine","ejs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({secret: 'my-secret-key',
                saveUninitialized: true,
                resave: true,
                cookie: { maxAge: 24*60*60*1000 }, //3 hours
                store: db.get_session_store(session)
            }));

var openChat = function(req, res){
    sess = req.session;
    //console.log(sess);
    var username = "";
    if(sess.user) {
        username = sess.user;
    }else{
        username = req.body.username;
    }

    var options = {method:"find", coll: "users", data:{"username":username}};
    db.execute(options, function(results){
        if(results.length == 0){
            res.status(401).json({ error: "Invalid Username/Password" });
            return;
        }
        user = results[0];
        if(sess.user || passwordHash.verify(req.body.password, user.password)){

            options = {method:"find", coll: "contacts", data:{"username":username}};
            db.execute(options, function(contacts){
                if(contacts.length>0){
                    options = {method:"find",
                                coll: "chats",
                                sort: "time",
                                order: -1,
                                limit: 10,
                                data:{"sender":username, "recipient":contacts[0].id}};
                    db.execute(options, function(chats){
                        
                        res.render("pages/index",{"pagename":"chat",
                                            "title":"Simple Chat App",
                                            "username":username,
                                            "display":user.displayname,
                                            "avatar":user.avatar,
                                            "contacts":contacts,
                                            "chats": chats});
                                            
                        
                        req.session.user = username;
                        req.session.save();
                    });
                } else{
                    res.render("pages/index",{"pagename":"chat",
                                            "title":"Simple Chat App",
                                            "username":username,
                                            "display":user.displayname,
                                            "avatar":user.avatar,
                                            "contacts":contacts});


                    req.session.user = username;
                    req.session.save();
                }
            });
        } else {
            // Invalid password
            res.status(401).json({ error: "Invalid Username/Password" });
        }
    });
}

app.get('/', (req, res) => {
    sess = req.session;
    if(sess.user) {
        openChat(req,res);
        return;
    }
    res.render("pages/index",{"pagename":"login","title":"Simple Chat Login"})
})

app.post('/home', (req, res) => {
    openChat(req,res);
});

app.get('/logout', (req, res) => {
    console.log("inside logout");
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("Destroyed session");
            res.redirect("/");
        }
     });
     console.log("finished logout");
    
});

app.get('/register', (req, res) => {
    res.render("pages/index",{"pagename":"register","title":"New User Account"});
});

app.post('/createuser', (req, res) => {

    var formData = {};
    var filename = "";
    var folder = './public/avatar/';
    new formidable.IncomingForm().parse(req)
    .on('field', (name, field) => {
        if(name !== "confirm"){
            formData[name] = field;
            console.log('Field', name, field)
        }
    })
    .on('fileBegin', (name, file) => {
        if(file.name){
            filename = folder + new Date().getTime().toString()+'_'+file.name
            file.path = filename
        }/*else{
            filename = "./public/img/default_avatar.png";
        }*/
        //formData["avatar"] = filename;

    })
    .on('file', (name, file) => {
        console.log('Uploaded file')
        // Hash password
        formData["password"] = passwordHash.generate(formData["password"]);

        console.log(formData);
        var options = {method:"insert", coll: "users", data: formData};
        db.execute(options);

        fs.rename(filename, folder+formData["username"], function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        res.redirect("/");
    })

    
});

app.post('/addcontact', (req, res) => {
    console.log("insert");

    var options = {method:"insert", coll: "contacts", data:{"username":req.body.username,
                                                "id":req.body.contactid,
                                                "name":req.body.contactname}};
    db.execute(options);
    console.log("done");
    res.redirect("/");
});

app.get('/contacts', (req, res) => {
    console.log(req.query.search);
    var options = {method:"find", coll: "users", data:{"displayname":new RegExp(req.query.search,"i")}};
    db.execute(options, function(contacts){
            res.json(contacts);
    });
});

app.get('/chats', (req, res) => {
    var options = {method:"find", coll: "chats",
                    data:{"sender":req.query.username, "recipient":req.query.recipient}};
    db.execute(options, function(chats){
            res.json(chats);
    });
});

// Instantiate server
server = app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

// Socket programming
const io = require("socket.io")(server)
var socketids=[];

io.on('connection',(socket)=>{

    socket.on('connectioninfo', (data) => {
        console.log(data.user+" connected.")
        //console.log(data);
        //console.log(socket.id);
        socketids[socket.id] = data.user;
        //console.log(socketids);
        
    });

    // Listen to the new message from client
    socket.on('new_message', (data) => {

        var filtered = Object.keys(socketids).filter(key => socketids[key] === data.recipient);
        console.log(filtered);

        //broadcast the new message
        io.sockets.in(filtered).emit('send_message', {message : data.message, username : data.username, recipient: data.recipient, time: data.time});
        //io.to(data.recipient).emit('send_message', {message : data.message, username : data.username});
        
        // Insert into chats
        var options = {method:"insert", coll: "chats",
                        data:[{"sender":data.username, "recipient": data.recipient,
                            "message":data.message, "type": "sent", "time":data.time},
                            {"sender":data.recipient, "recipient": data.username,
                            "message":data.message, "type": "reply", "time":data.time}]};
        /*options.data = {"sender":data.recipient, "recipient": data.username,
                        "message":data.message, "type": "reply", "time":data.time};*/
        db.execute(options);
    })

    // Listen to the typing event
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : data.username, recipient: data.recipient})
    })

    socket.on('disconnect', (data) => {
        delete socketids[socket.id];
    })
})