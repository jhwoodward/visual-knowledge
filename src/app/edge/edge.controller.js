(function() {

  angular.module('neograph.edge.controller', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .controller('EdgeCtrl', controller)
    .controller('ChildEdgeCtrl', childController);

    function controller ($scope) {
      var vm = this;
      vm.tabs = ['Properties'];
      vm.selectedTab = 'Properties';
      vm.selectTab = function (tab) {
        vm.selectedTab = tab;
      };
    }

    function childController ($scope, $stateParams) {
      var vm = this;
      if ($stateParams.edge) {
        vm.edge = JSON.parse($stateParams.edge);
      }
    }

  })();
