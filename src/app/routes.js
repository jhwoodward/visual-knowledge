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
        })
        .state('explore.create', {
          url:'/create',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="true" />',
              controller: createCtrl,
              controllerAs: 'vm'
            }
          }
        })
        .state('explore.node', {
          url:'/:node',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: nodeCtrl,
              controllerAs: 'vm'
            }
          }
        })
        .state('explore.node.comparison', {
          url:'/:comparison',
          views: {
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: comparisonCtrl,
              controllerAs: 'vm'
            }
          }
        })    
        .state('explore.compare', {
          url:'/:node/:comparison',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: nodeCtrl,
              controllerAs: 'vm'
            },
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: comparisonCtrl,
              controllerAs: 'vm'
            }
          }
        });


        function nodeCtrl($stateParams, stateManager) {
          var vm = this;
          vm.node = {};
          vm.onTabChanged = onTabChanged;
          vm.onToggleEdit = onToggleEdit;

          stateManager.load($stateParams.node).then(function(node) {
            console.log(node);
            vm.node = node;
          });

          function onTabChanged(tab) {
            stateManager.setNodeActiveTab(tab);
          }
          function onToggleEdit(editing) {
            vm.editing = editing;
            stateManager.setNodeEditing(editing);
          }
        }

        function comparisonCtrl($stateParams, stateManager) {
          var vm = this;
          vm.node = {};
          vm.onTabChanged = onTabChanged;
          vm.onToggleEdit = onToggleEdit;

          stateManager.compare($stateParams.comparison).then(function(node) {
            vm.node = node;
          });

          function onTabChanged(tab) {
            stateManager.setComparisonActiveTab(tab);
          }
          function onToggleEdit(editing) {
            vm.editing = editing;
            stateManager.setComparisonEditing(editing);
          }
        }

        function createCtrl(stateManager) {
          var vm = this;
          vm.node = stateManager.new();
          stateManager.setNodeEditing(true);
        }

      $urlRouterProvider.otherwise('/explore');
    });

})();
