angular.module('neograph.query.generator.favouritesFilter',['neograph.neo'])
.directive('favouritesFilter', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: 'app/query/generator/favouritesFilter.html',
        scope: {
            options: '='
            ,
            generated: '='
        },
        link: function ($scope, $element, $attrs) {


            $scope.filters = [];
            $scope.node = {};
            var labels = [];
            $scope.$watch('options', function (options) {
                if (options) {
                    $scope.node = options.user;
                }
            });

            $scope.$watch('node', function (user) {
                load();
            });

            var load = function () {
                if ($scope.node) {
                    labels = [$scope.node.Lookup, 'Favourite'];
                    getFilters();
                    $scope.enabledFilters = [];
                    $scope.process();
                }

            }

            var getFilters = function () {
                if (labels && labels.length) {

                    var labelQuery = "match (a:" + labels.join(':') + ") - [] -> (b) return distinct(LABELS(b))";

                    neo.getDistinctLabelsQuery(labelQuery)
                    .then(function (l) {

                        //remove filter for this node as it is duplicating
                        angular.forEach(labels, function (lab) {
                            l.splice($.inArray(lab, l), 1);
                        });
                        $scope.filters = l;

                    });
                }
            }





            $scope.process = function (labs) {

                if ($scope.node) {

                    labs = labs || [];

                    var b = "b";
                    if (labs.length) {
                        b += ":" + labs.join(":");
                    }

                    var q = "match (a:" + labels.join(':') + ") - [] -> (" + b + ")";

                    
                     
                    $scope.generated = q + " return b";
                 



                    if (labs.length) {
                        neo.getDistinctLabelsQuery(q + " return distinct(LABELS(b))")
                          .then(function (l) {
                              $scope.enabledFilters = l;

                          });
                    }
                    else {
                        $scope.enabledFilters = [];
                    }
                }
            }



        }
    }
}])