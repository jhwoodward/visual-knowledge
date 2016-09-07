(function() {

  'use strict';

  angular.module('neograph.map.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, $state, $window, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/map/graph.directive.html',
      scope: {
        data: '=',
        onSelect: '&'
      },
      link: linkFn
    }

    function linkFn(scope, element) {
      var graph = {
        nodes: new vis.DataSet(),
        edges: new vis.DataSet()
      };
      scope.data = {
        nodes: {},
        edges: {}
      };
      var options = graphService.options;
      options.onConnect = onNetworkConnect;
      var graphContainer = element.find('.graphContainer');
      var network = new vis.Network(graphContainer[0], graph, options);
      $timeout(setGraphSize);
      $('.network-manipulationUI.connect').hide();
      scope.hoverNode = undefined;

      // Add event listeners
      scope.$watch('data', onDataChanged);
      scope.$on('$stateChangeSuccess', focusCurrentNode);
      angular.element($window).on('resize', setGraphSize);
      // Fit to screen on resize
      network.on('resize', onNetworkResize);
      graph.nodes.on('*', onNodeDatasetChanged);
      network.on('select', onNetworkSelect);
  //    scope.subscribe('deleted', onGlobalDeleted);
  //    scope.subscribe('focus', onGlobalFocus);
      graphContainer.on('mousemove', onContainerMouseMove);
    
    // Update existing data (not replace)
 //     scope.subscribe('dataUpdate', onGlobalDataUpdate);

      function onNetworkConnect(data, callback) {
        var newEdge = {
          start: scope.data.nodes[data.from],
          type: graphService.defaultEdgeType(
                  scope.data.nodes[data.from].Type,
                  scope.data.nodes[data.to].Type),
          end: scope.data.nodes[data.to],
          properties: { Weight: 3 }
        };
        scope.publish('newEdge', newEdge);
      }

      function getSelectedNodeId() {
        var selectedNodes = network.getSelectedNodes();
        if (selectedNodes.length === 1) {
          return selectedNodes[0];
        }
        return undefined;
      };

      function focusCurrentNode() {
        if ($state.params.node) {
          Object.keys(scope.data.nodes).forEach(function(key) {
            if (scope.data.nodes[key].label === $state.params.node) {
              if (scope.data.nodes[key].id !== getSelectedNodeId()) {
                network.selectNodes([key]);
                network.focusOnNode(key, {
                  scale: 1.5,
                  animation: {
                    duration: 1000,
                    easingFunction: 'easeOutCubic'
                  }
                });
              }
            }
          });
        }
      }

      function setGraphSize() { 
        network.setSize($window.innerWidth + 'px', $window.innerHeight + 'px'); 
      }

      function onNetworkResize() {
        if (getSelectedNodeId()) {
          network.focusOnNode(getSelectedNodeId(), {
            scale: 1,
            animation: {
              duration: 1000,
              easingFunction: 'easeOutCubic'
            }
          });
        } else {
          network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
        }
      }

      function onNodeDatasetChanged() {
        if (graph.nodes.length) {
          $('.network-manipulationUI.connect').css('display', 'inline-block');
        } else {
          $('.network-manipulationUI.connect').hide();
        }
      }

      function onNetworkSelect(params) {
        
        if (params.nodes.length === 1) {
          var node = scope.data.nodes[params.nodes[0]];
          scope.onSelect({node: node});
        } else if (params.edges.length === 1) {
          var id = params.edges[0];
          var startNode = scope.data.nodes[scope.data.edges[id].startNode];
          var endNode = scope.data.nodes[scope.data.edges[id].endNode];
          var edge = {
            id,
            start: { lookup: startNode.label },
            end: { lookup: endNode.label },
            type: scope.data.edges[id].type,
            properties: scope.data.edges[id].properties
          };
          scope.onSelect({edge: edge});
        }
      }

      function onGlobalDeleted(params) {
        if (params.selection.nodes && params.selection.nodes.length) {
          var nodeids = params.selection.nodes.map(n => n.id);
          graph.nodes.remove(nodeids);
        }
        if (params.selection.edges && params.selection.edges.length) {
          var edgeids = params.selection.edges.map(n => n.id);
          graph.edges.remove(edgeids);
        }
      }

      function onGlobalFocus(nodeid) {
        network.focusOnNode(nodeid, {
          scale: 1,
          animation: {
            duration: 1000,
            easingFunction: 'easeOutCubic'
          } });
      }

      function onContainerMouseMove(event) {
        var n = network._getNodeAt({
          x: event.pageX,
          y: event.pageY
        });
        scope.$apply(function() {
          if (n) {
            var dataNode = scope.data.nodes[n.id];
            scope.hoverNode = dataNode;
          //  scope.publish('hover', dataNode);
          } else {
           // scope.publish('hover', undefined);
            scope.hoverNode = undefined;
          }
        });
      }

      function onDataChanged()  {
        console.log('new data');
        graph.nodes.clear();
        graph.edges.clear();
        var gArr = graphService.toGraphData(scope.data);
        graph.nodes.add(gArr.nodes);
        graph.edges.add(gArr.edges);
      }

      function onGlobalDataUpdate(g) {
        if (scope.data) {
          Object.assign(scope.data.edges, g.edges);
          Object.assign(scope.data.nodes, g.nodes);
          var gArr = graphService.toGraphData(g);
          graph.edges.update(gArr.edges);
          graph.nodes.update(gArr.nodes);
        }
      }
    }


  }
  

})();
