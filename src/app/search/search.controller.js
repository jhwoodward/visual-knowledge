(function() {
  'use strict';
    
  angular.module('neograph.search',['neograph.node.service', 'ui.router'])
    .controller('SearchCtrl', controller);

  function controller($scope, $state, nodeService) {
      var vm = this;
      vm.node = undefined;
      $scope.$watch('vm.node', function (n) {
        if (n && n.label) {
          $state.go('admin.node', { node: n.label });
        }
      });

      vm.newNode = newNode;
      vm.addNodeToGraph = addNodeToGraph;

      function addNodeToGraph(node) {
      
        if (!$scope.views.Graph.data.nodes[node.id]) {
          neo.getRelationships(node.id).then(function (g) {

            var newData = {
              edges: g.edges,
              nodes: {}
            };
            newData.nodes[node.id] = node;

            $scope.publish('dataUpdate', newData);

            if (node.id === $scope.selection.selectedNode.id) {
              $scope.publish('selected', { selection: { nodes: [node.id] } });
              $scope.publish('focus', node.id);
            }

          });
          $scope.activeView = graphView;
        }
      };

      function newNode() {

        var newNode = {
          id: -1,
          labels: [],
          Type: '',
          temp: {
            tabs: ['Properties']
          }
        };

        if (vm.nodeLookupText && (!vm.selection.selectedNode || vm.nodeLookupText != vm.selection.selectedNode.Lookup)) {
          newNode.lookup = vm.nodeLookupText;
        }
        vm.selection.selectedNode = newNode;
        vm.tabs = $scope.selection.selectedNode.temp.tabs;
        vm.selectedTab = 'Properties';
      }
    }
 
})();