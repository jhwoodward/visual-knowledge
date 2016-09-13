(function() {
  'use strict';

  angular.module('neograph.node.controller', [
    'neograph.node.create.controller',
    'neograph.node.header.controller',
    'neograph.node.edit.header.controller',
    'neograph.node.create.header.controller'
    ])
    .controller('NodeCtrl', controller)
    .controller('ChildNodeCtrl', childController);

  function controller($stateParams, nodeManager) {
    var vm = this;
    vm.tabs = ['Properties', 'Image', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';
    nodeManager.setActiveTab(vm.selectedTab);
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
      nodeManager.setActiveTab(tab);
    };

    activate();
    function activate() {
      nodeManager.load($stateParams.node).then(function(node) {
        vm.node = node;
      });
    }
  }

  function childController(nodeManager) {
    var vm = this;
    nodeManager.subscribe('loaded', function(state) {
      vm.node = state.node;
    });
  }

})();