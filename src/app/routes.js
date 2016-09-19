(function() {

  angular.module('neograph.routes', [])
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('admin', { 
            url:'/admin',
            views: {
              '@': {
                templateUrl:'app/partials/admin.html',
                controller: 'AdminCtrl as vm'
              }, 
              'search@admin':{
                templateUrl:'app/search/search.html',
                controller:'SearchCtrl as vm'
              }, 
              'map@admin':{
                templateUrl:'app/map/map.html',
                controller:'MapCtrl as vm'
              }
            }
          });

      $urlRouterProvider.otherwise('/admin');
    });

})();
