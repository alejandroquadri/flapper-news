var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

var auth = jwt({
  secret: "SECRET", // TODO again, this should be stored in an ENV variable and kept off the codebase, same as it is in the User model
  userProperty: "payload"
});

// traer todos los posts
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts){
    if(err){ return next(err); }

    res.json(posts);
  });
});

// crear un post nuevo
router.post('/posts', auth, function(req, res, next) {
  var post = new Post(req.body);
  post.author = req.payload.username;

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

// Delete post
router.delete('/posts/:post', function(req, res) {
	req.post.comments.forEach(function(id) {
		Comment.remove({
			_id: id
		}, function(err) {
			if (err) { return next(err)}
		});
	})
	Post.remove({
		_id: req.params.post
	}, function(err, post) {
		if (err) { return next(err); }

		// get and return all the posts after you delete one
		Post.find(function(err, posts) {
			if (err) { return next(err); }

			res.json(posts);
		});
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
router.put('/posts/:post/upvote', auth, function(req,res,next){
  console.log('antes', req.post);
  req.post.upvote(function(err,post){
    if (err) { return next(err);}
    console.log('dsps', post);
    res.json(post);
  });
});

// postear un comentario
router.post('/posts/:post/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  comment.author = req.payload.username;
  
  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

//aumentar votos de un comentario
router.put('/posts/:post/comments/:comment/upvote', auth, function(req, res, next){
  req.comment.upvote(function(err,comment){
    if (err) {
      return next(err);
    }
    res.json(comment);
  })
})

// registro de usuario nuevo
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;
  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }
    return res.json({token: user.generateJWT()})
  });
});

// login de usuario
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
