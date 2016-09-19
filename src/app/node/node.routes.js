(function() {
  'use strict';
  
  angular.module('neograph.node.routes',[])
    .config(function ($stateProvider) {
        $stateProvider
        .state('admin.createNode', {
          url:'/create/node',
          views:{
            'panel@admin': {
              template: '<node node="vm.node" editing="true" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'NodeCreateCtrl as vm'
            }
          }
        })
        .state('admin.node', {
          url:'/node/:node',
          views: {
            'panel@admin': {
              template: '<node node="vm.node" editing="false" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'NodeCtrl as vm'
            }
          }
        })
        .state('admin.node.edit', {
          url:'/edit',
          views:{
            'panel@admin': {
              template: '<node node="vm.node" editing="true"  on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'NodeCtrl as vm'
            }
          }
        });
    });
})();
