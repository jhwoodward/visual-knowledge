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

    vm.onSelect = onSelect;
    vm.loadedNode = {};
    vm.loadedComparison = {};
    vm.graphql = graphql;
    vm.focus = focus;


    activate();

    function activate() {
      $scope.$watch('vm.node', function(node) {
        if (node && node.id && node.id != vm.loadedNode.id) {
          vm.loadedNode = node;
          loadNode(node);
        }
      });

      $scope.$watch('vm.comparison', function(node) {
        if (node && node.id && node.id != vm.loadedComparison.id) {
          vm.loadedComparison = node;
          loadNode(node);
        }
      });
        
    }

    function loadNode(node) {
      $timeout(function() {
        console.log(node.lookup,'load')
        loadGraphData(node);
        loadConnections();
      })
  
    }


    function focus(node) {
      if (node) {
        vm.vis.focus(node.id, {
          //scale: 1.5,
          animation: {
            duration: 2000,
            easingFunction: 'easeInOutCubic'
          }
        });
      }
    }

    var darkBlue = '#1a5d98';

    var loadedConnection=[];

    function loadConnections() {
      if (vm.node && vm.comparison) {

        if (loadedConnection.indexOf(vm.node.id) === -1 || 
          loadedConnection.indexOf(vm.comparison.id) === -1) {

          neo.allShortest(vm.node.lookup, vm.comparison.lookup)
            .then(function(all) {
          
              neo.shortest(vm.node.lookup, vm.comparison.lookup)
                .then(function(shortest) {
                  clearHighlight();
                  var graphAll = graphService.toVisNetworkData(all);
                  highlight(graphAll, '#3373ab');//#5696ce
                  highlight(graphService.toVisNetworkData(shortest), darkBlue);//#3e82bd


                  loadedConnection = [vm.node.id, vm.comparison.id];


                  $timeout(function(){
                    focus(vm.comparison);
                  // fit(graphAll.nodes);
                    },800);
                });
            });
        }
      }
    }

    function fit(nodes) {
      vm.vis.fit({
        nodes: nodes.map(function(n){return n.id;}),
        //optionally supply array of node ids
        animation: {
              duration: 2000, easingFunction: 'easeInOutCubic'
        }
      
      });
    }

    function clearHighlight() {
      var highlightedNodes = vm.graph.nodes.get({filter: function(node) {return node.highlighted;}});
      highlightedNodes.forEach(function(node) {
        node.highlighted = false;
        _.extend(node,graphService.graphNodeFromNeoNode(node.data));
        vm.graph.nodes.update(node);
      });
      var highlightedEdges = vm.graph.edges.get({filter: function(edge) {return edge.highlighted;}});
      highlightedEdges.forEach(function(edge) {
        edge.highlighted = false;
        _.extend(edge, graphService.graphEdgeFromNeoEdge(edge.data));
        vm.graph.edges.update(edge);
      });
    }

    function highlight(data, colour) {

      data.nodes.forEach(function(node) {
        highlightNode(node, colour);
        vm.graph.nodes.update(node);
      });

      data.edges.forEach(function(edge) {
        edge.color = colour;
        edge.highlighted = true;
        vm.graph.edges.update(edge);
      });

    }

    function highlightNode(node, colour) {
      if (node.data.isPerson()) {
        node.color = { background:  colour };
      }
      if (!node.largeText) {
        node.font.color = colour;
      } else {
        node.font.color = '#5696ce';
      }
    
      if (parseInt(node.id) === parseInt(vm.node.id) || 
        parseInt(node.id) === parseInt(vm.comparison.id)) {
          node.font.size = 24;
      }
      node.highlighted = true;
      return node;
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

 
  

    function onInput(graph)  {

      if (!vm.graph.nodes.length) {
        vm.graph.nodes.add(graph.nodes);
        vm.graph.edges.add(graph.edges);

        var currentNode = vm.graph.nodes.get({ 
          filter: function(node) { 
          return parseInt(vm.node.id) == parseInt(node.id); } 
        })[0];
        highlightNode(currentNode, darkBlue);
        vm.graph.nodes.update(currentNode);

        return;
      }

      new Queue(vm.graph, graph).next();

    }

    function Queue(existing, adding) {
      this.adding = adding;
      this.existing = existing;
      this.newnodes = adding.nodes.filter(function(node) {
        return !existing.nodes.get(node.id);
      });
      this.newedges = adding.edges.filter(function(edge) {
        return !existing.edges.get(edge.id);
      });
    }
    Queue.prototype.next = function() {
      if (this.newnodes.length) {
        var node = this.newnodes.pop();
        var edges = this.newedges.filter(function(e) { 

//really need to be able to make the spring slacker to avoid reshaping the graph to much when new nodes are added that link to existing ones
/*
          if (vm.graph.nodes.get(e.from) || vm.graph.nodes.get(e.to) ) {
            console.log('setting length');
            e.length = 3;
          } else {
            e.length  =1;
          }
*/
          return e.from === node.id || e.to === node.id;
        });

        if (this.adding.sourceType === 'node') {
          node.source = this.adding.source.id;
          var pos = vm.vis.getPositions([node.source]);
          if (pos && pos[node.source]) {
            node.x = pos[node.source].x;
            node.y = pos[node.source].y;
          }
        }

       

        this.existing.nodes.update(node);
        this.existing.edges.update(edges);
        this.newedges = this.newedges.filter(function(e) {
          return  e.from !== node.id && e.to !== node.id;
        });
        $timeout(this.next.bind(this),200);
      } else {
        this.existing.edges.update(this.newedges);
      }
    }


    function loadGraphData(node) {
      var queries = graphService.getQueries(node);
      if (queries && queries.length) {
        executeQuery(node, queries, 0);
      }
    }

    function executeQuery(node, queries, index) {

      if (index > queries.length -1) {
        return;
      }

      var query = queries[index];

      getData(query).then(function(data) {

        var networkData = graphService.toVisNetworkData(data);

        var newnodes = networkData.nodes.filter(function(node) {
          return !vm.graph.nodes.get(node.id.toString());
        });

        if (newnodes.length) {
          

          if (query.name === 'Creation relation') {
            networkData.edges = networkData.nodes.map(function(n) {
              var pseudoEdge = { 
                id: node.id + '-' + n.id,
                startNode: node.id.toString(),
                endNode: n.id.toString(),
                type: "CREATION"
              };
              return graphService.graphEdgeFromNeoEdge(pseudoEdge);
            });
          }

          var graph = {
            sourceType: 'node',
            source: graphService.graphNodeFromNeoNode(node),
            nodes: networkData.nodes,
            edges: networkData.edges
          };
          onInput(graph);
        } else {
          executeQuery(node, queries, index + 1);
        }
      });
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
      return neo.getGraph(query.q, false, 3)
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
        } else if (parseInt(selection.node.id) !== parseInt(vm.node.id)){
          stateManager.go.comparison(selection.node);
        }
      } else {
        if (selection.edges && selection.edges.length === 1) {
          stateManager.go.compare(selection.edges[0].from, selection.edges[0].to);
        }
      }
    

    }

  }
 
})();