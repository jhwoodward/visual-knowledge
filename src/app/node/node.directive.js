(function() {
  'use strict';
  angular.module('neograph.node.directive', [])
    .directive('node', directive);

    function directive($timeout) {
      return {
        scope: {
          node: '=',
          editing: '=',
          onToggleEdit: '&?',
          onTabChanged: '&?'
        },
        controller: 'NodeDirectiveCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/node/node.html',
        restrict: 'E',
        link: link
      };

      function link(scope, element, attrs, ctrl) {
      }
   
  }

})();
