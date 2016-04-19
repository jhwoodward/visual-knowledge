angular.module('neograph.queryDirective',['neograph.neo', 'neograph.query.presets','neograph.query.generator'])
.directive('query', ['neo', 'queryPresets',function (neo,presets) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'app/query/queryDirective.html',
            scope: {
                view: '=',
                editable: '=?',
                defaultpreset: '=?'

            },
            link: function ($scope, $element, $attrs) {
                
          
                   
                $scope.$watch('preset', function (preset) {
                    console.log('p')
                    if (preset) {
                        console.log('preset change')
                        $scope.view.query = preset;
                    }
                })
                
                if ($scope.defaultpreset)
                {
                    $scope.preset=presets[$scope.defaultpreset];
                }

                $scope.$watch('view.query', function (query) {
                    if (query && query.q) {
                        console.log('query Change');
                        $scope.getData();
                    }

                });
                
                $scope.generatedQuery = {};
                $scope.$watch('generatedQuery.q', function (q) {
                    
                    if (q) {
                        $scope.view.query = { q: q }
                    }
                });
                
                $scope.nodeChanged = function (node) {
                    if (node) {
                        
                        
                        $scope.view.name = node.Label || node.Lookup;
                
                    }
                }
                
                $scope.connectAll = function () {
                    neo.getAllRelationships($scope.view.data.nodes)
                    .then(function (g) {
                        $.extend($scope.view.data.edges, g.edges);//add to cached data
                        $scope.publish("dataUpdate", g)
                    });
                }
                
                $scope.getData = function () {
                    
                    var query = $scope.view.query;
                    
                    if (query && query.q) {
                        console.log('get data')
                        
                        //if grid query then return results as array to preserve sort order
                        var returnArray = $scope.view.type === 'Grid' ? true : false;
                        
                        neo.getGraph(query.q, returnArray)
                        .then(function (g) {
                            
                            if (query.connectAll) {
                                
                                neo.getAllRelationships(g.nodes)
                                    .then(function (g2) {
                                    
                                    $.extend(g.edges, g2.edges);
                                    $scope.view.data = g;

                                });
                            }
                            else {
                                $scope.view.data = g;
                                console.log(g);
                            }
                        });
                    }
                }

            }
        }
    }])