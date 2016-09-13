(function() {
  'use strict';
    
  angular.module('neograph.map.controller',['neograph.node.service', 'ui.router'])
    .controller('MapCtrl', controller);

  function controller($scope, $state, neo, nodeManager, mapService) {

    var vm = this;
    vm.data = [];
    vm.onGraphSelect = onGraphSelect;
    vm.node = {};
    vm.maps = [];
    vm.selectedMap = {};
    vm.selectedNode = undefined;
    vm.selectedEdges = [];
    vm.goToSelected = goToSelected;

    activate();

    function activate() {
      console.log('map controller activate');
      nodeManager.subscribe('loaded', onNodeLoaded);

      function onNodeLoaded(state) {
        vm.selectedNode = undefined;
        vm.selectedEdges = [];
        vm.node = state.node;
        vm.maps = mapService.getQueries(vm.node);
        if (vm.maps && vm.maps.length) {
          vm.selectedMap = vm.maps[0];
        }
      }
    }

    $scope.$watch('vm.selectedMap', function(map) {
      if (map) {
        getData(map).then(function(data) {
          vm.data = data;
        });
      }
    });

    function goToSelected() {
      $state.go('admin.node', {node: vm.selectedNode.label || vm.selectedNode.id });
    }

    function connectAll (data) {
      return neo.getAllRelationships(data.nodes)
        .then(function(allRelationships)  {
          Object.assign(data.edges, allRelationships.edges);
          return data;
        });
    }

    function getData(query) {
      return neo.getGraph(query.q, false)
        .then(function(data) {
          if (query.connectAll) {
            return connectAll(data);
          } else {
            return data;
          }
        });
    }

    function onGraphSelect(node, edges) {
 
      vm.selectedEdges = edges;
      if (node) {
        if (node === vm.selectedNode) {
           $state.go('admin.node', { node: node.label });
        } else {
           vm.selectedNode = node;
        }
      } else {
        vm.selectedNode = undefined;
      }
    }
  }
 
})();