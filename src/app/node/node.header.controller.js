(function() {
  'use strict';

  angular.module('neograph.node.header.controller', [])
    .controller('NodeHeaderCtrl', controller);

  function controller($scope, $state) {
    var vm = this;
    vm.node = undefined;
    vm.edit = edit;
    vm.del = del;
    vm.destroy = destroy;
    
    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function reload() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function edit() {
      $state.go('admin.node.edit');
    }

    function del() {
      nodeService.delete(vm.node)
        .then(function(deleted) {
          vm.node = deleted;
          $scope.node = vm.node;
          //$scope.publish('deleted', { selection: { nodes: [n] } });
        });
    };

    function destroy() {
      nodeService.destroy(vm.node)
        .then(function() {
          vm.node = undefined;
          //where to now ???
        });
    };


  }

})();