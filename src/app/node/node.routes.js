angular.module('neograph.node')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.node', {
        url:'/node/:node',
        views: {
          'panel@admin': {
            controller:'NodeCtrl as vm',
            templateUrl:'app/node/node.html'
          },
          'properties@admin.node': {
            templateUrl:'app/node/properties/node.properties.html',
            controller:function ($scope, $stateParams, nodeService) {
              if ($stateParams.node) {
                nodeService.get($stateParams.node, true).then(function (node) {
                  $scope.node = node;
                });
              }
            } 
          },
          'relationships@admin.node':{
            templateUrl:'app/node/relationships/node.relationships.html',
            controller:function ($scope, $stateParams, nodeService) {
              if ($stateParams.node) {
                nodeService.get($stateParams.node, true).then(function (node) {
                  $scope.node = node;
                  console.log(node);
                });
              }
            }
          },
          'images@admin.node': {
            controller:'NodeImagesCtrl',
            templateUrl:'app/node/images/node.images.html'
          }
        }
      })
      .state('admin.node.edit', {
        url:'/edit',
        views:{
          'properties@admin.node':{
            templateUrl:'app/node/properties/node.properties.edit.html',
            controller:'EditPropertiesCtrl'
          },
          'relationships@admin.node':{
            templateUrl:'app/node/relationships/node.relationships.edit.html',
            controller:'EditRelationshipsCtrl'
          }
        }
      });
  });
