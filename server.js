const express = require("express")
const bodyParser = require('body-parser');
const passwordHash = require('password-hash');

const app = express()
const port = 3000

const db = require('./database')
console.log(db);

// Set template engine
app.set("view engine","ejs")

app.use(express.static("public"))
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => 
    res.render("pages/index",{"pagename":"login","title":"Simple Chat Login"})
)

app.post('/home', (req, res) => {
    db("find", "users", {"username":req.body.username}, function(results){
        data = results[0];
        if(passwordHash.verify(req.body.password, data.password)){
            
            db("find", "contacts", {"username":req.body.username}, function(contacts){
                res.render("pages/index",{"pagename":"chat",
                                    "title":"Simple Chat App",
                                    "username":req.body.username,
                                    "display":data.displayname,
                                    "contacts":contacts});
            });


            
        }
        
    });

    
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
        io.sockets.emit('send_message', {message : data.message, username : data.username, recipient: data.recipient});
        //io.to(data.recipient).emit('send_message', {message : data.message, username : data.username});
    })

    // Listen to the typing event
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : data.username, recipient: data.recipient})
    })
})