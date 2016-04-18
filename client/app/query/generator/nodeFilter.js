angular.module('neograph.query.generator.nodeFilter',['neograph.neo'])
    .directive('nodeFilter', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: '/app/query/generator/nodeFilter.html',
        scope: {
            options: '='
            ,
            generated: '='
            ,
            nodechanged: '&?'
        },
        link: function ($scope, $element, $attrs) {


            $scope.filters = [];
            $scope.node = {};
            var labels = [];

            $scope.$watch('options', function (options) {

                console.log('node filter options changed')
                $scope.node = options.node;

            });
        

            //$scope.$watch('options.node', function (node) {
             
            //    console.log('node filter options.node changed')
                 
              
            //});

            $scope.$watch('node', function (node) {
                if ($scope.nodechanged) {
                    $scope.nodechanged({ node: node });
                }
                load();
            });
        
            $scope.openNode = function () {

                if ($scope.node) {
                    $scope.publish('selected',{selection:{nodes:[$scope.node]}})
                }
            }

            var load = function () {
                if ($scope.node) {
                    labels = [$scope.node.Label, 'Picture'];
                    getFilters();
                    $scope.enabledFilters = [];
                    $scope.process();
                }
            }

            var getFilters = function () {
                console.log('node filter - get filters')
                console.log(labels);
                if (labels && labels.length) {
                    neo.getDistinctLabels(labels)
                    .then(function (l) {

                        //remove filter for this node as it is duplicating
                        angular.forEach(labels, function (lab) {
                            l.splice($.inArray(lab, l), 1);
                        });

                        $scope.filters = l;
                        console.log($scope.filters )
                    });
                }
            }


            $scope.process = function (labs) {

                if ($scope.node) {

                    if (!labs || !labs.length) {
                        labs = labels;
                    }
                    else {
                        labs = labs.concat(labels);
                    }

                    $scope.generated = "match (a:" + labs.join(':') + " ) return a order by a.Status desc limit 500";

                    if (labs != labels) {
                        neo.getDistinctLabels(labs)
                          .then(function (l) {
                              $scope.enabledFilters = l;

                          });
                    }
                    else {
                        $scope.enabledFilters =[];
                    }
                }
            }




        }
    }
}])