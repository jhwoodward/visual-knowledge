angular.module('node.imageRelationships',['neograph.neo'])
    .directive('imageRelationships', ['neo', function (neo) {
    return {
        restrict: 'E',
        templateUrl: '/app/node/imageRelationships/node.imageRelationships.html',
        scope: {
            node: '=',
            query: '=',
            window:'='
        }
        ,
        link: function ($scope) {

         


            $scope.$watch('node', function (node) {


                if (node) {



                    var querys = [];

                    querys.push(
                         {
                             name: "Linked pictures",
                             q: "MATCH (c)-[r]-(d:Picture) where ID(c) = " + node.id + " return d"
                         })


                    if ( node.YearFrom || node.YearTo) {
                        var yq;

                        if (node.YearFrom && node.YearTo) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo >= " + node.YearTo + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearFrom + ") return c"
                            }
                        }
                        else if (node.YearTo) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo = " + node.YearTo + " ) or (c.YearFrom = " + node.YearTo + " ) return c"
                            };
                        }
                        else if (node.YearFrom) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo = " + node.YearFrom + ") or (c.YearFrom = " + node.YearFrom + " ) return c"
                            };
                        }
                        yq.name = "Contemporaneous";
                        yq.type = "Grid";


                        yq.preview = yq.q + " limit 3";
                        querys.push(yq);

                    }


                    angular.forEach(node.labels, function (label) {

                        if (label != "Picture" && label != "Painting") {
                            querys.push(
                          {
                              isLabel:true,
                              name:  label,
                              q: "MATCH (c:Picture:" + label + ") return c",
                              preview: "MATCH (c:Picture:" + label + ")  where ID(c)<>" + node.id + "  return c limit 3",
                              view: label,
                              type:"Grid",
                              queryGenerator: { id: "nodeFilter", options: { node: { Lookup: label } } }
                          })

                        }

                    })

                  
                    //if (node.YearFrom && node.YearTo) {

                    //    var yq = "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and ";
                    //    yq += "((c.YearTo >= " + node.YearFrom + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearTo + "))";
                    //    yq += "and ((d.YearTo >= " + node.YearFrom + " and d.YearTo<= " + node.YearTo + ") or (d.YearFrom >= " + node.YearFrom + " and d.YearFrom<= " + node.YearTo + "))";
                    //    yq += " return c,d,r";
                    //    querys.push({
                    //        name: 'YearFromYearTo',
                    //        q: yq

                    //     ,
                    //        connectAll: true
                    //    });

                    //}



                    $scope.querys = querys;

                    angular.forEach(querys,function(query){
                    
                        neo.getGraph(query.preview || query.q)
                       .then(function (g) {
                                
                           query.hasData = !$.isEmptyObject(g.nodes);
                        

                           query.data = g;
                       });
                    });


                    //   console.log(querys);

                }
                else {

                    $scope.querys = [];


                }



            });




        }



    }
}])