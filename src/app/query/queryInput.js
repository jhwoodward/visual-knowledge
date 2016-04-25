angular.module('neograph.queryInput',['neograph.neo', 'neograph.query.presets','neograph.query.generator'])
.directive('queryinput', ['neo', 'queryPresets',function (neo,presets) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'app/query/queryInput.html',
            scope: {
                query: '=',
                editable: '=?',
                defaultpreset: '=?'

            },
            link: function ($scope, $element, $attrs) {
                
                console.log($scope.query);
          
                   
                $scope.$watch('preset', function (preset) {
                    console.log('p')
                    if (preset) {
                        console.log('preset change')
                        $scope.query.body = preset;
                    }
                })
                
                if ($scope.defaultpreset)
                {
                    $scope.preset=presets[$scope.defaultpreset];
                }

                $scope.$watch('query.body', function (body) {
                    if (body && body.q) {
                        console.log('query Change');
                        $scope.getData();
                    }

                });
                
                $scope.generated = {q:""};
                $scope.$watch('generated', function (generated) {
                    if (generated) {
                        $scope.query.body = generated;
                    }
                });
                
                $scope.nodeChanged = function (node) {
                    if (node) {
                        $scope.query.name = node.Label || node.Lookup;
                
                    }
                }
                
                $scope.connectAll = function () {
                    neo.getAllRelationships($scope.query.data.nodes)
                    .then(function (g) {
                        $.extend($scope.query.data.edges, g.edges);//add to cached data
                        $scope.publish("dataUpdate", g)
                    });
                }
                
                $scope.getData = function () {
                    
                    var body = $scope.query.body;
                    
                    if (body && body.q) {
                        console.log('get data')
                        
                        //if grid query then return results as array to preserve sort order
                        var returnArray = $scope.query.type === 'Grid' ? true : false;
                        
                        neo.getGraph(body.q, returnArray)
                        .then(function (g) {
                            
                            if (body.connectAll) {
                                
                                neo.getAllRelationships(g.nodes)
                                    .then(function (g2) {
                                    
                                    $.extend(g.edges, g2.edges);
                                    $scope.query.data = g;

                                });
                            }
                            else {
                                $scope.query.data = g;
                                console.log(g);
                            }
                        });
                    }
                }

            }
        }
    }])