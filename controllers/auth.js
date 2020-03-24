const User = require('../models/user');

const bcrypt = require('bcryptjs');

var Email = require('./emailSender');

//Required to generate a token (EX. for reset password requests)
//this is a package provide by node.js not require another installation
const crypto = require('crypto');

const { check, validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    })
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: null,
        oldInput: {
            name: '',
            surname: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
};

exports.postLogin = (req, res, next) => {
    const data = req.body;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: data.email,
                password: data.password
            },
            validationErrors: errors.array()
        })

    }

    User.findOne({ 'email': data.email })
        .then(user => {
            //setting the session with the user found
            req.session.user = user;
            req.session.isLoggedIn = true;
            //Redirect only AFTER session saved,in order to avoid not correctly loaded data in views
            return req.session.save()
        })
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(`error while login ${err}`);
            req.flash('error', err);

            res.redirect('/login')
        })
};

exports.postSignup = (req, res, next) => {
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                name: data.name,
                surname: data.surname,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword
            },
            validationErrors: errors.array()
        })

    }
    bcrypt
        .hash(data.password, 12)
        .then(hashedPassword => {
            const user = new User({
                name: data.name,
                surname: data.surname,
                email: data.email,
                password: hashedPassword,
                cart: { items: [] }
            });
            user.save()
                .then(() => {
                    const html = `Hi ${user.name} , a new account has been created with email ${data.email} on Node Server Test<br>Thank you!`
                    const email = new Email(data.email, 'Node Server - New Registration', html);
                    email.send((err, res) => {
                        if (err) {
                            console.log(`error while sending registration email ${err}`)
                        }
                        if (res) {
                            console.log(`Email sent successfully ${res}`)
                        }
                    });
                    res.redirect('/login')
                })
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

exports.getResetPassword = (req, res, next) => {
    console.log('get ResetPassword');
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null;
    }
    res.render('auth/reset-password', {
        pageTitle: 'Reset Password',
        path: '/reset-password',
        errorMessage: message
    })
}

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buf) => {
        if (err) {
            //.....we can add flash message
            return res.redirect('/reset-password');
        }
        const token = buf.toString('hex');

        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                req.flash('error', 'No accounts are associated to the email provided');
                return res.redirect('/reset-password');
            } else {
                user.resetToken = token;
                user.resetTokenExpiry = Date.now() + 3600000;
                return user.save();
            }
        }).then(result => {
            res.redirect('/');
            const html = `<p>You requested a password reset.</p>
                <p>Click <a style="color:black;" href="http://localhost:3000/set-new-password/${token}/">this link</a> to set a new password.</p>`
            const email = new Email(req.body.email, 'Node Server - New Registration', html);
            email.send((err, res) => {
                if (err) {
                    console.log(`error while sending registration email ${err}`)
                }
                if (res) {
                    console.log(`Email sent successfully ${res}`)
                }
            });
        }).catch(err => console.log(err))
    });
}

exports.getSetNewPassword = (req, res, next) => {
    console.log('get ResetPassword');
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }).then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0]
        } else {
            message = null;
        }
        res.render('auth/set-new-password', {
            pageTitle: 'Set New Password',
            path: '/set-new-password',
            userId: user._id.toString(),
            passwordToken: token,
            errorMessage: message
        })
    }).catch(err => console.log(err))
}

exports.postSetNewPassword = (req, res, next) => {
    const password = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiry: { $gt: Date.now() }, _id: userId }).then(user => {
        resetUser = user;

        return bcrypt.hash(password, 12);
    })
        .then(password => {
            resetUser.password = password;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiry = null;

            return resetUser.save();
        })
        .then(result => {
            //....FINISH,we can now send an email confirmation to the user and redirect it to the login screen (maybe with a message)
            res.redirect('/login');
            const html = `<p>Password Reset Successfully</p>
                <p>Click <a style="color:black;" href="http://localhost:3000/login">this link</a> to login into Node Server Shopping Site.</p>`
            const email = new Email(resetUser.email, 'Node Server - New Registration', html);
            email.send((err, res) => {
                if (err) {
                    console.log(`error while sending registration email ${err}`)
                }
                if (res) {
                    console.log(`Email sent successfully ${res}`)
                }
            });
        })
        .catch(err => console.log(err))


}