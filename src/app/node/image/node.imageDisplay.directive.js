(function() {
  'use strict';
  angular.module('neograph.node.imageDisplay.directive', [])
    .directive('nodeImageDisplay', directive);

    function directive($timeout) {
      return {
        scope: {
          url: '='
        },
        replace: 'true',
        template: '<div class="image" style="position:relative"><div class="image-loader ion-ios-loop-strong spin"></div></div>',
        restrict: 'EA',
        link: link
      };

      function link(scope, element, attrs) {
        var url;
        var loader = element.find('.image-loader');

        var image = angular.element('<img/>')
          .on('load',function() {
            loader.removeClass('loading');
            var imageElement = angular.element('<div/>').addClass("image layer");
            imageElement.css({
              'background-image': 'url("' + scope.url +'")'
            });
            element.append(imageElement);
            $timeout(function() {
              imageElement.css({'opacity': 1});
            });

            $timeout(function() {
             // element.find('.complete').remove();
              element.find('.image.layer').addClass('complete');
            }, 1000);
          });

        scope.$watch('url',setImage);
        $timeout(setImage);

        function setImage() {
        
          if (scope.url) {
            loader.addClass('loading');
            image.attr('src', scope.url)
          } else {
            element.find('.image.layer').css({'opacity': 0});
          }
        }
      }
  }

})();
