(function() {
  'use strict';
  
  angular.module('neograph.node.routes',[])
    .config(function ($stateProvider) {
      $stateProvider
        .state('admin.node', {
          url:'/node/:node',
          views: {
            'panel@admin': {
              templateUrl: 'app/node/node.html',
              controller: 'NodeCtrl as vm'
            },
            'header@admin.node': {
              templateUrl: 'app/node/node.header.html',
              controller: 'NodeCtrl as vm'
            },
            'properties@admin.node': {
              templateUrl: 'app/node/properties/node.properties.html',
              controller: 'ChildNodeCtrl as vm'
            },
            'relationships@admin.node':{
              templateUrl:'app/node/relationships/node.relationships.html',
              controller: 'ChildNodeCtrl as vm'
            },
            'images@admin.node': {
              templateUrl:'app/node/images/node.images.html',
              controller:'NodeImagesCtrl as vm'
            }
          }
        })
        .state('admin.node.edit', {
          url:'/edit',
          views:{
            'header@admin.node': {
              templateUrl: 'app/node/node.edit.header.html',
              controller:'NodeCtrl as vm'
            },
            'properties@admin.node':{
              templateUrl:'app/node/properties/node.edit.properties.html',
              controller:'EditPropertiesCtrl as vm'
            },
            'relationships@admin.node':{
              templateUrl:'app/node/relationships/node.edit.relationships.html',
              controller:'EditRelationshipsCtrl as vm'
            }
          }
        });
    });
})();
