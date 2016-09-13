(function() {
  'use strict';
  angular.module('neograph.node.image.directive', [])
    .directive('nodeImage', directive);

    function directive($timeout) {
      return {
        scope: {
          url: '='
        },
        replace: 'true',
        template: '<div class="image" style="position:relative"></div>',
        restrict: 'EA',
        link: link
      };

      function link(scope, element, attrs) {
        var url;
        var image = angular.element('<img/>')
          .on('load',function() {
            var imageElement = angular.element('<div/>').addClass("image layer");
            imageElement.css({
              'background-image': 'url(' + scope.url +')'
            });
            element.append(imageElement);
            $timeout(function() {
              imageElement.css({'opacity': 1});
            });

            $timeout(function() {
              element.find('.complete').remove();
              element.find('.image.layer').addClass('complete');
            }, 1000);
          });

        scope.$watch('url',setImage);
        $timeout(setImage);

        function setImage() {
          if (scope.url) {
            image.attr('src', scope.url)
          } else {
            element.find('.image.layer').css({'opacity': 0});
          }
        }
      }
  }

})();
