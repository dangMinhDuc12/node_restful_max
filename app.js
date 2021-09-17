const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static(path.join(__dirname, 'images')));

//Config Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

//Routes
const feedRoutes = require('./routes/feed');

app.use('/feed', feedRoutes);

//Handle Error
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const detail = err.detail || 'Server Error';
    res.status(status).json({
       message,
       detail
    });
});

//Start server
(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('connected to DB')
        app.listen(8080);
    } catch (e) {
        console.log(e)
    }

})();
