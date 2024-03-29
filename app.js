const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blogDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Create a schema
const postSchema = {
    title: String,
    content: String
};

const Post = mongoose.model('Post', postSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.render('index', { posts: posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/posts/:postId', async (req, res) => {
    try {
        const requestedPostId = req.params.postId;
        const post = await Post.findOne({ _id: requestedPostId });
        
        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('post', {
            title: post.title,
            content: post.content
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/compose', (req, res) => {
    res.render('newpost');
});

app.post('/compose', async (req, res) => {
    const post = new Post({
        title: req.body.postTitle,
        content: req.body.postContent
    });

    try {
        await post.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
