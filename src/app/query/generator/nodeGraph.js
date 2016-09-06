angular.module('neograph.query.generator.nodeGraph', ['neograph.neo'])
    .directive('nodeGraph', neo => ({
      restrict: 'E',
      templateUrl: 'app/query/generator/nodeGraph.html',
      scope: {
        options: '=',
        generated: '=',
        nodechanged: '&?'
      },
      link: ($scope) => {
        $scope.querys = [];
        $scope.selected = '';
        $scope.node = {};
        $scope.$watch('options', options => {
          $scope.node = options.node;
        });

        $scope.$watch('selected', sel => {
          if (sel && sel.q) {
            $scope.generated = sel.q;
          }
        });

        $scope.$watch('node', node => {
          if (node && node.id) {
            if ($scope.nodechanged) {
              $scope.nodechanged({ node });
            }
            neo.getNode(node.id, false).
              then(loaded => {
                getQuerys(loaded);
              });
          }
        });

        $scope.openNode = () => {
          if ($scope.node) {
            $scope.publish('selected', { selection: { nodes: [$scope.node] } });
          }
        };

        function getQuerys(node) {
          if (node) {
            const querys = [];
            const Lookup = node.Lookup;

            querys.push({
              name: 'All immediate relationships',
              q: `MATCH (c)-[r]-(d:Global) where ID(c) = ${node.id} return c,d,r`
            });

            querys.push({
              name: 'Self',
              q: `MATCH (c:${node.Label})-[r]-(d:${node.Label}) return c,d,r`
            });

            if (node.labels.indexOf('Provenance') > -1) {
              querys.push(
                {
                  name: 'Provenance',
                  q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' 
                  and not c.Lookup='${Lookup}'  return c,d,r
                  `
                });
            }

            if (node.labels.indexOf('Period') > -1) {
              querys.push({
                name: 'Period',
                q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' and not c.Lookup='${Lookup}'  return c,d,r
                  `
              });
            }

            if (node.labels.indexOf('Theme') > -1) {
              querys.push({
                name: 'Theme',
                q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' and not c.Lookup='${Lookup}'  return c,d,r
                  `
              });
            }

            if (node.labels.indexOf('Person') > -1) {
              querys.push({
                name: 'Outbound Influence',
                q: `
                  MATCH (c {Lookup:'${Lookup}'})-[r]->(d:Painter) 
                  with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e `,
                connectAll: true
              });
              querys.push({
                name: 'Inbound Influence',
                q: `
                  MATCH (c {Lookup:'${Lookup}'})<-[r]-(d:Painter) 
                  with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e 
                  `,
                connectAll: true
              });
            }

            if (node.labels.indexOf('Group') > -1) {
              querys.push({
                name: 'Group',
                q: `
                match (n {Lookup:'${Lookup}'}) -[r]-(m:Global) -[s]-(p:Global) 
                where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) 
                and (m:Painter or m:Group) and (p:Painter or p:Group) 
                and not m:Provenance and not p:Provenance return n,r,m,s,p
                `,
                connectAll: true
              });
            }

            if (node.labels.indexOf('Iconography') > -1) {
              querys.push({
                name: 'Iconography',
                q: `
                MATCH (c:Global:${Lookup})-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  
                and not d.Lookup='${Lookup}' and (d:${Lookup} or d:Provenance or d:Group 
                or d:Iconography or d:Place) return c,d,r
                `,
                connectAll: true
              });
            }

            if (node.YearFrom && node.YearTo) {
              querys.push({
                name: 'YearFromYearTo',
                q: `
                MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and 
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

            const prevselection = $scope.selected.name;

            $scope.querys = querys;
            $scope.querys.forEach(e => {
              if (e.name === prevselection) {
                $scope.selected = e;
              }
            });
          }
        }
      }
    })
);
