(function() {
  'use strict';

  angular.module('neograph.node.create.header.controller', [])
    .controller('NodeCreateHeaderCtrl', controller);

  function controller($scope, $state, nodeService, nodeManager) {
    var vm = this;
    vm.cancel = cancel;
    vm.save = save;

    activate();

    function activate() {
      //set node when loaded by parent controller
      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;
      });
    }

    function cancel() {
      //where to ?
    }

    function save() {
      nodeService.save(vm.node)
        .then(function(saved) {
          $state.go('admin.node', { node: saved.label });
        });
    };

  }

})();