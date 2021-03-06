const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');

const errorsController = require('./controllers/errors');

const constants = require('./util/constants');

const User = require('./models/user');

const MONGODB_URI = constants.dbString;

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection : 'sessions'
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination : (req,file,cb) =>{
        cb(null,'images');
    },
    filename: (req,file,cb) => {
        cb(null,new Date().toISOString() + '-' + file.originalname);
    }
})

const fileFilter = (req,file,cb)=>{
    console.log(file.mimetype);
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage : fileStorage, fileFilter : fileFilter }).single('image'));
//registering public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

//register sessions
app.use(
    session({secret : 'my secret', resave : false, saveUninitialized : false, store : store,cookie :{maxAge:false}})
    );

app.use(csrfProtection);
app.use(flash());

//now i grab an pass in ALL route the user that is using the app
app.use((req, res, next) => {
    //If there's no session,i just proceed with the request (which won't be anything regarding the req.user as i'm hiding all the requests)
    if(!req.session.user){
        return next();
    }
    // //for the moment,just mock the id
    User.findById(req.session.user._id)
        .then(user => {
            if(!user){
                return next();
            }
            //req.user = new User(user._id,user.email,user.password,user.isAdmin,user.cart);
            req.user = user; // <-- This is a FULL Mongoose Module so i can user ALL the method associated to a model;
            next();
        })
        .catch(err => {
            throw new Error(err);
        })
});
//Add some local variables (which means that they are available in ALL Views)
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    
    res.locals.emailWelcome = req.session.isLoggedIn? req.user.email : null;
    
    next();
})



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
//any other route NOT mapped will land here...

app.get('/500',errorsController.get500);

app.use(errorsController.pageNotFound);

//handling error messages and redirect to pages 500
app.use((error,req,res,next)=>{
    req.flash('error',error.message);
    console.log(error);
    res.redirect('/500');
})

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