angular.module('neograph.node')
  .controller('NodeCtrl', function ($scope, $stateParams, nodeService) {
    var vm = this;
    vm.selection = {
      selectedNode: null,
      selectedEdge: null,
      hoverNode: null
    };
    vm.tabs = ['Properties', 'Relationships', 'Images'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };
    activate();
    function activate() {
      if ($stateParams.node) {
        nodeService.get($stateParams.node, true).then(function (node) {
          vm.selection.selectedNode = node;
        });
      }
    }
  });
