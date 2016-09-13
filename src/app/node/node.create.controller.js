(function() {
  'use strict';

  angular.module('neograph.node.create.controller', [])
    .controller('NodeCreateCtrl', controller);

  function controller($scope, $state, $stateParams, nodeManager) {
    var vm = this;
   
    vm.tabs = ['Properties', 'Image', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    vm.node = nodeManager.new();

  }

})();