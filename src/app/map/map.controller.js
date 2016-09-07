(function() {
  'use strict';
    
  angular.module('neograph.map.controller',['neograph.node.service', 'ui.router'])
    .controller('MapCtrl', controller);

  function controller($scope, $state, neo, nodeService, mapService) {

    console.log('map.controller');
    var vm = this;
    vm.data = [];
    vm.onGraphSelect = onGraphSelect;
    vm.node = {};

    activate();

    function activate() {

      $scope.$on('$stateChangeSuccess', setGraph);

      function setGraph() {
        if (!vm.node || vm.node.label !== $state.params.node) {
          nodeService.get($state.params.node, true)
            .then(function (node) {
              vm.node = node;
              var queries = mapService.getQueries(node);
              if (queries && queries.length) {
                getData(queries[0]).then(function(data) {
                  vm.data = data;
                });
              }
          });
        }
      }
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

    function onGraphSelect(node, edge) {
      if (edge) {
        $state.go('admin.edge', { edge: JSON.stringify(edge) });
      }
      
      if (node) {
        $state.go('admin.node', { node: node.label });
      }
    }

  }
 
})();