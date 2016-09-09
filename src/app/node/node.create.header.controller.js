(function() {
  'use strict';

  angular.module('neograph.node.create.header.controller', [])
    .controller('NodeCreateHeaderCtrl', controller);

  function controller($scope, $state, nodeService) {
    var vm = this;
    vm.node = $scope.node;
    vm.cancel = cancel;
    vm.save = save;

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