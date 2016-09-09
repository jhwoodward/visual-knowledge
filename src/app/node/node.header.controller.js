(function() {
  'use strict';

  angular.module('neograph.node.header.controller', [])
    .controller('NodeHeaderCtrl', controller);

  function controller($scope, $state) {
    var vm = this;
    vm.node = undefined;
    vm.edit = edit;
    vm.new = newNode;
    
    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function newNode() {
      vm.node = node;
      $scope.node = vm.node;
    }

    function edit() {
      $state.go('admin.node.edit', { node: vm.node.label });
    }
  }

})();