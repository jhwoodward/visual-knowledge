(function() {
  'use strict';
  angular.module('neograph.common.backImg', [])
    .directive('backImg', directive);

    function directive($timeout) {
      return {
        restrict: 'A',
        link: link
      };

      function link(scope, element, attrs) {

        var url;
        var image = angular.element('<img/>').css('visibility','hidden').appendTo('body').on('load',function() {
          element.css({
            'background-image': 'url(' + url +')',
            'background-size' : 'cover'
          });
        });

        scope.$watch('vm.node',setImage);
        $timeout(setImage);
        element.css('transition','background 400ms linear');

        function setImage() {
          if (scope.vm.node.image) {
            url = scope.vm.node.image.full.url;

            image.attr('src', url)
          }
        
        }

      }
  }

})();
