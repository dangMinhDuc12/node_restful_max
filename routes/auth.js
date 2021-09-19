const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const User = require('../models/user');
const isAuth = require('../middleware/isAuth')


const authController = require('../controllers/auth');

// [POST] /auth/signup
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .custom(async value => {
            const userFind = await User.findOne({ email: value })
            if (userFind) {
                return Promise.reject('E-mail already in use')
            }
        }),
    body('password')
        .trim()
        .isLength({ min: 5 }),
    body('name')
        .trim()
        .notEmpty()
], authController.postSignup);

// [POST] /auth/login
router.post('/login', authController.postLogin);

// [GET] /auth/status
router.get('/status', isAuth, authController.getStatus)

//[PATCH] /auth/status
router.patch('/status', isAuth, [
    body('status').trim().notEmpty()
], authController.updateStatus)



module.exports = router;