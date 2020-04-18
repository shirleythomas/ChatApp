const express = require("express")
const bodyParser = require('body-parser');
const passwordHash = require('password-hash');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');

mongoose.connect('mongodb://localhost:27017/chatapp');
mongoose.Promise = global.Promise;
const db1 = mongoose.connection

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
                store: new MongoStore({ mongooseConnection: db1,
                    ttl: 24 * 60 * 60 // Keeps session open for 1 day 
                })
            }));

var openChat = function(req, res){
    //console.log(req.body);
    sess = req.session;
    //console.log(sess);
    var username = "";
    if(sess.user) {
        username = sess.user;
    }else{
        username = req.body.username;
        req.session.user = username;
        req.session.save();
    }
    db("find", "users", {"username":username}, function(results){
        data = results[0];
        if(sess.user || passwordHash.verify(req.body.password, data.password)){
            db("find", "contacts", {"username":username}, function(contacts){
                db("find", "chats", {"sender":username}, function(chats){
                    
                    res.render("pages/index",{"pagename":"chat",
                                        "title":"Simple Chat App",
                                        "username":username,
                                        "display":data.displayname,
                                        "contacts":contacts,
                                        "chats": chats});
                });
            });
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
    var hashedPassword = passwordHash.generate(req.body.password);
    db("insert", "users", {"username":req.body.username,
                "displayname":req.body.display,
                "password":hashedPassword});
    res.redirect("/");
});

app.post('/addcontact', (req, res) => {
    db("insert", "contacts", {"username":req.body.username,
                "contactid":req.body.id,
                "contactname":req.body.name});
});

// Instantiate server
server = app.listen(port, () => console.log(`App listening at http://localhost:${port}`))

const io = require("socket.io")(server)

io.on('connection',(socket)=>{
    console.log("New User Connected.")

    // Listen to the new message from client
    socket.on('new_message', (data) => {
        //broadcast the new message
        var now = Date.now();
        io.sockets.emit('send_message', {message : data.message, username : data.username, recipient: data.recipient, time: now});
        //io.to(data.recipient).emit('send_message', {message : data.message, username : data.username});
        db("insert", "chats", {"sender":data.username, "recipient": data.recipient,
                "message":data.message, "type": "sent", "time":now});
        // Duplicate entry to be seen in the receiver screen.
        db("insert", "chats", {"sender":data.recipient, "recipient": data.username,
                "message":data.message, "type": "reply", "time":now});
    })

    // Listen to the typing event
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : data.username, recipient: data.recipient})
    })
})