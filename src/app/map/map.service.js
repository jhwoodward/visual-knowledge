(function() {

  'use strict';

  angular.module('neograph.map.service',[])
    .factory('mapService', factory);

  function factory() {

    return {
      getQueries: getQueries
    };

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
  }

})();