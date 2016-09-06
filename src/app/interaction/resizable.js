angular.module('neograph.interaction.resizable', [])
.directive('resizable', function ($window) {
  return {
    scope: {
      window: '='
    },
    controller: function ($scope, $element) {

      var w = angular.element($window);
      var getWindowDimensions = function () {
        var width = w.width();
        var height = w.height();
        return {
          'height': height,
          'width': width,
          'tabsWidth': $scope.window.tabsWidth,
          'tabsWidthInner': $scope.window.tabsWidth - 10,
          'graphWidth': width - $scope.window.tabsWidth,
          'graphHeight': height - $scope.window.topBarHeight,
          'topBarHeight': $scope.window.topBarHeight,
          'tabsHeight': height - $scope.window.topBarHeight
        };
      };

      $scope.window = getWindowDimensions();

      $scope.$watch(getWindowDimensions, function (newValue, oldValue) {

        $scope.window = newValue;

      }, true);

      w.bind('resize', function () {
        $scope.$apply();
      });

            // w.bind("debouncedresize", function (event) {
            //    $scope.$apply();

            // });

    }
  };
});

