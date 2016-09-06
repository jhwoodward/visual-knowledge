angular.module('neograph.common.labels', ['neograph.neo', 'neograph.utils'])
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
      navpath: '@'
            ,
      highlight:'@?'
    },
    link: function ($scope, $element, $attrs) {

      $scope.$watch('node', function (node) {
        if (node) {
          $scope.labels = $scope.node.labels;
        }

      });

      $scope.$watch('items', function (items) {
        if (items) {
          $scope.labels = $scope.items.map(function (x) { return x.label; });
        }

      });




      $scope.getClass = function (label) {
        if (label === $attrs['highlight']) {
          return 'label-warning';
        }
        else
                return utils.getLabelClass($scope.node, label);
      };





    }
  };
}]);
