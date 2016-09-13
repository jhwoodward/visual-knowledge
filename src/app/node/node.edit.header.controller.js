(function() {
  'use strict';

  angular.module('neograph.node.edit.header.controller', [])
    .controller('NodeEditHeaderCtrl', controller);

  function controller($scope, $state, nodeManager, _) {
    var vm = this;

    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;

    activate();

    function activate() {
      //set node when loaded by parent controller
      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;
      });
    }

    function exit() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function cancel() {
      vm.node.revert();
      exit();
    }

    function save() {
      vm.node.save()
        .then(exit);
    };

    function restore() {
      vm.node.restore(vm.node)
        .then(exit);
    };
  }

})();