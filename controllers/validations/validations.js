const { check, body } = require('express-validator');

const bcrypt = require('bcryptjs');

const User = require('../../models/user');

exports.signupValidation = [
    check('name')
    .notEmpty().withMessage('Name cannot be empty')
    .matches(/^[a-zA-Z ]+$/i).withMessage('Name can contains only text')
    .ltrim()
    .rtrim(),
    check('surname')
    .notEmpty().withMessage('Surname cannot be empty')
    .matches(/^[a-zA-Z ]+$/i).withMessage('Surname can contains only text')
    .ltrim()
    .rtrim(),
    check('email', 'Please enter a valid email')
        .isEmail()
        //custom validation!!
        .custom((value, { req }) => {
            return User.findOne({ 'email': value })
            .then(user => {
                if (user) {
                    return Promise.reject('User already exists, you can directly login (if you remember your password) :-)')
                }
            })
        })
    .normalizeEmail(),
    //alternative...
    body('password', 'Password should be at least long 5 chars and its allowed to enter only numbers and text')
        .isLength({ min: 5 }).isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Passwords must match')
            }else{
                return true
            }
        })
        .trim()
    ]


exports.loginValidations = [
    check('email', 'Please enter a valid email')
        .isEmail()
        //custom validation!!
        .custom((value, { req }) => {
            return User.findOne({ 'email': value })
            .then(user => {
                if (!user) {
                    return Promise.reject('User does not exists.')
                }else{
                    return bcrypt.compare(req.body.password, user.password)
                        .then(result => {
                            
                            if(result){
                                return true
                            }else{
                                return Promise.reject('User does not match with the email inserted')
                            }
                        })
                }
            })
        })
        .normalizeEmail(),
]

exports.productValidation = [
    check('title')
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({min : 3}).withMessage('Title must have minimum length of 3 characters')
    .trim(),
    check('price','Please enter a price that contains only numbers')
    .isFloat(),
    check('description','Please enter a description between 7 and 120 characters')
    .isLength({min : 7,max : 120})
]