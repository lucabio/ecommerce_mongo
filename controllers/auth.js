const User = require('../models/user');

const bcrypt = require('bcryptjs');

var validate = require("validate.js");

const {check,validationResult} = require('express-validator');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0){
        message = message[0]
    }else{
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    })
};

exports.getSignup = (req, res, next) => {
    console.log('validate script' + validate);
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        validate : validate,
        errorMessage : null
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
                        req.flash('error',err);

                        res.redirect('/login')
                        // res.render('auth/login', {
                        //     pageTitle: 'Login',
                        //     path: '/login',
                        //     errorMessage: err
                        // })
                    })
            }
        })
        .catch(err => {
            console.log(`error while login ${err}`);
            req.flash('error',err);

            res.redirect('/login')
            // res.render('auth/login', {
            //     pageTitle: 'Login',
            //     path: '/login',
            //     errorMessage: err
            // })
        })
};

exports.postSignup = (req, res, next) => {
    const data = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()
        })
        
    }
    //check if user already exists
    User.findOne({ 'email': data.email })
        .then(user => {
            if (user) {
                const err = 'User already exists, you can directly login (if you remember your password) :-)';
                res.render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
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