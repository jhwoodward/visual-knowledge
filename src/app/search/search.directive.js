(function() {
  'use strict';
  angular.module('neograph.search.directive', [])
    .directive('search', directive);

    function directive() {
      return {
        scope: {
          onSelected: '&'
        },
        transclude: true,
        controller: 'SearchCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/search/search.html',
        restrict: 'E',
        link: function(scope, element, attrs, vm) {

          scope.$watch('vm.node', function (node) {
            element.find('.btn-search').focus();
            element.addClass('unfocus');
          });

        }
      };
  }

})();
