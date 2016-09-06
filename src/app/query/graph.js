angular.module('neograph.query.graph', ['ui.router', 'neograph.models.node'])
 .factory('graphService', nodeFactory => {
   const graphNodeFromNeoNode = neoNode => {
     neoNode = nodeFactory.create(neoNode);
     const type = neoNode.class;
     const yf = parseInt(neoNode.yearFrom, 10);
     const yt = parseInt(neoNode.yearTo, 10);
     let y = yt;
     if (yf && yt) {
       y = yt - ((yt - yf) / 2);
     }
     let level = 0;
     const startYear = 1400;
     const endYear = 2000;
     const step = 5;
     let cnt = 1;
     for (let i = startYear; i < endYear; i += step) {
       if (y >= i && y < i + step) {
         level = cnt;
       }
       cnt += 1;
     }
     if (y > endYear) {
       level = cnt;
     }
     const node = {
       id: neoNode.id,
       label: neoNode.label || neoNode.lookup,
       size: neoNode.status / 10,
       group: neoNode.class,
       mass: type === 'Group' ? 0.5 : 1,
       radius: neoNode.isPerson() ? neoNode.status : 1,
       // for hiearchichal layout,
       level,
       borderWidth: 0
     };

     const image = (type === 'Painting' || type === 'Picture') ?
      neoNode.temp.thumbUrl : null;

     if (image) {
       node.image = image;
       node.shape = 'image';
     } else if (type === 'Provenance') {
       node.fontSize = 50;
       node.fontColor = 'lightgray';
       node.color = 'transparent';
     } else if (type === 'Iconography' || type === 'Place') {
       node.shape = 'ellipse';
     } else if (type === 'Quotation') {
       node.shape = 'box';
       node.color = 'transparent';
       node.label = neoNode.text;
     } else if (type === 'User') {
       node.shape = 'star';
       node.size = 20;
     } else if (type === 'Link') {
       node.label = neoNode.name;
       node.shape = 'box';
       node.color = 'transparent';
     } else if (neoNode.isPerson()) {
       node.shape = 'dot';
     } else if (neoNode.isProperty()) {
       node.shape = 'circle';
     } else {
       node.shape = 'box';
     }

     node.color = { background: node.color || '#97C2FC', border: 'transparent' };
     if (neoNode.isProperty()) {
       node.color.background = 'lightgreen';
     }
     return node;
   };

   const graphEdgeFromNeoEdge = neoEdge => {
     const type = neoEdge.type;
     const symmetrical = type === 'ASSOCIATED_WITH';
     const hideEdgeLabel =
            type === 'BY' ||
            type === 'INFLUENCES' ||
            type === 'INSPIRES' ||
            type === 'DEALS_WITH' ||
            type === 'PART_OF' ||
            type === 'MEMBER_OF' ||
            type === 'ASSOCIATED_WITH' ||
            type === 'ACTIVE_DURING' ||
            type === 'FROM' ||
            type === 'DEVELOPS' ||
            type === 'LEADS' ||
            type === 'FOUNDS' ||
            type === 'DEPICTS' ||
            type === 'WORKS_IN' ||
            type === 'STUDIES' ||
            type === 'STUDIES_AT' ||
            type === 'TEACHES' ||
            type === 'TEACHES_AT';

     let colour;
     switch (type) {
       case 'FROM':
         colour = '#EEE';
         break;
       case 'INFLUENCES':
         colour = 'pink';
         break;
       case 'TEACHES':
       case 'TEACHES_AT':
       case 'PROPERTY':
         colour = 'green';
         break;
       default:
         colour = 'blue';
     }

     const hideEdge = type === 'FROM';
     const edge = {
       id: neoEdge.id,
       from: neoEdge.startNode,
       to: neoEdge.endNode,
       label: (
         type !== 'EXTENDS' &&
         type !== 'PROPERTY' &&
         type !== 'INFLUENCES' &&
         type !== 'ASSOCIATED_WITH'
         ) ? type.toLowerCase() : null,
       fontColor: 'blue',
       color: colour,
       opacity: hideEdge ? 0 : 1, // type === "INFLUENCES" ? 1 : 0.7,
       style: symmetrical ? 'dash-line' : 'arrow', // arrow-center' ,
       type: ['curved'],
       labelAlignment: 'line-center'
     };
     return edge;
   };


   return {
     defaultEdgeType: (fromType, toType) => {
       if (toType === 'Provenance') {
         return 'FROM';
       } else if (toType === 'Painter') {
         return 'INFLUENCES';
       }
       return 'ASSOCIATED_WITH';
     },
     options: {
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
         },
         hierarchicalRepulsion: {
           enabled: false,
           centralGravity: 0,
           springLength: 270,
           springConstant: 0.01,
           nodeDistance: 300,
           damping: 0.09
         }
       },
       onDelete: (data, callback) => {
       }
     },
     // Transforms neo graph data object into object
     // containing array of nodes and array of edges renderable by vis network
     toGraphData: g => ({
       nodes: Object.keys(g.nodes).map(key => graphNodeFromNeoNode(g.nodes[key])),
       edges: Object.keys(g.edges).map(key => graphEdgeFromNeoEdge(g.edges[key]))
     })
   };
 }).
 directive('graph', (graphService, $state) => ({
   restrict: 'E',
   templateUrl: 'app/query/graph.html',
   scope: {
     data: '=',
     active: '=',
     network: '='
   },
   link: ($scope, $element) => {
     const graph = {
       nodes: new vis.DataSet(),
       edges: new vis.DataSet()
     };
     const graphWidth = 1300;
     const graphHeight = $(window).height() - 80;
     const topBarHeight = 150;
     const options = graphService.options;
     options.onConnect = (data, callback) => {
       const newEdge = {
         start: $scope.data.nodes[data.from],
         type: graphService.defaultEdgeType(
                $scope.data.nodes[data.from].Type,
                $scope.data.nodes[data.to].Type),
         end: $scope.data.nodes[data.to],
         properties: { Weight: 3 }
       };
       $scope.publish('newEdge', newEdge);
     };
     const network = new vis.Network($element.find('.graphContainer')[0], graph, options);
     const getSelectedNodeId = () => {
       const selectedNodes = network.getSelectedNodes();
       if (selectedNodes.length === 1) {
         return selectedNodes[0];
       }
       return undefined;
     };

     $scope.data = {
       nodes: {},
       edges: {}
     };
     $scope.$on('$stateChangeSuccess', () => {
       if ($state.params.node) {
         Object.keys($scope.data.nodes).forEach(key => {
           if ($scope.data.nodes[key].label === $state.params.node) {
             if ($scope.data.nodes[key].id !== getSelectedNodeId()) {
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
     });

     // Set size to window size
     $scope.$watch('window', () => { network.setSize(`${graphWidth}px`, `${graphHeight}px`); });

     // Fit to screen on resize
     network.on('resize', () => {
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
     });

     graph.nodes.on('*', () => {
       if (graph.nodes.length) {
         $('.network-manipulationUI.connect').css('display', 'inline-block');
       } else {
         $('.network-manipulationUI.connect').hide();
       }
     });

     // Add event listeners
     network.on('select', (params) => {
       if (params.nodes.length === 1) {
         const label = $scope.data.nodes[params.nodes[0]].label;
         if (label) {
           $state.go('admin.main.node.view', { node: label });
         }
       } else if (params.edges.length === 1) {
         const id = params.edges[0];
         const startNode = $scope.data.nodes[$scope.data.edges[id].startNode];
         const endNode = $scope.data.nodes[$scope.data.edges[id].endNode];
         const edge = {
           id,
           start: { lookup: startNode.lookup },
           end: { lookup: endNode.lookup },
           type: $scope.data.edges[id].type,
           properties: $scope.data.edges[id].properties
         };
         $state.go('admin.main.edge.view', { edge: JSON.stringify(edge) });
       }
     });

     $scope.subscribe('deleted', (params) => {
       if (params.selection.nodes && params.selection.nodes.length) {
         const nodeids = params.selection.nodes.map(n => n.id);
         graph.nodes.remove(nodeids);
       }
       if (params.selection.edges && params.selection.edges.length) {
         const edgeids = params.selection.edges.map(n => n.id);
         graph.edges.remove(edgeids);
       }
     });

     $scope.subscribe('focus', (nodeid) => {
       network.focusOnNode(nodeid, {
         scale: 1,
         animation: {
           duration: 1000,
           easingFunction: 'easeOutCubic'
         } });
     });

     $('.network-manipulationUI.connect').hide();

     $scope.hoverNode = undefined;
     $('.graphContainer').on('mousemove', event => {
       const n = network._getNodeAt({
         x: event.pageX,
         y: event.pageY - topBarHeight - 55
       });
       $scope.$apply(() => {
         if (n) {
           const dataNode = $scope.data.nodes[n.id];
           $scope.hoverNode = dataNode;
           $scope.publish('hover', dataNode);
         } else {
           $scope.publish('hover', undefined);
           $scope.hoverNode = undefined;
         }
       });
     });

     // Freeze simulation if not active
     $scope.$watch('active', active => {
       if (active !== undefined) {
         network.freezeSimulation(!active);
       }
     });

     $scope.$watch('data', () => {
       if ($scope.active) {
         graph.nodes.clear();
         graph.edges.clear();
         const gArr = graphService.toGraphData($scope.data);
         graph.nodes.add(gArr.nodes);
         graph.edges.add(gArr.edges);
       }
     });

     // Update existing data (not replace)
     $scope.subscribe('dataUpdate', g => {
       if ($scope.active && $scope.data) {
         Object.assign($scope.data.edges, g.edges);
         Object.assign($scope.data.nodes, g.nodes);
         const gArr = graphService.toGraphData(g);
         graph.edges.update(gArr.edges);
         graph.nodes.update(gArr.nodes);
       }
     });
   }
 })
);
