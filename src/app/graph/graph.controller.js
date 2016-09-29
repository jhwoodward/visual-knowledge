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
    vm.getGraphNode = getGraphNode;


    activate();

    function activate() {
      $scope.$watch('vm.node', function(node) {
        if (node && node.id && node.id != vm.loadedNode.id) {
          vm.loadedNode = node;
          load(node);
        }
      });

      $scope.$watch('vm.comparison', function(node) {
        if (node && node.id && node.id != vm.loadedComparison.id) {
          vm.loadedComparison = node;
          load(node);
          loadConnections();
        }
      });
        
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
/*
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


                  $timeout(function() {
                    console.log(vm.comparison.lookup,'focus');
                    focus(vm.comparison);
                  // fit(graphAll.nodes);
                    },800);
                });
            });
        }
      }
    }
    */

     function loadConnections() {
      if (vm.node && vm.comparison) {

        if (loadedConnection.indexOf(vm.node.id) === -1 || 
          loadedConnection.indexOf(vm.comparison.id) === -1) {
            neo.shortest(vm.node.lookup, vm.comparison.lookup)
              .then(function(shortest) {
                clearHighlight();
                highlight(graphService.toVisNetworkData(shortest), darkBlue);//#3e82bd
                loadedConnection = [vm.node.id, vm.comparison.id];

                $timeout(function() {
                  focus(vm.comparison);
                  },800);
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

      if (node) {
        var neoNode = node.data || node;
        if (neoNode.isPerson()) {
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

    function getGraphNode(node) {

      var id = node.id || node;

      var search = vm.graph.nodes.get({ 
        filter: function(n) { 
        return parseInt(id) == parseInt(n.id); } 
      });
      if (search.length) return search[0];

      return undefined;
    }

  
    function highlightCurrentNode() {
      var currentNode = getGraphNode(vm.node);
      if (currentNode) {
        highlightNode(currentNode, darkBlue);
        vm.graph.nodes.update(currentNode);
      }
  
    }

    function updateQueryLog(node) {
      var graphNode = getGraphNode(node);
      if (graphNode) {
        graphNode.queries = graphNode.queries || [];
        _.extend(graphNode.queries, node.queries);
        vm.graph.nodes.update(graphNode);
      }
     

    }

    function onInput(graph, parentNode)  {

      console.dir({graph:graph,parentNode:parentNode},'oninput');

      if (!vm.graph.nodes.length) {
        vm.graph.nodes.add(graph.nodes);
        vm.graph.edges.add(graph.edges);

        $timeout(highlightCurrentNode);
        
        updateQueryLog(parentNode);

        return;
      }

    

      new Queue(vm.graph, graph, parentNode).next();

    }

    function Queue(existing, adding, parentNode) {

      this.parentNode = parentNode;
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

        //get edges connected to this node
        var edges = this.newedges.filter(function(e) { 

//really need to be able to make the spring slacker to avoid reshaping the graph too much when new nodes are added that link to existing ones
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

        this.existing.nodes.update(node);
        this.existing.edges.update(edges);

        //subtract any added edges from the newedges array
        this.newedges = this.newedges.filter(function(e) {
          return  edges.indexOf(e) === -1;
        });
        $timeout(this.next.bind(this), 200);
      } else {
        this.finished();
      }
    }

    Queue.prototype.finished = function() {
      // any remaining stray edges - why would they exist?
   //   this.existing.edges.update(this.newedges);
      //update graph node with query details
       updateQueryLog(this.parentNode, this.adding.query);
    }

    function fixNode(node) {

      node.fixed = true;
      vm.graph.nodes.update(node);
      $timeout(function(){
        var n = getGraphNode(node);
        n.fixed = false;
        vm.graph.nodes.update(n);
      }, 2000);

    }

    function getActiveQueryIndex(node) {
      var index  =-1;
      for (var i = 0;i < node.queries.length; i++) {
        var q = node.queries[i];
        if (q.results) {
          if (q.results.remaining.length > 0) {
            index = i;
            break;
          }
        } else {
          index = i;
          break;
        }
      }
      return index;
    }

    function load(node) {

      if (getGraphNode(node)) { 
        node = getGraphNode(node);
        console.log(node);
        node.position = vm.vis.getPositions([node.id])[node.id];
        fixNode(node);

        if (node.queries && node.queries.length) {
        
          var qIndex = getActiveQueryIndex(node);

          if (qIndex === -1) {
            node.color = {
              background: '#ccc',
              hover: '#ccc'
            };
            vm.graph.nodes.update(node);
            return; // all queries used update
          }
           

          var q = node.queries[qIndex];

          if (!q.results) { //active query not yet run
            executeQuery(node, qIndex, 3);
            return;
          } 
          var remaining = q.results.remaining.filter(function(node) {
            return !vm.graph.nodes.get(node.id);
          });
          if (!remaining.length) {
            q.results.remaining = [];
            vm.graph.nodes.update(node);
            return;
          }
       
          var taken = remaining.slice(0,3);
          taken.map(function(n) {
            n.x = node.position.x;
            n.y = node.position.y;
          });
          q.results.remaining = remaining.filter(function(n) { return taken.indexOf(n) === -1; });
          vm.graph.nodes.update(node);
          var graph = {
            nodes: taken,
            edges: q.results.total.edges
          };
          onInput(graph, node);
          return;
          
        }
      } 

      var data = node.data ? node.data : node;
      node.queries = graphService.getQueries(data);
      if (node.queries && node.queries.length) {
        var initialNodeTake = data.hasType('Provenance') ? 50:3;
        executeQuery(node, 0, initialNodeTake);
      }

    }

    function executeQuery(parentNode, index, take) {

      console.log( parentNode.lookup,'executeQuery');
      index = index || 0;

      if (index > parentNode.queries.length -1) {
        return;
      }

      var query = parentNode.queries[index];

      getData(query).then(function(data) {

        var networkData = graphService.toVisNetworkData(data);

     

        var newnodes = networkData.nodes.filter(function(node) {
          return !vm.graph.nodes.get(node.id.toString());
        });

        /*
        CAUSES PARENT NODE TO JUMP FOR SOME UNKNOWN REASON
        if (parentNode.position) {
          console.log(parentNode.position);
          newnodes.map(function(n) {
            n.x = parentNode.position.x;
            n.y = parentNode.position.y;
          });
        }
        */

        var taken = newnodes
          .sort(function() { 
            return 0.5  - Math.random() ;
            })
          .filter(function(n) {
            return n.id != parentNode.id;
          })
          .slice(0, take);

        //ensure parent node is also taken if not already in graph
        taken = taken.concat(newnodes.filter(function(n) {
          return n.id == parentNode.id;
        }));

        var remaining = newnodes.filter(function(n) { 
          return taken.indexOf(n) === -1; 
        });

      //  var takenEdges = networkData.edges.filter(function(edge) {
     //     return taken.filter(function(n) {} ).length;
     //   });

        query.results = { total: networkData, newNodes: newnodes.length, taken: taken, remaining: remaining };

        if (taken.length) {
          
          // create pseudo edges for creation relations
          if (query.name === 'Creation relation') {
            networkData.edges = newnodes
            .filter(function(n){
              return n.id != parentNode.id;
            })
            .map(function(n) {
              var pseudoEdge = { 
                id: parentNode.id + '-' + n.id,
                startNode: parentNode.id.toString(),
                endNode: n.id.toString(),
                type: "CREATION"
              };
              return graphService.graphEdgeFromNeoEdge(pseudoEdge);
            });
          }

          var graph = {
            nodes: taken,
            edges: networkData.edges
          };
          onInput(graph, parentNode);
        } else {

        //  if (query.connectAll) {
        //    connectAll(networkData.nodes);
       //   }

          //record query attempt on node if present in graph
          updateQueryLog(parentNode);

          //try the next query
          executeQuery(parentNode, index + 1, 3);
        }
      });
    }



    function connectAll(data) {
      return neo.getAllRelationships(data.nodes)
        .then(function(allRelationships)  {
          vm.graph.edges.update(allRelationships.edges);
          return data;
        });
    }

    function getData(query) {
      return neo.getGraph(query.q, false, 3)
        .then(function(data) {
          return data;
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
        load(selection.node);
        return;
      } 

      if (selection.edges && selection.edges.length === 1) {

        if (selection.edges[0].from == vm.node.id) {
          stateManager.go.comparison(selection.edges[0].to);
          return;
        }

        if (vm.comparison && selection.edges[0].from == vm.comparison.id) {
          stateManager.go.node(selection.edges[0].to);
          return;
        }

        if (selection.edges[0].to == vm.node.id) {
          stateManager.go.comparison(selection.edges[0].from);
          return;
        }

        if (vm.comparison && selection.edges[0].to == vm.comparison.id) {
          stateManager.go.node(selection.edges[0].from);
          return;
        }

        stateManager.go.compare(selection.edges[0].from, selection.edges[0].to);
      }
      
    

    }

  }
 
})();