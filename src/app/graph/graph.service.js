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
          name: 'Creation relation',
            q: ` match (n:Person {Label:'${label}'}) <- [:BY] - (c1:Creation) - [r] - (c2:Creation) - [:BY] -> (m:Person)
                  return n,m `
        });

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
            MATCH (c:Person {Label:'${label}'})-[r]->(d:Label)
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
              
            return c,d,r limit 5 `,
          connectAll: false
        });
        queries.push({
          name: 'Inbound Influence',
          /*
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
            with c,d,r optional  match(d) <-[s]-(e:Label)   
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'  
              return c,d,r,s,e 
            `,*/
          q: `
            MATCH (c:Person {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
           
             return c,d,r limit 5 `,
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
 
      if (!(neoNode instanceof Node)) {
        neoNode = nodeService.create(neoNode);
      }

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

      var largeText = neoNode.isProvenance() || 
                    neoNode.isPeriod() || 
                    neoNode.hasType('Group') || 
                    neoNode.hasType('Iconography') || 
                    neoNode.hasType('Theme');
      
      var node = {
        largeText: largeText,
        data: neoNode,
        id: neoNode.id,
        label: neoNode.hasType('Quotation') ? neoNode.text : neoNode.label || neoNode.lookup,
        mass:  largeText ? 2 : 1,//increase value to increase repulsion
        size: neoNode.isPerson() ? (neoNode.status * 2) ^ 3 : 1,
        title:  neoNode.label,
        // for hiearchichal layout,
        //level,
    //    group: neoNode.type ? neoNode.type.lookup : 'Type',
        borderWidth: 0,
        borderWidthSelected: 0,
        shape: neoNode.isPerson() ? 'dot': 'box',
        color: {
          background: neoNode.isPerson() ? '#5a9cd6' : 'transparent',
          highlight: neoNode.isPerson() ? '#fff' : 'transparent',
          border: 'transparent'
        },
        labelHighlightBold: false,
        font: {
          color: largeText ? '#76a1c5' : '#3e82bd',
          size:  largeText ? 30 : 16
          ,background: largeText ? 'transparent' : '#8fb1ca' 
        }
      };

/*
      var image;// = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

      if (neoNode.isPicture()) {
        node.image = neoNode.image;
        node.shape = 'image';
      } 
      */
      return node;
    };

    function graphEdgeFromNeoEdge(neoEdge) {

      var type = neoEdge.type;
      var directional = type === 'INFLUENCES' || type === 'INSPIRES' || type === 'TEACHES';
      var hideLabel =
              type === 'CREATION' ||
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

      var colour, fontColour;
      switch (type) {
        case 'CREATION':
          colour = '#fff';
          break;
        case 'FROM':
        case 'ACTIVE_DURING':
          colour = 'transparent';
          break;
        default:
          colour = '#3e82bd';
          fontColour = '#3e82bd';
      }

      var hidden = type === 'FROM' || type === 'ACTIVE_DURING';
     

      var label = type.toLowerCase().replace(/_/g,' ')
      var edge = {
        data: neoEdge,
        id: neoEdge.id,
        title: label,
        from: neoEdge.startNode,
        to: neoEdge.endNode,
        label: hideLabel ? undefined : label,
        font: {
          color: fontColour,
          background: '#8fb1ca',
          strokeWidth: 0
        },
        color: {
          color: colour,
          opacity: 0.5,
          highlight: '#fff'
        },
        hidden: hidden, 
        arrows: directional ? 'to' : undefined,
        arrowStrikethrough: false,
        dashes: !directional, // arrow-center' ,
        smooth: {
          type: 'dynamic'
        },
        labelHighlightBold: false

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
          nodes: Object.keys(g.nodes).map(function(key) { 
            return graphNodeFromNeoNode(g.nodes[key]); 
          }),
          edges: Object.keys(g.edges).map(function(key) { 
            return graphEdgeFromNeoEdge(g.edges[key]); 
          })
        };
      },
      graphNodeFromNeoNode: graphNodeFromNeoNode,
      graphEdgeFromNeoEdge: graphEdgeFromNeoEdge
    };
  }

})();