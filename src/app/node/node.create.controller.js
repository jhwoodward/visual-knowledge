(function() {
  'use strict';

  angular.module('neograph.node.create.controller', [])
    .controller('NodeCreateCtrl', controller);

  function controller($scope, $state, $stateParams, nodeManager) {
    var vm = this;

    vm.node = nodeManager.new();
    vm.onToggleEdit = onToggleEdit;

    function onToggleEdit(editing) {
      if (!editing) {
        $state.go('admin.node', { node: node.label });
      }
    }


  }

})();