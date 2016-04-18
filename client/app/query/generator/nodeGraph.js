angular.module('neograph.query.generator.nodeGraph',['neograph.neo'])
    .directive('nodeGraph', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: '/app/query/generator/nodeGraph.html',
        scope: {
            options: '='
            ,
            generated: '='
            ,
            nodechanged: '&?'
        },
        link: function ($scope, $element, $attrs) {

            $scope.querys = [];
            $scope.selected = "";
            $scope.node = {};

            $scope.$watch('options', function (options) {
                console.log('node filter options changed')
                $scope.node = options.node;

            });

            $scope.$watch('selected', function (sel) {
                console.log(sel);
                if (sel && sel.q) {
                    $scope.generated = sel.q;
                }
            });

            $scope.$watch('node', function (node) {

                if (node && node.id) {
                    if ($scope.nodechanged) {
                        $scope.nodechanged({ node: node });
                    }
                    neo.getNode(node.id, false)
                .then(function (loaded) {
                    getQuerys(loaded);
                });
                }

            });

            $scope.openNode = function () {

                if ($scope.node) {
                    $scope.publish('selected', { selection: { nodes: [$scope.node] } })
                }
            }

            var getQuerys = function (node) {

                if (node) {

                    var querys = [];
                    var Lookup = node.Lookup;


                                          

                    querys.push(
                       {
                           name: "All immediate relationships",
                           q: "MATCH (c)-[r]-(d:Global) where ID(c) = " + node.id + " return c,d,r"
                       });

                    querys.push(
                          {
                              name: "Self",
                              q: "MATCH (c:" + node.Label + ")-[r]-(d:" + node.Label + ")   return c,d,r"
                          });

                    if ($.inArray("Provenance", node.labels) > -1) {

                        querys.push(
                            {
                                name: "Provenance",
                                q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                            })
                    }

                    if ($.inArray("Period", node.labels) > -1) {

                        querys.push(
                            {
                                name: "Period",
                                q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                            })
                    }

                    if ($.inArray("Theme", node.labels) > -1) {

                        querys.push(
                            {
                                name: "Theme",
                                q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                            })
                    }

                    if ($.inArray("Person", node.labels) > -1) {

                        querys.push(
                            {
                                name: "Outbound Influence",
                                //  q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) return c,d,e,f,r,s,t",
                                q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter) with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e ",
                                connectAll: true
                            })

                        querys.push(
                          {
                              name: "Inbound Influence",
                              //    q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) return c,d,e,f,r,s,t",
                              q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter) with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e ",
                              connectAll: true
                          })

                    }

                    if ($.inArray("Group", node.labels) > -1) {

                        querys.push({
                            name: 'Group',
                            q: "match (n {Lookup:'" + Lookup + "'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p"
    ,
                            connectAll: true
                        });

                    }


                    if ($.inArray("Iconography", node.labels) > -1) {


                        querys.push({
                            name: 'Iconography',
                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  and not d.Lookup='" + Lookup + "' and (d:" + Lookup + " or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r"
                          ,
                            connectAll: true
                        });

                    }

                    if (node.YearFrom && node.YearTo) {

                        var yq = "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and ";
                        yq += "((c.YearTo >= " + node.YearFrom + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearTo + "))";
                        yq += "and ((d.YearTo >= " + node.YearFrom + " and d.YearTo<= " + node.YearTo + ") or (d.YearFrom >= " + node.YearFrom + " and d.YearFrom<= " + node.YearTo + "))";
                        yq += " return c,d,r";
                        querys.push({
                            name: 'YearFromYearTo',
                            q: yq

                         ,
                            connectAll: true
                        });

                    }

                    var prevselection = $scope.selected.name;

                    $scope.querys = querys;

                    $($scope.querys).each(function (i, e) {

                        if (e.name === prevselection)
                        {
                            $scope.selected = e;
                        }
                    });


                }
            }








        }
    }
}])