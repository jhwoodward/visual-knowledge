angular.module('neograph.graph',['neograph.utils','ui.router'])
    .directive('graph', ['utils','$state', function (utils,$state) {
    return {
        restrict: 'E',
        templateUrl: 'app/graph/graph.html',
        scope: {
            data: '=',
            active: '=',
            network: '='
        },
        link: function ($scope, $element, $attrs) {
            
            var graphWidth= 1300;
            var graphHeight=1300;
            var topBarHeight=150;


            var options = utils.graphOptions;
            options.onConnect= function (data, callback) {

                var newEdge = {
                    start: $scope.data.nodes[data.from],
                    type: utils.defaultEdgeType($scope.data.nodes[data.from].Type, $scope.data.nodes[data.to].Type),
                    end: $scope.data.nodes[data.to],
                    properties: { Weight: 3 }
                }
                $scope.publish("newEdge", newEdge);
            }

            $scope.data = {
                nodes: {},
                edges:{}
            }

            var graph = {
                nodes: new vis.DataSet(),
                edges: new vis.DataSet()
            };

            var network = new vis.Network($element.find('.graphContainer')[0], graph, options);



            //network.on('startStabilization', function () {//should be network.on('NewData')
            //    $window.setTimeout( function () {  network.zoomExtent();},2000);

            //});


            //set size to window size
            $scope.$watch('window', function (w) {
                network.setSize(graphWidth + "px", graphHeight + "px");
            });

            //fit to screen on resize
            network.on('resize', function (params) {
                if (getSelectedNodeId()) {
                    network.focusOnNode(getSelectedNodeId(), { scale: 1, animation: { duration: 1000, easingFunction: 'easeOutCubic' } });
                }
                else {
                    network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });

            graph.nodes.on('*', function (event, properties, senderId) {
                //  console.log('event:', event, 'properties:', properties, 'senderId:', senderId);
                if (graph.nodes.length) {
                    $(".network-manipulationUI.connect").css("display", "inline-block");
                }
                else {
                    $(".network-manipulationUI.connect").hide();
                }

            });

            var suppressSelected = false;

            $scope.subscribe("selected", function (params) {

                if (params.sender != "Graph" &&
                        $scope.active &&
                        params.selection.nodes &&
                        params.selection.nodes.length &&
                        params.selection.nodes[0] != getSelectedNodeId() &&
                        graph.nodes.get(params.selection.nodes[0])
                        ) {
                    suppressSelected = true;

                    var nodeids = params.selection.nodes.map(function (n) { return n.id });
                    network.selectNodes(nodeids);
                    suppressSelected = false;
                }


            });

            // add event listeners
            network.on('select', function (params) {
                if (!suppressSelected) {
                    
                    
                    if (params.nodes.length===1){
                          $state.go('admin.main.node.view',{node:$scope.data.nodes[params.nodes[0]].Label});
                    }
                    else if (params.edges.length===1){
                        
                        var id=params.edges[0];
                        var startNode=$scope.data.nodes[$scope.data.edges[id].startNode];
                        var endNode =$scope.data.nodes[$scope.data.edges[id].endNode];
                        var edge ={
                            id: id,
                            start: {Lookup:startNode.Lookup},
                            end:  {Lookup:endNode.Lookup},
                            type: $scope.data.edges[id].type,
                            properties: $scope.data.edges[id].properties
                        }
                        
                        $state.go('admin.main.edge.view',{edge:JSON.stringify(edge)});
                    }
                    

/*
                    var nodes = [];
                    var edges = [];

                    angular.forEach(params.nodes, function (id) {
                        nodes.push($scope.data.nodes[id]);
                    });


                    angular.forEach(params.edges, function (id) {

                        edges.push({
                            id: id,
                            start: $scope.data.nodes[$scope.data.edges[id].startNode],
                            end: $scope.data.nodes[$scope.data.edges[id].endNode],
                            type: $scope.data.edges[id].type,
                            properties: $scope.data.edges[id].properties
                        });

                    });
                    
                    */

/*
                    var params = { sender: "Graph", selection: { nodes: nodes, edges: edges } };

                    console.log(params);
                    $scope.$apply(function () {
                        $scope.publish("selected", params);
                    })
                    */
                    
                  
                }
            });

            $scope.subscribe("deleted", function (params) {
                console.log(params);
                if (params.selection.nodes && params.selection.nodes.length) {
                    var nodeids = params.selection.nodes.map(function (n) { return n.id });
                    graph.nodes.remove(nodeids);
                }
                if (params.selection.edges && params.selection.edges.length) {
                    var edgeids = params.selection.edges.map(function (n) { return n.id });
                    graph.edges.remove(edgeids);
                }
            });

            $scope.subscribe("focus", function (nodeid) {

                network.focusOnNode(nodeid, { scale: 1, animation: { duration: 1000, easingFunction: 'easeOutCubic' } });

            });




            var getSelectedNodeId = function () {

                var selectedNodes = network.getSelectedNodes();
                if (selectedNodes.length == 1) {
                    return selectedNodes[0];
                }
                else return undefined;

            }

            $(".network-manipulationUI.connect").hide();

            //capture hover node
            $scope.hoverNode = undefined;
            $('.graphContainer').on('mousemove',
                function (event) {
                    var n = network._getNodeAt({ x: event.pageX, y: event.pageY - topBarHeight - 55 });
                    $scope.$apply(function () {
                        if (n) {
                            var dataNode = $scope.data.nodes[n.id];
                            $scope.hoverNode = dataNode;
                            $scope.publish("hover", dataNode);
                        }
                        else {
                            $scope.publish("hover", undefined);
                            $scope.hoverNode = undefined;

                        }
                    });
                });


            //freeze simulation if not active
            $scope.$watch('active',
                function (active) {
                    if (active != undefined) {
                        network.freezeSimulation(!active);
                    }
                });

          


         

           $scope.$watch('data', function () {
                console.log('new change')
                if ($scope.active) {
                    console.log('drawing new graph');
                    graph.nodes.clear();
                    graph.edges.clear();
                    var gArr = utils.toGraphData($scope.data);
                    graph.nodes.add(gArr.nodes);
                    graph.edges.add(gArr.edges);
                }
            })

            //updates existing data (not replace)
            $scope.subscribe("dataUpdate", function (g) {
                console.log('graph: dataUpdate');
                if ($scope.active && $scope.data) {
                    console.log('updating graph');
                    $.extend($scope.data.edges, g.edges);
                    $.extend($scope.data.nodes, g.nodes);
                    var gArr = utils.toGraphData(g);
                    graph.edges.update(gArr.edges);
                    graph.nodes.update(gArr.nodes);
                }

            });

       

        }

    }
}])