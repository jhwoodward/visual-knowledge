(function() {

  'use strict';

  angular.module('neograph.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, stateManager, $window, $timeout, _) {
   
    var options = {
      configure: { enabled: true },
      interaction: {
        hover: true,
        hoverConnectedEdges:true
      },
      edges: { 
        hoverWidth: function (width) {
          return width + 5;
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false,
          levelSeparation: 10, // make this inversely proportional to number of nodes
          nodeSpacing: 200,
          direction: 'UD', //LR
                  //    layout: "hubsize"
        }
      },
      manipulation: {
        enabled: true,
        initiallyActive: true
      },
      physics: {
            minVelocity:0.2,
            maxVelocity:10,
            barnesHut: {
              damping:0.2
            }
        }
              // stabilize: true,
              // stabilizationIterations: 1000,
              /*
        physics: {
          barnesHut: {
            enabled: true,
            gravitationalvariant: -6000,
            centralGravity: 1,
            springLength: 40,
            springvarant: 0.04,
            damping: 0.09,
            avoidOverlap:0.1
          },
          repulsion: {
            centralGravity: 0.1,
            springLength: 0.5,
            springvarant: 0.05,
            nodeDistance: 100,
            damping: 0.09
          },
          hierarchicalRepulsion: {
            enabled: false,
            centralGravity: 0,
            springLength: 270,
            springvarant: 0.01,
            nodeDistance: 300,
            damping: 0.09
          },
          minVelocity:0.3,
          maxVelocity:10
        },
  */
      }

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/graph/graph.html',
      scope: {
        node: '=',
        comparison: '='
      },
      controller: 'GraphCtrl as vm',
      bindToController: true,
      link: linkFn
    }

    function linkFn(scope, element, attrs, vm) {

      vm.vis = new vis.Network(element[0], vm.graph, options);

      $timeout(setGraphSize);

      angular.element($window).on('resize', setGraphSize);
      vm.vis.on('resize', focus);
      vm.vis.on('select', onSelect);

      function getSelectedNodeId() {
        var selectedNodes = vm.vis.getSelectedNodes();
        if (selectedNodes.length === 1) {
          return selectedNodes[0];
        }
        return undefined;
      };


      function setGraphSize() { 
        vm.vis.setSize($window.innerWidth + 'px', $window.innerHeight + 'px'); 
      }

      function focus() {
        console.log('resize focus');
        vm.focus(vm.comparison || vm.node);
      }

      function onSelect(params) {

        var selection = {};
        if (params.nodes.length === 1) {
          selection.node = vm.graph.nodes.get(params.nodes[0]);
        } 
        if (params.edges.length) {
          selection.edges = [];
          params.edges.forEach(function(id) {
            var edge = vm.graph.edges.get(id);
            console.log(edge);
            var from = vm.graph.nodes.get(edge.from);
            var to = vm.graph.nodes.get(edge.to);
            selection.edges.push({
              id,
              from: from,
              to: to,
              type: edge.type,
              properties: edge.properties
            });
          })
        }
        scope.$apply(function() {
           vm.onSelect(selection);
        });
        vm.vis.unselectAll();
       
      }

      
      
      

 
    }
  }

})();
