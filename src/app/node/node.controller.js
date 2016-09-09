(function() {
  'use strict';

  angular.module('neograph.node.controller', [
    'neograph.node.header.controller',
    'neograph.node.edit.header.controller'
    ])
    .controller('NodeCtrl', controller)
    .controller('ChildNodeCtrl', childController);

  function controller($scope, $state, $stateParams, nodeService) {
    var vm = this;
    vm.node = undefined;
    vm.tabs = ['Properties', 'Relationships'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    activate();
    function activate() {
      nodeService.get($stateParams.node, true).then(function (node) {
        //set node property on scope - propagates to child controllers
        vm.node = node;
        $scope.node = vm.node;
        $scope.$emit('nodeLoaded', vm.node);
      });
    }
  }

  function childController($scope, $stateParams, nodeService) {
    var vm = this;
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });
  }

})();