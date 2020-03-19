const User = require('../models/user');

const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    console.log(req.get('Cookie'));
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: null,
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.getSignup = (req, res, next) => {
    console.log(req.get('Cookie'));
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        isAuthenticated: req.session.isLoggedIn
    })
};

exports.postLogin = (req, res, next) => {
    const data = req.body;
    User.findOne({ 'email': data.email })
        .then(user => {
            if (!user) {
                throw 'User Does Not Exist!';
            }
            else {
                bcrypt.compare(data.password, user.password)
                    .then(compare => {
                        if (compare) {
                            //setting the session with the user found
                            req.session.user = user;
                            req.session.isLoggedIn = true;
                            //Redirect only AFTER session saved,in order to avoid not correctly loaded data in views
                            req.session.save(err => {
                                if(err){
                                    console.log(`error while saving session ${err}`);
                                }
                                res.redirect('/');
                            })
                        } else {
                            throw 'Wrong password,try again';
                        }
                    })
                    .catch(err => {
                        res.render('auth/login', {
                            pageTitle: 'Login',
                            path: '/login',
                            isAuthenticated: false,
                            errorMessage: err
                        })
                    })
            }
        })
        .catch(err => {
            console.log(`error while login ${err}`);

            res.render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                isAuthenticated: false,
                errorMessage: err
            })
        })
};

exports.postSignup = (req, res, next) => {
    const data = req.body;

    //check if user already exists
    User.findOne({ 'email': data.email })
        .then(user => {
            if (user) {
                const err = 'User already exists, you can directly login (if you remember your password) :-)';
                res.render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    isAuthenticated: false,
                    errorMessage: err
                })
            } else {
                return bcrypt.hash(data.password, 12);
            }
        })
        .then(hashedPassword => {
            const user = new User({
                name: data.name,
                surname: data.surname,
                email: data.email,
                password: hashedPassword,
                cart: { items: [] }
            });
            user.save()
                .then(res.redirect('/login'))
                .catch(err => {
                    console.log(`postAddproduct error ${err}`);
                })
        })
};

exports.postLogout = (req, res, next) => {
    //req.isLoggedIn = true;
    //res.setHeader('Set-Cookie','loggedIn=true');
    req.session.destroy(() => {
        res.redirect('/')
    })

};