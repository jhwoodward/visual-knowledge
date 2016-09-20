(function() {
  'use strict';
  angular.module('neograph.search.directive', [])
    .directive('search', directive);

    function directive() {
      return {
        scope: {
          onSelected: '&'
        },
        controller: 'SearchCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/search/search.html',
        restrict: 'E'
      };
  }

})();
