angular.module('neograph.node.images',['neograph.neo'])
    .directive('nodeimages', ['neo', function (neo) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: '/app/node/images/node.images.html',
        scope: {
            node: '='
            , active: '='
            , updatemasonry:'=' //required to pass on to images. if defined then masonry not used
        },
        link: function ($scope, $element, $attrs) {

            $scope.images = [];

            var loaded = false;

            //load images on active change or on node change if active
            $scope.$watch('active', function (active) {

                if ($scope.node && active && !loaded) {
                    getImages();
                }
            });

            $scope.$watch('node', function (node) {
                loaded = false;
                if (!$scope.active) {
                    $scope.images = [];
                }
                if (node && $scope.active) {
                    getImages();
                }
            });

            var getImages = function () {

                neo.getImages($scope.node).then(function (images) {
                    $scope.images = images;
                    loaded = true;
                })

            }

            $scope.openGridTab = function (node) {

                $scope.publish("query", {
                    view: node.Lookup,
                    type: "Grid",
                    queryGenerator: { id: "nodeFilter", options: { node: node } }
                });

            }

        }
    }
}])