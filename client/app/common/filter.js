angular.module('neograph.common.filter',[])
.directive('filter', function () {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/app/common/filter.html',
        scope: {

            init: '='//an array of labels
            ,
            enabled: '='
            ,
            process: '&'

        },
        link: function ($scope, $element, $attrs) {

            $scope.filters = {}

            $scope.$watch('init', function (labels) {

                var filters = {};
                angular.forEach(labels, function (f) {
                    filters[f] = 0;
                });

                $scope.filters = filters;

            });

            $scope.getFilterClass = function (value) {

                if (value === 1)
                    return 'label-success';
                else if (value === 0)
                    return 'label-info';
                else return '';
            }

            $scope.toggleFilter = function (label) {
                if ($scope.filters[label] == 1) {
                    $scope.filters[label] = 0;

                }
                else if ($scope.filters[label] == 0) {
                    $scope.filters[label] = 1;

                }
                else if ($scope.filters[label] == -1) {
                    for (var f in $scope.filters) {
                        $scope.filters[f] = 0;
                    };
                    $scope.filters[label] = 1;
                }

                var labels = [];
                for (var f in $scope.filters) {

                    if ($scope.filters[f] === 1) {
                        labels.push(f);
                    }

                }


                $scope.process({ labels: labels })



            }


            $scope.$watch("enabled", function (labels) {//labels = selectable labels following filtering

                if (labels && labels.length) {
                    for (var f in $scope.filters) {

                        if ($.inArray(f, labels) == -1) {//disable filter if not in list
                            $scope.filters[f] = -1;
                        }
                        else if ($scope.filters[f] == -1) {//enable filter if in list and previously disabled
                            $scope.filters[f] = 0;
                        }
                    }
                }
                else {

                    for (var f in $scope.filters) {
                        $scope.filters[f] = 0;
                    }
                }

            })




        }
    }
})