(function() {

  'use strict';

  angular.module('neograph.map.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, nodeManager, $window, $timeout) {
   
    var options = {
        edges: { widthSelectionMultiplier: 4 },
        hierarchicalLayout: {
          enabled: false,
          levelSeparation: 10, // make this inversely proportional to number of nodes
          nodeSpacing: 200,
          direction: 'UD', //LR
                  //    layout: "hubsize"
        },
        dataManipulation: {
          enabled: true,
          initiallyVisible: true
        },
              // stabilize: true,
              // stabilizationIterations: 1000,
        physics: {
          barnesHut: {
            enabled: true,
            gravitationalvarant: -6000,
            centralGravity: 1,
            springLength: 20,
            springvarant: 0.04,
            damping: 0.09
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
          }
        },
        onDelete: function(data, callback) {
        }
      }

    return {
      restrict: 'E',
      replace: true,
      template: '<div class="graphContainer"></div>',
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

      var currentNode;

      options.onConnect = onNetworkConnect;
      var network = new vis.Network(element[0], graph, options);
      $timeout(setGraphSize);
      $('.network-manipulationUI.connect').hide();
      scope.hoverNode = undefined;

      // Add event listeners
      scope.$watch('data', onDataChanged);
      nodeManager.subscribe('loaded', function(state) {
        currentNode = state.node;
        focusNode(currentNode);
      });
      angular.element($window).on('resize', setGraphSize);
      // Fit to screen on resize
      network.on('resize', onNetworkResize);
      graph.nodes.on('*', onNodeDatasetChanged);
      network.on('select', onNetworkSelect);
  //    scope.subscribe('deleted', onGlobalDeleted);
  //    scope.subscribe('focus', onGlobalFocus);
      element.on('mousemove', onContainerMouseMove);
    
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

      function focusNode(node) {
        if (node) {
          Object.keys(scope.data.nodes).forEach(function(key) {
            if (scope.data.nodes[key].label === node.label) {
              if (scope.data.nodes[key].id !== getSelectedNodeId()) {

          //      scope.data.nodes[key].fontSize = 100;

                network.selectNodes([key]);
                network.focusOnNode(key, {
                  //scale: 1.5,
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
        var selection = {};
        if (params.nodes.length === 1) {
          selection.node = scope.data.nodes[params.nodes[0]];
        } 
        if (params.edges.length) {
          selection.edges = [];
          params.edges.forEach(function(id) {
            var edge = scope.data.edges[id];
            var startNode = scope.data.nodes[edge.startNode];
            var endNode = scope.data.nodes[edge.endNode];
            selection.edges.push({
              id,
              start: startNode,
              end: endNode,
              type: edge.type,
              properties: edge.properties
            });
          })
        }
        scope.onSelect(selection);

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
        graph.nodes.clear();
        graph.edges.clear();
        var gArr = graphService.toVisNetworkData(scope.data);
        console.log(gArr,'network data');
        graph.nodes.add(gArr.nodes);
        graph.edges.add(gArr.edges);
        console.log(currentNode);
        focusNode(currentNode);
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
