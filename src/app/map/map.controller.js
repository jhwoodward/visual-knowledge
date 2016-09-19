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
    vm.graphql = graphql;

    activate();

    function activate() {
      nodeManager.subscribe('loaded', onNodeLoaded);
      $scope.$watch('vm.selectedMap', onSelectedMapChanged);
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
        /*{
  "Person": [
    {
      "lookup": "Poussin",
      "type_of": [
        {
          "lookup": "Painter"
        }
      ],
      "influences": [
        {
          "lookup": "Cezanne",
          "type_of": [
            {
              "lookup": "Painter"
            }
          ],
          "influences": [
            {
              "lookup": "Gorky",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "AliceMason",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "DeKooning",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                }
              ]
            },
            {
              "lookup": "Uglow",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "RobertDukes",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                }
              ]
            },
            {
              "lookup": "Picasso",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "Dali",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "Hockney",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "Basquiat",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "DeKooning",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "DeStael",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "Matisse",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "JeanHugo",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    },
                    {
                      "lookup": "Illustrator"
                    }
                  ]
                }
              ]
            },
            {
              "lookup": "Braque",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "DeStael",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                }
              ]
            },
            {
              "lookup": "DeStael",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "JeanLucGoddard",
                  "type_of": [
                    {
                      "lookup": "FilmMaker"
                    }
                  ]
                }
              ]
            },
            {
              "lookup": "Matisse",
              "type_of": [
                {
                  "lookup": "Painter"
                }
              ],
              "influences": [
                {
                  "lookup": "Uglow",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "Braque",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "DeStael",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    }
                  ]
                },
                {
                  "lookup": "JeanHugo",
                  "type_of": [
                    {
                      "lookup": "Painter"
                    },
                    {
                      "lookup": "Illustrator"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
*/
        console.log(data);
      });
    }

    function onNodeLoaded(state) {
      if (vm.node && vm.node.lookup != state.node.lookup) {
        vm.selectedNode = undefined;
        vm.selectedEdges = [];
        vm.node = state.node;
        vm.maps = mapService.getQueries(vm.node);
        if (vm.maps && vm.maps.length) {
          vm.selectedMap = vm.maps[0];
        }
      }
   
    }

    function onSelectedMapChanged(map) {
      if (map) {
        getData(map).then(function(data) {
          if (Object.keys(data.nodes).length === 0) {
       
            console.log('no results for ' + map.q);
            tryNextMap();
          } else {
                 console.log(data,'from neo');
            vm.data = data;
          }
        });
      }
    }

    function tryNextMap() {
      var currentMapIndex = -1;
      vm.maps.forEach(function(m, i) {
        if (m === vm.selectedMap) {
          currentMapIndex = i;
        }
      });

      if (currentMapIndex === 0) {
        vm.selectedMap = vm.maps[1];
      }


    }

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
        if (vm.selectedNode && node.lookup === vm.selectedNode.lookup) {
           $state.go('admin.node', { node: node.label });
        } else {
          nodeManager.compare(node.lookup).then(function(node) {
            vm.selectedNode = node;
          });

        }
      } else {
        vm.selectedNode = undefined;
      }
    }
  }
 
})();