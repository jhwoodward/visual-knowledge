(function() {
  'use strict';
  
  angular.module('neograph.node.routes',[])
    .config(function ($stateProvider) {
        $stateProvider
        .state('explore.createNode', {
          url:'/create',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="true" />',
              controller: 'NodeCreateCtrl as vm'
            }
          }
        })
        .state('explore.node', {
          url:'/:node',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'NodeCtrl as vm'
            }
          }
        })
        .state('explore.compare', {
          url:'/:node/:comparison',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'NodeCtrl as vm'
            },
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'ComparisonCtrl as vm'
            }
          }
        })
        .state('explore.node.compare', {
          url:'/:comparison',
          views: {
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: 'ComparisonCtrl as vm'
            }
          }
        });
    });
})();
