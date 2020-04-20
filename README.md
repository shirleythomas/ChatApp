# ChatApp
Naive Chat App using Node.js and MongoDB.

To get the app running:
```bash
$ npm install --save express
$ npm install --save ejs
$ npm install --save nodemon
$ npm install --save socket.io
$ npm install --save mongodb
$ npm install --save express-session
$ npm install --save multer
```

Launch app by running:
```bash
$ npm run start
```

The server is currently written to listen on port 3000.

The app should be available in:
http://localhost:3000/

# Password Hashing
https://www.npmjs.com/package/password-hash

# Session Management
Right now it is stored in MongoDB to avoid complications but the best practice is to store it in Redis.

# UI
![Login page](https://github.com/shirleythomas/ChatApp/blob/master/screenshot/login.jpg)
![New User page](https://github.com/shirleythomas/ChatApp/blob/master/screenshot/newuser.jpg)

# Tutorial
Started off with:
https://medium.com/@noufel.gouirhate/build-a-simple-chat-app-with-node-js-and-socket-io-ea716c093088

# Credits
Initial HTML Template

https://codepen.io/emilcarlsson/pen/ZOQZaV

Login

https://codepen.io/kzmkrksc/pen/dyPByyO

CC0 Image from Unsplash by:
Ali Yahya
