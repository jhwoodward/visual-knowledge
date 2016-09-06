angular.module('neograph.node.favourites', [])
    .directive('favourites', function () {
      return {
        restrict: 'E',
        templateUrl: 'app/node/favourites/node.favourites.html',
        scope: {
          node: '=',
          query: '='
        }
        ,
        link: function ($scope) {




          $scope.$watch('node', function (node) {

            var querys = [];

            if (node) {

              querys.push(
                {
                  name: 'Pictures',
                  view: node.Lookup + ' favourites',
                  type:'Grid',
                  queryGenerator: { id: 'favouritesFilter', options: { user: node } }
                });


              querys.push(
                {
                  name: 'People',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n:Person)    return n', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });

              querys.push(
                {
                  name: 'People + 1',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n:Person) -[]-(m:Person)   return n,m', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });

              querys.push(
                {
                  name: 'People and groups',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n) where (n:Person or n:Period or n:Group or n:Provenance)   return n', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });

              querys.push(
                {
                  name: 'People and groups + 1 ',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n) - [] - (m) where (n:Person or n:Period or n:Group or n:Provenance) and  (m:Person or m:Period or m:Group or m:Provenance)  return n,m', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });



              querys.push(
                {
                  name: 'Everything',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n:Global)  return n', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });


              querys.push(
                {
                  name: 'Everything + 1',
                  q: 'MATCH (c:' + node.Lookup + ':Favourite)-[]->(d) - [] - (n:Global) - [] - (m:Global)   return n,m', // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                  connectAll: true,
                  view: 'Graph'
                });



            }

            console.log(querys);

            $scope.querys = querys;

          });




        }



      };
    });
