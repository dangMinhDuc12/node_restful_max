const { validationResult } = require('express-validator')
const Post = require('../models/post')

module.exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'Firt Post',
                content: 'This is the first post',
                imageUrl: 'images/ronaldo.jpg',
                creator: {
                    name: 'Duc Dang'
                },
                createdAt: new Date()
            }
        ]
    });
};

module.exports.createPost = async (req, res, next) => {
    const errors = validationResult(req)
    const { title, content } = req.body;
    try {
    if (!errors.isEmpty()) {
       const err = new Error('Data is incorrect');
        err.statusCode = 422;
        err.detail = errors.array()
        throw err;
    }
    const postCreate = new Post({
        title,
        content,
        imageUrl: 'images/ronaldo.jpg',
        creator: {
            name: 'Duc Dang'
        }
    });

        const result = await postCreate.save()
        res.status(201).json({
            message: 'Post created successfully',
            post: result
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};