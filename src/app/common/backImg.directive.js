(function() {
  'use strict';
  angular.module('neograph.common.backImg', [])
    .directive('backImg', directive);

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
        console.log('link');
        var url;
        var image = angular.element('<img/>')
          .on('load',function() {

            var imageElement = angular.element('<div/>').addClass("image layer");

            imageElement.css({
              'background-image': 'url(' + scope.url +')'
            });
            element.append(imageElement);
            $timeout(function() {
              imageElement.css({'opacity':1});
            });

            $timeout(function() {
              element.find('.complete').remove();
              element.find('.image.layer').addClass('complete');
            },600);

          });

        scope.$watch('url',setImage);
        $timeout(setImage);

        function setImage() {
          if (scope.url) {
            image.attr('src', scope.url)
          }
        }
      }
  }

})();
