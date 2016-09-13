(function() {

  angular.module('neograph.admin.controller', [])
    .controller('AdminCtrl', function($scope, $state, nodeManager) {
      var vm = this;
      vm.panelVisible = true;
      vm.node = undefined;
      vm.editing = false;

      vm.togglePanel = function() {
        vm.panelVisible = !vm.panelVisible;
      }

      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;
      });

      $scope.$on('$stateChangeSuccess', function() {
        vm.editing = $state.current.name === 'admin.node.edit' || 
          $state.current.name === 'admin.createNode';
      });

    });

})();
