const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    try {
    if (!authHeader) {
        const err = new Error('Not Authenticated');
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(' ')[1];

        const decodedToken = jwt.verify(token, 'somesupersecret');
        req.userId = decodedToken.userId;
        next();
    } catch(err) {
       if (!err.statusCode) {
           err.statusCode = 500;
           if(err.message === 'jwt malformed') {
               err.statusCode = 401;
           }
       }
        next(err)
    }

}