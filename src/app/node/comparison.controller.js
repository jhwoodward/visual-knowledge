(function() {
  'use strict';

  angular.module('neograph.comparison.controller', [])
    .controller('ComparisonCtrl', controller);

  function controller($scope, $stateParams, $state, nodeManager) {
    var vm = this;
    vm.node = {};

    vm.onTabChanged = onTabChanged;
    vm.onToggleEdit = onToggleEdit;

    activate();
    function activate() {

      nodeManager.compare($stateParams.comparison).then(function(node) {
        vm.node = node;
      });

    }

    function onTabChanged(tab) {
      nodeManager.setComparisonActiveTab(tab);
    }

    function onToggleEdit(editing) {
      vm.editing = editing;
      nodeManager.setComparisonEditing(editing);
    }
  }

})();