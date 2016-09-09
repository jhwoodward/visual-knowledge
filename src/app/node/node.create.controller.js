(function() {
  'use strict';

  angular.module('neograph.node.create.controller', [])
    .controller('NodeCreateCtrl', controller);

  function controller($scope, $state, $stateParams, nodeService, nodeFactory) {
    var vm = this;
    vm.node = nodeFactory.create();
    console.log(vm.node);
    $scope.node = vm.node;
    vm.tabs = ['Properties', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    $scope.$emit('nodeLoaded', vm.node);

  }

})();