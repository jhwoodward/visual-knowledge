(function(){

  angular.module('neograph.common.onImageLoaded', [])
    .directive('onImageLoaded', function () {
      return {
        restrict: 'A',
        scope: {
          onImageLoaded: '&',
          onImageError: '&?'
        },
        link: function (scope, element, attrs) {
          element.bind('load', function() {
            scope.$apply(function() {
              scope.onImageLoaded();
            });
            
          });
          element.bind('error', function(err) {
            if (scope.onImageError) {
              scope.onImageError(err);
            }
          });
        }
      };
    });

})();
