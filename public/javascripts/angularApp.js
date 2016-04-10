var app = angular.module('flapperNews',['ui.router']);

app.config(function($stateProvider,$urlRouterProvider){

    $urlRouterProvider.otherwise('home');

    $stateProvider
      .state('home',{
        url:'/home',
        templateUrl:'/home.html',
        resolve: {
          postPromise: function(posteos){
            return posteos.getAll();
          }
        },
        controller:'MainCtrl',
        controllerAs:'Ctrl'
      })
      .state('posts',{
        url:'/posts/{id}',
        templateUrl:'/posts.html',
        controller:'PostsCtrl',
        resolve:{
          posteoResolve:function($stateParams, posteos){
            return posteos.get($stateParams.id);
          }
        },
        controllerAs:'CtrlPosteos'
      })
});

app.controller('MainCtrl',function(posteos){
  this.test = 'Hello world!';
  this.posts = posteos.posts;

  this.addPost = function(){
    if (!this.title | this.title ==='') {return;}
    posteos.create({
      title: this.title,
      link: this.link
    });
    this.title = '';
    this.link = '';
  };

  this.deletePost = function(post) {
    posteos.delete(post);
  }

  this.incrementUpvotes = function(post){
    posteos.upvote(post);
  };

})
.controller('PostsCtrl',function(posteoResolve,posteos,$scope){
  //posteoResolve es el objeto que obtuve en el state en Resolve que lo inyecto en el controlador
  //no sabia que se podia hacer eso

  this.post = posteoResolve;

  this.incrementUpvotes = function(comment){
    posteos.upvoteComment(posteoResolve, comment);
  };

  this.addComment = function(){
    var objPost = this.post;
    //lo de arriba lo invente yo para poder acceder con this.post en el then sin tener que usar el $scope
    if($scope.body === '') { return; }
    posteos.addComment(this.post._id, {
      body: $scope.body,
      author: 'user'
    }).then(function(comment){
      objPost.comments.push(comment.data);
    })
    $scope.body = '';
  };

})

app.factory('posteos',function($http){

  var o = {
    posts:[]
  };

  // asi lo hacen en el tutorial, yo lo hice distino, porque decía que estaba deprecated el success
  // o.getAll = function() {
  //   return $http.get('/posts').success(function(data){
  //     angular.copy(data, o.posts);
  //   });
  // };
  // lo distinto es que el callback es un objeto siendo la prop data, donde estan todos los datos.

  o.getAll = function(){
    return $http.get('/posts')
    .then(function(response){
      angular.copy(response.data, o.posts);
    });
  }

  o.create = function(post) {
    return $http.post('/posts', post).then(function(response){
      o.posts.push(response.data);
    });
  };

  o.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
    .then(function(response){
      post.upvotes += 1;
    });
  };

  o.get = function(id){
    return $http.get('/posts/'+id).then(function(response){
      return response.data;
    });
  };

  // delete single post
  o.delete = function(post) {
    return $http.delete('/posts/' + post._id).success(function(data) {
      console.log('vuelve');
      angular.copy(data, o.posts);
    });
  }

  o.addComment = function(id, comment){
    console.log('llega');
    console.log('id', id);
    console.log('comment',comment);
    return $http.post('/posts/' + id + '/comments', comment);
  };

  o.upvoteComment = function(post, comment) {
    console.log('quiere salir');
    console.log(post._id);
    console.log(comment._id);
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
    .then(function(response){
        console.log('vuelve');
        comment.upvotes += 1
    });
  };

  return o;
});

app.factory('auth',function($http,$window){

  var auth = {};

  return auth;

  auth.saveToken = function (token){
    $window.localStorage['flapper-news-token'] = token;
  };

  auth.getToken = function(){
    return $window.localStorage['flapper-news-token'];
  }

  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function(user){
    return $http.post('/login',user).then(function(response){
      auth.saveToken(response.data.token);
    });
  };

  auth.logOut = function(){
    $window.localStorage.removeItem('flapper-news-token');
  };  

})
