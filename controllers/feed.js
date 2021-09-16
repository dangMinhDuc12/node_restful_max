module.exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [
            {
                title: 'Firt Post',
                content: 'This is the first post'
            }
        ]
    });
};

module.exports.createPost = (req, res, next) => {
    const { title, content } = req.body;
    res.status(201).json({
        message: 'Post created successfully',
        post: {
            id: new Date().toISOString(),
            title,
            content
        }
    });
};