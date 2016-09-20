(function() {

  angular.module('neograph.routes', [])
    .config(function($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('explore', { 
            url:'/explore',
            views: {
              '@': {
                templateUrl:'app/explore.html',
                controller: 'ExploreCtrl as vm'
              }
            }
          });

      $urlRouterProvider.otherwise('/explore');
    });

})();
