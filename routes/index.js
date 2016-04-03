var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// traer todos los posts
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// crear un post nuevo
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post){
    if(err){ return next(err); }

    res.json(post);
  });
});

// logica para traer un post con id
router.param('post',function(req,res,next,id){
  var query = Post.findById(id);

  query.exec(function (err, post){
    if (err) {return next(err);}
    if (!post) { return next(new Error('no hay post'));}

    req.post = post;
    return next();

  });
});

// logica para traer un comentario con id
router.param('comment', function(req, res, next, id){
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) {return next(err);}
    if(!comment) { return next(new Error ('no hay comentario'));}

    req.comment = comment;
    return next();
  })
})

// traer un post segun id
router.get('/posts/:post', function(req, res, next) {
  req.post.populate('comments', function(err, post) {
    if (err) { return next(err); }

    res.json(post);
  });
});


// aumentar votos de un post
router.put('posts/:post/upvote',function(req,res,next){
  req.post.upvote(function(err,post){
    if (err) { return next(err);}
    res.json(post);
  });
});

// postear un comentario
router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});



// aumentar votos de un comentario
router.put('posts/:post/comments/:comment/upvote', function(req, res, next){
  req.comment.upvote(function(err,post){
    if (err) { return next(err);}
    res.json(comment);
  })
})




module.exports = router;
