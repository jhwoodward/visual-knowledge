(function() {

  'use strict';

  angular.module('neograph.map.graph.service', [])
  .factory('graphService', factory);

  function factory(nodeService) {
    
    function graphNodeFromNeoNode(neoNode) {
      neoNode = nodeService.create(neoNode);
      var type = neoNode.class;
      var yf = parseInt(neoNode.yearFrom, 10);
      var yt = parseInt(neoNode.yearTo, 10);
      var y = yt;
      if (yf && yt) {
        y = yt - ((yt - yf) / 2);
      }
      var level = 0;
      var startYear = 1400;
      var endYear = 2000;
      var step = 5;
      var cnt = 1;
      var i;
      for (i = startYear; i < endYear; i += step) {
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
          fontFill: '#8fb1ca',
        size: neoNode.status / 10,
        group: neoNode.class,
        mass: type === 'Group' ? 0.5 : 1,
        radius: neoNode.isPerson() ? neoNode.status : 1,
        // for hiearchichal layout,
        level,
        borderWidth: 0
      };

      var image;// = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

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

      node.color = { background: node.color || '#3e82bd', border: 'transparent' };
      if (neoNode.isProperty()) {
        node.color.background = 'lightgreen';
      }
      return node;
    };

    function graphEdgeFromNeoEdge(neoEdge) {
      var type = neoEdge.type;
      var symmetrical = type === 'ASSOCIATED_WITH';
      var hideEdgeLabel =
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

      var colour;
      switch (type) {
        case 'FROM':
          colour = '#EEE';
          break;
        case 'INFLUENCES':
          colour = '#3e82bd';
          break;
        case 'TEACHES':
        case 'TEACHES_AT':
        case 'PROPERTY':
          colour = 'green';
          break;
        default:
          colour = '#3e82bd';
      }

      var hideEdge = type === 'FROM';
      var edge = {
        id: neoEdge.id,
        from: neoEdge.startNode,
        to: neoEdge.endNode,
        label: (
          type !== 'EXTENDS' &&
          type !== 'PROPERTY' &&
          type !== 'INFLUENCES' &&
          type !== 'ASSOCIATED_WITH'
          ) ? type.toLowerCase().replace(/_/g,'') : null,
        fontColor: '#3e82bd',
        color: colour,
        fontFill: '#8fb1ca',
        opacity: hideEdge ? 0 : 1, // type === "INFLUENCES" ? 1 : 0.7,
        style: symmetrical ? 'dash-line' : 'arrow', // arrow-center' ,
        type: ['curved'],
        labelAlignment: 'line-center'
      };
      return edge;
    };


    return {
      defaultEdgeType: function(fromType, toType) {
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
      },
      // Transforms neo graph data object into object
      // containing array of nodes and array of edges renderable by vis network
      toVisNetworkData: function(g) {
        return {
          nodes: Object.keys(g.nodes).map(function(key) { return graphNodeFromNeoNode(g.nodes[key]); }),
          edges: Object.keys(g.edges).map(function(key) { return graphEdgeFromNeoEdge(g.edges[key]); })
        };
      }
    };
  }

})();