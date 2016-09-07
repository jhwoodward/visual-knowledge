(function() {

  angular.module('neograph.edge.properties.edit.controller', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .controller('EditEdgeCtrl', editController);

    function editController(neo, utils, $stateParams, $scope) {
      var vm = this;
      vm.edge = {};
      vm.del = del;

      if ($stateParams.edge) {
        vm.edge = JSON.parse($stateParams.edge);
        vm.predicateType = utils.predicates[vm.edge.type];
      }

      $scope.$watch('predicateType', function (predicateType) {
        if (predicateType) {
          vm.edge.type = predicateType.lookup;
        }
      });

      function del() {
        neo.deleteEdge(vm.edge)
          .then(function () {
            vm.edge = {};
        //    $scope.publish('deleted', { selection: { edges: [e] } });
          });
      };

      function save() {
        neo.saveEdge(e)
          .then(function (saved) {
            /*
            $scope.publish('dataUpdate', saved);
            // update cache
            for (key in g.nodes) {
              $scope.activeView.data.nodes[key] = g.nodes[key];
            }
            for (key in g.edges) {
              $scope.activeView.data.edges[key] = g.edges[key];
              if ($scope.selection.selectedEdge && (key === $scope.selection.selectedEdge.id || !$scope.selection.selectedEdge.id)) {
                $scope.selection.selectedEdge = g.edges[key];
              }
            }
            */
          });
        }
    }

})();


