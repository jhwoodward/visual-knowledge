angular.module('neograph.node.images',['neograph.neo'])
    .controller('NodeImagesCtrl', ['neo', function (neo) {
  

            $scope.images = [];
            
            if ($stateParams.node){
                nodeService.get($stateParams.node,true).then(function(node){
                        $scope.node = node;
                    }); 
            }

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

    
}]);