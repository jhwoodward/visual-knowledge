(function() {
  'use strict';

  angular.module('neograph.node.controller', [])
    .controller('NodeCtrl', controller);

  function controller($scope, $stateParams, $state, nodeManager) {
    var vm = this;
    vm.node = {};
    vm.onToggleEdit = onToggleEdit;

    activate();
    function activate() {
      nodeManager.load($stateParams.node).then(function(node) {
        vm.node = node;
      });

      $scope.$on('$stateChangeSuccess', function() {
        vm.editing = $state.current.name === 'admin.node.edit' || 
          $state.current.name === 'admin.createNode';
      });

    }

    function onToggleEdit(editing) {
      if (!editing) {
        $state.go('admin.node', { node: vm.node.label });
      } else {
        $state.go('admin.node.edit');
      }
    }

    function onTabChanged(tab) {
      nodeManager.setActiveTab(tab);
    }

  }

})();