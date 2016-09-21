(function() {
  'use strict';
  angular.module('neograph.common.focusTo', [])
    .directive('focusTo', directive);

    function directive($timeout) {
      return {
        restrict: 'A',
        link: link
      };

      function link(scope, element, attrs) {

        var focusElement = element.closest(attrs.focusTo);
        element.on('focus', function(){
          focusElement.addClass('focus');
          focusElement.removeClass('unfocus');
        })
        element.on('blur', function(){
          focusElement.removeClass('focus');
        })
      }
    }
})();
