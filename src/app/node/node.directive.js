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
        controller: 'NodeCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/node/node.html',
        restrict: 'E'
      };

   
  }

})();
