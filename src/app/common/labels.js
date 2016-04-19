angular.module('neograph.common.labels',['neograph.neo','neograph.utils'])
.directive('labels', ['neo', 'utils', function (neo, utils) {
    return {
        restrict: 'E',
        templateUrl: 'app/common/labels.html',
        scope: {
            node: '=?'
            ,
            labels: '=?'
            ,
            items: '=?'
            ,
            navpath: '@?'
            ,
            highlight:'@?'
        },
        link: function ($scope, $element, $attrs) {

            $scope.$watch('node', function (node) {
                if (node) {
                    setLabels();
                }
          
            });

            $scope.$watch('items', function (items) {
                if (items) {
                    $scope.labels = $scope.items.map(function (x) {return x.Label });
                }
              
            });


            //$scope.$watch('labels', function () {
            //   setLabels()
            //});

            function setLabels() {

                $scope.labels = $attrs["labels"] ? $scope.labels : $scope.node ? $scope.node.labels : [];

            }

            if ($attrs['node']) {

                $scope.navigate = function (label) {
                    //load full node including labels and relationships
                    neo.getNodeByLabel(label,true)
                        .then(function (node) {

                            $scope.node = node;

                        });

                }
            }

            if ($attrs['navpath']) {
                $scope.navpath = $attrs['navpath'];
            }


           
                $scope.getClass = function (label) {
                    if (label === $attrs['highlight']) { 
                        return 'label-warning';
                    }
                    else
                return utils.getLabelClass($scope.node, label);
            }



        }
    }
}]);