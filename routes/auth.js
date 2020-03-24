const express = require('express');

const authController = require('../controllers/auth');

const validations = require('../controllers/validations/validations');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.get('/reset-password', authController.getResetPassword);

router.get('/set-new-password/:token', authController.getSetNewPassword);

router.post('/reset-password', authController.postResetPassword);

router.post('/set-new-password', authController.postSetNewPassword);

router.post('/login', validations.loginValidations,authController.postLogin);

router.post('/signup', validations.signupValidation,authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;