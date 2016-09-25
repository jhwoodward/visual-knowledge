(function() {
  'use strict';
    
  angular.module('neograph.graph.controller',['neograph.node.service', 'ui.router'])
    .controller('GraphCtrl', controller);

  function controller($scope, $timeout, neo, neoClient, graphService, stateManager) {

    var vm = this;

    vm.graph = {
      nodes: new vis.DataSet(),
      edges: new vis.DataSet()
    };
    vm.data = {
      nodes: {},
      edges: {}
    };

    vm.onSelect = onSelect;
    vm.node = {};
    vm.comparison = {};
    vm.graphs = [];
    vm.selectedGraph = {};
    vm.selectedNode = undefined;
    vm.selectedEdges = [];
    vm.graphql = graphql;

    activate();

    function activate() {
      $scope.$watch('vm.node', loadNode);
      $scope.$watch('vm.comparison', loadNode);
      $scope.$watch('vm.selectedGraph', onSelectedGraphChanged);
    }

    function loadNode(node) {
      if (node && node.id) {
        loadGraphData(node);
        loadShortestPaths();
      }
    }

    function loadShortestPaths() {
      if (vm.node && vm.comparison) {
        neo.allShortest(vm.node.lookup, vm.comparison.lookup)
          .then(function (data) {
            console.log(data,'all shortest');
            onInput(data);
          });
      }
    }

    function highlightShortest() {
      clearHighlight();
      neo.allShortest(vm.node.lookup, vm.comparison.lookup)
        .then(function(data) {
          highlight(data, '#5696ce');

          neo.shortest(vm.node.lookup, vm.comparison.lookup)
            .then(function(data) {
              highlight(data, '#3e82bd');
            });

        });

    }

    function clearHighlight() {
       var highlightedNodes = vm.graph.nodes.get({filter: function(node) {return node.highlighted;}});
      highlightedNodes.forEach(function(n) {
        _.extend(n,graphService.graphNodeFromNeoNode(n.data));
        vm.graph.nodes.update(n);
      });
      var highlightedEdges = vm.graph.edges.get({filter: function(edge) {return edge.highlighted;}});
      highlightedEdges.forEach(function(edge) {
        edge.color = '#76a1c5';
        edge.highlighted = false;
        vm.graph.edges.update(edge);
      });
    }

    function highlight(data, colour) {

      Object.keys(data.nodes).forEach(function(node) {
        var n = vm.graph.nodes.get(node);
        if (n) {
          if (n.data.isPerson()) {
            n.color = { background:  colour };
          }
          n.fontColor = colour;

          if (parseInt(n.id) === parseInt(vm.node.id) || 
            parseInt(n.id) === parseInt(vm.comparison.id)) {
              n.fontSize = 24;
          }
       
          n.highlighted = true;
          vm.graph.nodes.update(n);
        }
      });

      Object.keys(data.edges).forEach(function(edge) {
        var e = vm.graph.edges.get(edge);
        if (e) {
          e.color = colour;
          e.highlighted = true;
          vm.graph.edges.update(e);
        }
      });


    //  vm.network.selectEdges(Object.keys(data.edges));
    }
    

    function graphql() {

      var query = ` Person (lookup:"${vm.node.lookup}"  ) {
                        type_of {
                          lookup
                        }
                        influences {
                          lookup
                          type_of {
                            lookup
                          }
                            influences {
                              lookup
                              type_of {
                                lookup
                              }
                              influences {
                                lookup
                                type_of {
                                  lookup
                                }
                              }
                            }
                          }
                      }`;

      neo.graphql(query).then(function(data) {
        console.log(data);
      });
    }

    var newnodes = [];
    var newedges = [];

    function onInput(inputData)  {
      console.log(vm.data);

      _.extend(vm.data.nodes, inputData.nodes);
      _.extend(vm.data.edges, inputData.edges);
      var gArr = graphService.toVisNetworkData(vm.data);
      if (vm.graph.nodes && vm.graph.nodes.length) {
        newnodes = gArr.nodes.filter(function(node) {
          return !vm.graph.nodes._getItem(node.id);
        });
        newedges = gArr.edges.filter(function(edge) {
          return !vm.graph.edges._getItem(edge.id);
        });
        addNewNodes();
      } else {
        vm.graph.nodes.add(gArr.nodes);
        vm.graph.edges.add(gArr.edges);
      }
    }

    function addNewNodes() {
      console.log('new nodes');
      if (newnodes.length) {
        var node = newnodes.pop();
        var edges = newedges.filter(function(e) { 
          return e.from === node.id || e.to === node.id;
        });
        newedges = newedges.filter(function(e) {
          return  e.from !== node.id && e.to !== node.id;
        });
        vm.graph.nodes.add(node);
        vm.graph.edges.add(edges);
      } else if (newedges.length) {
          vm.graph.edges.add(newedges);
      }
      if (newnodes.length) {
        $timeout(addNewNodes, 200);
      } else {
        highlightShortest();
      }
    }

 

    function loadGraphData(node) {
      console.log(node,'load graph');

      
      vm.graphs = graphService.getQueries(node);
      console.dir(vm.graphs);
      if (vm.graphs && vm.graphs.length) {
        vm.selectedGraph = vm.graphs[0];
      }
    }


    function onSelectedGraphChanged(graph) {
      if (graph) {
        getData(graph).then(function(newData) {
          if (Object.keys(newData.nodes).length === 0) {
            console.log('no results for ' + graph.q);
            tryNextGraph();
          } else {
            onInput(newData);
          }
        });
      }
    }


    function tryNextGraph() {
      var currentGraphIndex = -1;
      vm.graphs.forEach(function(m, i) {
        if (m === vm.selectedGraph) {
          currentGraphIndex = i;
        }
      });

      if (currentGraphIndex === 0) {
        vm.selectedGraph = vm.graphs[1];
      }
    }

    function connectAll (data) {
      return neo.getAllRelationships(data.nodes)
        .then(function(allRelationships)  {
          Object.assign(vm.data.edges, allRelationships.edges);
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

    function onSelect(selection) {
      vm.selectedEdges = selection.edges;
      if (selection.node) {
        if (vm.comparison && parseInt(selection.node.id) === parseInt(vm.comparison.id)) {
          stateManager.go.node(selection.node);
        } else {
          stateManager.go.comparison(selection.node);
        }
      } 

    }

  }
 
})();