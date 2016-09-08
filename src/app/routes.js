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
    })
    .controller('AdminCtrl', function($scope, $state) {
      var vm = this;
      vm.panelVisible = true;
      vm.hasNode = false;
      
      vm.togglePanel = function() {
        vm.panelVisible = !vm.panelVisible;
      }

      $scope.$on('$stateChangeSuccess', setHasNode);

      function setHasNode() {
        console.log($state.params.node);
        vm.hasNode = $state.params.node !== undefined;
      }

    });

})();
