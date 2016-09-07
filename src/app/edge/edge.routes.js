(function() {

  angular.module('neograph.edge.routes', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .config(function ($stateProvider) {
      $stateProvider
      .state('admin.edge', {
        url:'/edge/:edge',
        views: {
          'panel@admin':{
            templateUrl:'app/edge/edge.html',
            controller: 'EdgeCtrl as vm'
          },
          'properties@admin.edge':{
            templateUrl:'app/edge/properties.html',
            controller: 'ChildEdgeCtrl as vm'
          }
        }
      })
      .state('admin.edge.edit', {
          url:'/edit',
          views: {
            'properties@admin.edge':{
              templateUrl:'app/edge/properties.edit.html',
              controller:'EditEdgeCtrl as vm'
            }
          }
        });
    });

})();