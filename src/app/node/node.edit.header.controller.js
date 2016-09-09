(function() {
  'use strict';

  angular.module('neograph.node.edit.header.controller', [])
    .controller('NodeEditHeaderCtrl', controller);

  function controller($scope, $state, nodeService) {
    var vm = this;
    vm.node = undefined;
    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;

    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function cancel() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function save() {
      nodeService.save(vm.node)
        .then(function(saved) {
          $state.go('admin.node', { node: saved.label });
        });
    };

    function restore() {
      nodeService.restore(vm.node)
        .then(function(restored) {
          $state.go('admin.node', { node: restored.label });
      });
    };
  }

})();