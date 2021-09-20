const { validationResult } = require('express-validator')
const Post = require('../models/post');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const io = require('../socket')


function clearFile(filePath) {
  const p = path.join(path.dirname(require.main.filename), filePath);
  fs.unlink(p, err => {
      if (err) {
          console.log(err);
      }
  });
};


module.exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find({}).estimatedDocumentCount();
        const posts = await Post.find({}).sort({ createdAt: 'desc' }).skip((currentPage - 1) * perPage).limit(perPage).populate('creator');
        res.status(200).json({
            posts,
            totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
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
    if (!req.file) {
        const err = new Error('No image provided');
        err.statusCode = 422;
        throw err;
    }
    const imageUrl =  req.file.path.replace("\\" ,"/");
    const postCreate = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    });

        const result = await postCreate.save();
        const userCreatePost = await User.findById(req.userId);
        userCreatePost.posts.push(postCreate);
        await userCreatePost.save();
        io.getIO().emit('posts', {
            post: {
                ...postCreate._doc,
                creator: {
                    _id: req.userId,
                    name: userCreatePost.name
                }
            },
            action: 'create',
        })
        res.status(201).json({
            message: 'Post created successfully',
            post: result,
            creator: {
                _id: userCreatePost._id,
                name: userCreatePost.name
            }
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

module.exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            const err = new Error('Not found the post');
            err.statusCode = 404;
            throw err;
        }
        res.status(200).json({
            post
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

module.exports.updatePost = async (req, res, next) => {
    const { postId } = req.params;
    const { title, content } = req.body;
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const err = new Error('Data is incorrect');
            err.statusCode = 422;
            err.detail = errors.array()
            throw err;
        }
        let imageUrl = req.body.image;
        if (req.file) {
            imageUrl = req.file.path.replace("\\" ,"/");
        }
        if (!imageUrl) {
            const err = new Error('No Image Provided');
            err.statusCode = 422;
            throw err;
        }
        const postFind = await Post.findById(postId).populate('creator');
        if (!postFind) {
            const err = new Error('No Post Found');
            err.statusCode = 404;
            throw err;
        }
        if (postFind.creator._id.toString() !== req.userId) {
            const err = new Error('Not Authorization');
            err.statusCode = 403;
            throw err;
        }
        if (imageUrl !== postFind.imageUrl) {
            clearFile(postFind.imageUrl);
        }
        postFind.title = title;
        postFind.content = content;
        postFind.imageUrl = imageUrl;
        const result = await postFind.save();
        io.getIO().emit('posts', {
            action: 'update',
            post: result
        })
        res.status(200).json({
           post: result
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

module.exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    try {
        const postFind = await Post.findById(postId);
        if (!postFind) {
            const err = new Error('No Post Found');
            err.statusCode = 404;
            throw err;
        }
        if (postFind.creator.toString() !== req.userId) {
            const err = new Error('Not Authorization');
            err.statusCode = 403;
            throw err;
        }
        clearFile(postFind.imageUrl);
        const result = await Post.findByIdAndDelete(postId);
        const userDeletePost = await User.findById(req.userId);
        //pull method xoa post voi postId nam trong model user, posts phai la subdoc(1 array)
        userDeletePost.posts.pull(postId);
        await userDeletePost.save();
        io.getIO().emit('posts', {
            action: 'delete',
            post: postId
        })
        res.status(200).json({
            post: result
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
