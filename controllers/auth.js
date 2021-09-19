const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.postSignup = async (req, res, next) => {
    const errors = validationResult(req)
    try {
        if (!errors.isEmpty()) {
            const err = new Error('Validation Failed');
            err.statusCode = 422;
            err.detail = errors.array();
            throw err;
        }
        const { email, name, password } = req.body;
        const hashedPw = await bcrypt.hash(password, 12);
        const userCreate = new User({
            email,
            name,
            password: hashedPw
        })
        const result = await userCreate.save();
        res.status(201).json({
            message: 'User created',
            userId: result._id
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }


};

module.exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const userFind = await User.findOne({ email });
        if (!userFind) {
            const err = new Error('Email not found');
            err.statusCode = 401;
            throw err;
        }
        const checkPw = await bcrypt.compare(password, userFind.password);
        if (!checkPw) {
            const err = new Error('Wrong password');
            err.statusCode = 401;
            throw err;
        }
        const token = jwt.sign({
            email: userFind.email,
            userId: userFind._id.toString()
        }, 'somesupersecret', { expiresIn: '1h' })
        res.status(200).json({
            token,
            userId: userFind._id.toString()
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};

module.exports.getStatus = async (req, res, next) => {
    try {
        const userFind = await User.findById(req.userId);
        if (!userFind) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
           message: 'Get status success',
           status: userFind.status
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports.updateStatus = async (req, res, next) => {
    const errors = validationResult(req)
    const { status } = req.body;
    try {
        if (!errors.isEmpty()) {
            const err = new Error('Validation Failed');
            err.statusCode = 422;
            err.detail = errors.array();
            throw err;
        }
        const userFind = await User.findById(req.userId);
        if (!userFind) {
            const err = new Error('User not found');
            err.statusCode = 404;
            throw err;
        }
        userFind.status = status;
        const result = await userFind.save();
        res.status(200).json({
            message: 'Update status success'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};