angular.module('neograph.query.graph',['ui.router','neograph.models.node'])
 .factory('graphService',function(nodeFactory){
        
        var graphNodeFromNeoNode = function (neoNode) {

        neoNode = nodeFactory.create(neoNode);
        
        var type = neoNode.class;
        var yf = parseInt(neoNode.yearFrom);
        var yt = parseInt(neoNode.yearTo);

        var y = yt;

        if (yf && yt) {
            y = yt - ((yt - yf) / 2);
        }

        var level = 0;

        var startYear = 1400;
        var endYear = 2000;
        var step = 5;
        var cnt = 1;
        for (var i = startYear; i < endYear; i += step) {
            if (y >= i && y < i + step) {
                level = cnt;
            }

            cnt += 1;
        }

        if (y > endYear) {
            level = cnt;
        }


        var node = {
            id: neoNode.id,
            label: neoNode.label || neoNode.lookup,
            size: neoNode.status / 10,
            group: neoNode.class,
            // color: ==='Group' ? 'orange': 'pink',
            mass: type == 'Group' ? 0.5 : 1,
            radius: neoNode.isPerson() ? neoNode.status : 1,
            //    title: neoNode.FB_blurb,//neoNode.Lookup + " - " + type + " - " + neoNode.Status,
            level: level //for hiearchichal layout,
            ,borderWidth:0
        }

        var image = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

        if (image) {
            node.image = image;
            node.shape = 'image';
        }
        else if (type == "Provenance") {
            node.fontSize = 50;
            node.fontColor = 'lightgray';
            node.color = 'transparent';
        }
        else if (type == "Iconography" || type == "Place") {
            node.shape = 'ellipse';
        }
        else if (type == "Quotation") {

            node.shape = 'box';
            node.color = 'transparent';
            node.label = neoNode.text;
        }
        else if (type == "User") {
            node.shape = 'star';
            node.size = 20;
        }
        else if (type == "Link") {
            node.label = neoNode.name;
            node.shape = 'box';
            node.color = 'transparent';
        }
        else {
            node.shape =  neoNode.isPerson() ? 'dot' : neoNode.isProperty() ? 'circle' : 'box';
        }

        node.color= {background:node.color || "#97C2FC",border: "transparent"};
        if (neoNode.isProperty()){
            node.color.background = "lightgreen";
        }
        return node;

    };

    var graphEdgeFromNeoEdge = function (neoEdge) {
        //id, from, to, type, properties

        var type = neoEdge.type;

        var symmetrical = type === "ASSOCIATED_WITH";
                

        var hideEdgeLabel =
            type == "BY" || "INFLUENCES" ||
              type == "INSPIRES" ||
              type == "DEALS_WITH" ||
            type == "PART_OF" ||
            type == "MEMBER_OF" ||
            type == "ASSOCIATED_WITH" ||
            type == "ACTIVE_DURING" ||
            type == "FROM" ||
            type == "DEVELOPS" ||
            type == "LEADS" ||
            type == "FOUNDS" ||
            type == "DEPICTS" ||
            type == "WORKS_IN" ||
            type == "STUDIES" || type == "STUDIES_AT" ||
            type == "TEACHES" || type == "TEACHES_AT"; //displayed in light green

        var hideEdge = type == "FROM";

        var edge = {
            id: neoEdge.id,
            from: neoEdge.startNode,
            to: neoEdge.endNode,
            label: (type != "EXTENDS" && type !="PROPERTY" && type != "INFLUENCES" && type != "ASSOCIATED_WITH") ? type.toLowerCase():null,
            fontColor: 'blue',
            //  width: neoEdge.Weight/2 ,
            color: type == "FROM" ? "#EEEEEE"
                : type == "INFLUENCES" ? 'pink'
                : (type == "TEACHES" || type == "TEACHES_AT" || type==="PROPERTY") ? 'green'
                : 'blue',
            opacity: hideEdge ? 0 : 1,//type == "INFLUENCES" ? 1 : 0.7,
            style: symmetrical ? 'dash-line' : 'arrow',//arrow-center' ,
            type: ['curved'],
            labelAlignment: 'line-center'

        }

        return edge;

    }


        return {
               
            defaultEdgeType : function (fromType, toType) {
                if (toType == "Provenance") {
                    return "FROM";
                }
                else if (toType == "Painter") {
                    return "INFLUENCES";
                }

                return "ASSOCIATED_WITH";

            }
            ,
              options:   {
            //  configurePhysics:true,
            edges: { widthSelectionMultiplier: 4 }
                ,
            hierarchicalLayout: {
                enabled: false,
                levelSeparation: 10,//make this inversely proportional to number of nodes
                nodeSpacing: 200,
                direction: "UD",//LR
                //    layout: "hubsize"
            }
                ,
            dataManipulation: {
                enabled: true,
                initiallyVisible: true
            }
    ,
            //stabilize: true,
            //stabilizationIterations: 1000,
            physics: {
                barnesHut: {
                    enabled: true,
                    gravitationalConstant: -6000,
                    centralGravity: 1,
                    springLength: 20,
                    springConstant: 0.04,
                    damping: 0.09
                },
                repulsion: {
                    centralGravity: 0.1,
                    springLength: 0.5,
                    springConstant: 0.05,
                    nodeDistance: 100,
                    damping: 0.09
                }
                ,
                hierarchicalRepulsion: {
                    enabled: false,
                    centralGravity: 0,
                    springLength: 270,
                    springConstant: 0.01,
                    nodeDistance: 300,
                    damping: 0.09
                }
            }
             
                ,
            onDelete: function (data, callback) {
                //   $scope.publish("deleting");
            }
        }
            ,
            //transforms neo graph data object into object containing array of nodes and array of edges renderable by vis network
             toGraphData : function (g) {
                var graphData = {
                    nodes: [],
                    edges: []
                }
                for (var n in g.nodes) {
                    var node = graphNodeFromNeoNode(g.nodes[n])
                    graphData.nodes.push(node);
                }

                for (var r in g.edges) {
                    var edge = graphEdgeFromNeoEdge(g.edges[r]);
                    graphData.edges.push(edge);
                }
                return graphData;
            }
            
        }
    })
    .directive('graph', ['graphService','$state', function (service,$state) {
    return {
        restrict: 'E',
        templateUrl: 'app/query/graph.html',
        scope: {
            data: '=',
            active: '=',
            network: '='
        },
        link: function ($scope, $element, $attrs) {
            
            $scope.$on("$stateChangeSuccess", function updateSelectedNode() {
                console.log($state.params);
                //look for node with label $state.params.node in $scope.data
                //get node id
                if ($state.params.node){
                    for (var key in $scope.data.nodes){
                        if ($scope.data.nodes[key].label === $state.params.node){
                            if ($scope.data.nodes[key].id != getSelectedNodeId()){
                                   network.selectNodes([key]);
                            network.focusOnNode(key, { scale: 1.5, animation: { duration: 1000, easingFunction: 'easeOutCubic' } });

                            }
                         
                        }
                    }
                }
                
                
                
              
            });      
            
            var graphWidth= 1300;
            var graphHeight=$(window).height()-80;
            var topBarHeight=150;


            var options = service.options;
            options.onConnect= function (data, callback) {

                var newEdge = {
                    start: $scope.data.nodes[data.from],
                    type: service.defaultEdgeType($scope.data.nodes[data.from].Type, $scope.data.nodes[data.to].Type),
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

       

            // add event listeners
            network.on('select', function (params) {
              
                    
                    console.log($scope.data.nodes[params.nodes[0]]);
                    if (params.nodes.length===1){
                        let label = $scope.data.nodes[params.nodes[0]].label;
                        if (label){
                                  $state.go('admin.main.node.view',{node:label});
                        }
                    
                    }
                    else if (params.edges.length===1){
                        
                        var id=params.edges[0];
                        var startNode=$scope.data.nodes[$scope.data.edges[id].startNode];
                        var endNode =$scope.data.nodes[$scope.data.edges[id].endNode];
                        var edge ={
                            id: id,
                            start: {lookup:startNode.lookup},
                            end:  {lookup:endNode.lookup},
                            type: $scope.data.edges[id].type,
                            properties: $scope.data.edges[id].properties
                        }
                        
                        $state.go('admin.main.edge.view',{edge:JSON.stringify(edge)});
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
                    console.log($scope.data)
                    var gArr = service.toGraphData($scope.data);
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
                    var gArr = service.toGraphData(g);
                    graph.edges.update(gArr.edges);
                    graph.nodes.update(gArr.nodes);
                }

            });

       

        }

    }
}])