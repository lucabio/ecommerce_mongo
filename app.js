//const http = require('http');
const express = require('express');

const mongoDb = require('./util/database');

const path = require('path');

const bodyParser = require('body-parser');

const errorsController = require('./controllers/errors');

const constants = require('./util/constants');

const User = require('./models/user');
const constant = require('./util/constants');

const app = express();

// app.engine('hbs', expressHbs(
//     {
//         layoutsDir : 'views/layouts/',
//         defaultLayout : 'main',
//         extname: 'hbs'
//     }
// ));
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');

const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: true }));

//registering public directory
app.use(express.static(path.join(__dirname, 'public')));

//now i grab an pass in ALL route the user that is using the app
app.use((req, res, next) => {
    // //for the moment,just mock the id
    User.findById('5e6e734071857f8f2602c6f7')
        .then(user => {
            req.user = new User(user._id,user.email,user.password,user.isAdmin,user.cart);
            next();
        })
        .catch(err => {
            console.log(`error on retrieving user to pass all view ${err}`);
        })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
//any other route NOT mapped will land here...
app.use(errorsController.pageNotFound);



//connect to client
mongoDb.mongoConnect(() => {
    //check if there already is an admin user,
    //otherwise i create it with credentials setted in constants.js
    User.fetch({ admin: true })
        .then(user => {
            console.log('users ' + user);
            if (!user) {
                const user = new User(null, constant.adminUser, constant.adminPassword, true);
                user.save();
            }
        })
        .catch(err => {
            console.log(`error while fetching admin user ${err}`);
        })


    app.listen(constants.serverPort); // this does createServer and server.listen bot
})