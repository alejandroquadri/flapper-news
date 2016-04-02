var app = angular.module('flapperNews',['ui.router']);

app.config(function($stateProvider,$urlRouterProvider){

    $urlRouterProvider.otherwise('home');

    $stateProvider
      .state('home',{
        url:'/home',
        templateUrl:'/home.html',
        controller:'MainCtrl',
        controllerAs:'Ctrl'
      })
      .state('posts',{
        url:'/posts/{id}',
        templateUrl:'/posts.html',
        controller:'PostsCtrl',
        controllerAs:'CtrlPosteos'
      })
});

app.controller('MainCtrl',function(posteos){
  this.test = 'Hello world!';
  this.posts = posteos.posts;

  this.addPost = function(){
    if (!this.title | this.title ==='') {return;}
    this.posts.push({
      title: this.title,
      link: this.link,
      upvotes: 0,
      comments: [
        {author: 'Joe', body: 'Cool post!', upvotes: 0},
        {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
      ]
    });
    this.title = '';
    this.link = '';
  };

  this.incrementUpvotes = function(post){
    post.upvotes += 1;
  };
})
.controller('PostsCtrl',function($stateParams,posteos,$scope){

  this.post = posteos.posts[$stateParams.id];
  console.log($stateParams.id);
  console.log(this.post);

  this.incrementUpvotes = function(post){
    post.upvotes += 1;
  };

  this.addComment = function(){
    console.log(this.post);
    if($scope.body === '') { return; }
    this.post.comments.push({
      body: $scope.body,
      author: 'user',
      upvotes: 0
    });
    $scope.body = '';
    console.log(this.post);
  };

})

// app.controller('MainCtrl', [
// '$scope',
// function($scope){
//   $scope.test = 'Hello world!';
// }]);

app.factory('posteos',function(){
  var o = {
    posts:[
      {title: 'post 1', upvotes: 5},
      {title: 'post 2', upvotes: 2},
      {title: 'post 3', upvotes: 15},
      {title: 'post 4', upvotes: 9},
      {title: 'post 5', upvotes: 4, comments:[]}
    ]
  };
  return o;
})
