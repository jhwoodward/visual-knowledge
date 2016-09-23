(function() {

  'use strict';

  angular.module('neograph.graph.service', [])
  .factory('graphService', factory);

  function factory(nodeService) {

    function getQueries(node) {

      if (!node) return [];

      var queries = [];
      var label = node.label;
      var labels = node.labels;

      if (!labels || !label) return [];

      if (node.label === 'Schema') {
         queries.push(
          {
            name: 'Schema',
            q: `
            MATCH (n:Class) - [r] -> (m:Class) 
            with n,r,m OPTIONAL MATCH n - [pr:PROPERTY] -> (p:Property)  
            with p,pr,n,r,m OPTIONAL MATCH m - [pr2:PROPERTY] -> (p2:Property)  
            return p,pr,p2,pr2,n,r,m
            `
          });
      }

      if (labels.indexOf('Provenance') > -1) {
        queries.push(
          {
            name: 'Provenance',
            q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' 
            and not c.Label='${label}'  return c,d,r
            `
          });
      }

      if (labels.indexOf('Period') > -1) {
        queries.push({
          name: 'Period',
          q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' and not c.Label='${label}'  return c,d,r
            `
        });
      }

      if (labels.indexOf('Theme') > -1) {
        queries.push({
          name: 'Theme',
          q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' and not c.Label='${label}'  return c,d,r
            `
        });
      }

     if (labels.indexOf('Person') > -1) {
        queries.push({
          name: 'Outbound Influence',
          /*
          q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Label)
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
            with c,d,r optional  match(d) -[s]->(e:Label)
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'    
              return c,d,r,s,e `,*/
           q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Label)
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
            return c,d,r `,
          connectAll: false
        });
        queries.push({
          name: 'Inbound Influence',
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
            with c,d,r optional  match(d) <-[s]-(e:Label)   
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'  
              return c,d,r,s,e 
            `,
          connectAll: false
        });
      }
/*
      if (labels.indexOf('Person') > -1) {
        queries.push({
          name: 'Outbound Influence',
          q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Label)  
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
            with c,d,r optional  match(d) -[s]->(e:Label)  
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'    
              return c,d,r,s,e `,
          connectAll: true
        });
        queries.push({
          name: 'Inbound Influence',
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
            with c,d,r optional  match(d) <-[s]-(e:Label)   
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'  
              return c,d,r,s,e 
            `,
          connectAll: true
        });
      }
*/
      if (labels.indexOf('Group') > -1) {
        queries.push({
          name: 'Group',
          q: `
          match (n {Label:'${label}'}) -[r]-(m:Label) -[s]-(p:Label) 
          where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) 
          and (m:Painter or m:Group) and (p:Painter or p:Group) 
          and not m:Provenance and not p:Provenance return n,r,m,s,p
          `,
          connectAll: true
        });
      }

      if (labels.indexOf('Iconography') > -1) {
        queries.push({
          name: 'Iconography',
          q: `
          MATCH (c:Label:${label})-[r]-(d:Label)  where not (c-[:INSTANCE_OF]-d)  
          and not d.Label='${label}' and (d:${label} or d:Provenance or d:Group 
          or d:Iconography or d:Place) return c,d,r
          `,
          connectAll: true
        });
      }

      if (node.YearFrom && node.YearTo) {
        queries.push({
          name: 'YearFromYearTo',
          q: `
          MATCH (c:Label)-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) and 
          (
            (c.YearTo >= ${node.YearFrom} and c.YearTo<= ${node.YearTo}) 
            or (c.YearFrom >= ${node.YearFrom} and c.YearFrom<= ${node.YearTo})
          )
          and 
          (
            (d.YearTo >= ${node.YearFrom} and d.YearTo<= ${node.YearTo}) 
            or (d.YearFrom >= ${node.YearFrom} and d.YearFrom<= ${node.YearTo})
          )
          return c,d,r
          `,
          connectAll: true
        });
      }

      queries.push({
        name: 'All immediate relationships',
        q: `MATCH (c)-[r]-(d:Label) where ID(c) = ${node.id} return c,d,r`
      });

      queries.push({
        name: 'Self',
        q: `MATCH (c:${label})-[r]-(d:${label}) return c,d,r`
      });

      return queries;
    }
    
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
     //   size: neoNode.status * 2,
        group: neoNode.class,
        mass: type === 'Group' ? 0.5 : 1,
        radius: neoNode.isPerson() ? (neoNode.status * 2) ^ 3 : 1,
        // for hiearchichal layout,
        level,
        borderWidth: 0
      };

      var image;// = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

      node.color = {
        background:'#5696ce',
        highlight: {
          background: '#fff',
          fontColor: '#fff'
        },
        border: 'transparent'
      }

      node.fontColor = '#3e82bd';

      if (image) {
        node.image = image;
        node.shape = 'image';
      } else if (type === 'Provenance') {
        node.fontSize = 100;
        node.fontColor = '#5696ce';
        node.color.background = 'transparent';
      } else if (type === 'Iconography' || type === 'Place') {
        node.shape = 'ellipse';
           node.fontColor = '#c5d9ec';
      } else if (type === 'Quotation') {
        node.shape = 'box';
        node.color.background = 'transparent';
        node.label = neoNode.text;
      } else if (type === 'User') {
        node.shape = 'star';
        node.size = 20;
      } else if (type === 'Link') {
        node.label = neoNode.name;
        node.shape = 'box';
        node.color.background = 'transparent';
      } else if (neoNode.isPerson()) {
       // node.size = node.status * 2;
        node.shape = 'dot';
        node.fontFill = '#8fb1ca';
      } else if (neoNode.isProperty()) {
        node.color.background = 'transparent';
       // node.shape = 'circle';
       // node.color = '#b3cae0';
      } else {
        node.shape = 'box';
        node.fontColor = '#c5d9ec';
        node.fontFill = node.color;
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
        color: {
          color: colour,
          highlight: '#fff'
        }
          ,
        fontFill: '#8fb1ca',
        opacity: hideEdge ? 0 : 1, // type === "INFLUENCES" ? 1 : 0.7,
        style: symmetrical ? 'dash-line' : 'arrow', // arrow-center' ,
        type: ['curved'],
        labelAlignment: 'line-center'
      };
      return edge;
    };


    return {
      getQueries: getQueries,
      defaultEdgeType: function(fromType, toType) {
        if (toType === 'Provenance') {
          return 'FROM';
        } else if (toType === 'Painter') {
          return 'INFLUENCES';
        }
        return 'ASSOCIATED_WITH';
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