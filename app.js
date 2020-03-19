const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const bodyParser = require('body-parser');

const errorsController = require('./controllers/errors');

const constants = require('./util/constants');

const User = require('./models/user');

const MONGODB_URI = constants.dbString;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection : 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: true }));

//registering public directory
app.use(express.static(path.join(__dirname, 'public')));

//register sessions
app.use(
    session({secret : 'my secret', resave : false, saveUninitialized : false, store : store})
    );

//now i grab an pass in ALL route the user that is using the app
app.use((req, res, next) => {
    //If there's no session,i just proceed with the request (which won't be anything regarding the req.user as i'm hiding all the requests)
    if(!req.session.user){
        return next();
    }
    // //for the moment,just mock the id
    User.findById(req.session.user._id)
        .then(user => {
            //req.user = new User(user._id,user.email,user.password,user.isAdmin,user.cart);
            req.user = user; // <-- This is a FULL Mongoose Module so i can user ALL the method associated to a model;
            next();
        })
        .catch(err => {
            console.log(`error on retrieving user to pass all view ${err}`);
        })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
//any other route NOT mapped will land here...
app.use(errorsController.pageNotFound);

mongoose.connect(MONGODB_URI,{ useNewUrlParser: true , useUnifiedTopology: true})
.then(result => {
    console.log(`db connected! ${result}`);
    // User.findOne()
    // .then(user => {
    //     if(!user){
    //         const user = new User ({
    //             name : 'Luca',
    //             email : 'lucabio@hotmail.it',
    //             cart : {
    //                 items : []
    //             }
    //         })
    //         user.save();
    //     }
    // })
    
    app.listen(constants.serverPort); // this does createServer and server.listen bot
})
.catch(err => {
    console.log(`error while connecting to db ${err}`);
});