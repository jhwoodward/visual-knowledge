(function() {
  'use strict';
    
  angular.module('neograph.graph.controller',['neograph.node.service', 'ui.router'])
    .controller('GraphCtrl', controller);

  function controller($scope, $timeout, neo, nodeManager, graphService) {

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
    vm.graphs = [];
    vm.selectedGraph = {};
    vm.selectedNode = undefined;
    vm.selectedEdges = [];
    vm.graphql = graphql;

    activate();

    function activate() {
      $scope.$watch('vm.node', newNode);
      $scope.$watch('vm.selectedGraph', onSelectedGraphChanged);
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

    /*
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

    function onGlobalDataUpdate(g) { 
      _.extend(data.edges, g.edges);
      _.extend(data.nodes, g.nodes);
      var gArr = graphService.toGraphData(g);
      graph.edges.update(gArr.edges);
      graph.nodes.update(gArr.nodes);
    }
*/
    function addNewNodes() {
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
      }
    }

    function newNode(node) {
      console.log(node,'no node loaded');
      if (node && node.id) {
        vm.selectedNode = undefined;
        vm.selectedEdges = [];
        loadGraphData(node);
      }
    }

    function loadGraphData(node) {
      console.log(node,'load graph');
      vm.graphs = graphService.getQueries(node);
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
        if (vm.selectedNode && selection.node.id === vm.selectedNode.id) {
          activateSelected();
          return;
        } else {
          vm.selectedNode = selection.node;
          loadGraphData(vm.selectedNode);
        }
      } else {
        vm.selectedNode = undefined;
      }
      raiseSelectionChanged(selection);
    }

    function raiseSelectionChanged(selection) {
      if (vm.onSelectionChanged) {
        vm.onSelectionChanged(selection);
      }
    }

    function activateSelected() {
      if (vm.onNodeActivated) {
        vm.onNodeActivated({node: vm.selectedNode});
      }
    }

  }
 
})();