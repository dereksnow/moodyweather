Router.map(function() {
  this.route('home', {path: '/'});
  this.route('wInfo', {
    path: '/wInfo/:zipCode'
  });
  this.route('error404');
});