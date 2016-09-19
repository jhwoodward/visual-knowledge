(function() {
  'use strict';
  angular.module('neograph.node.image.directive', [])
    .directive('nodeImage', directive);

    function directive() {
      return {
        scope: {
          node: '='
        },
        controller: 'NodeImageCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/node/image/node.image.html',
        restrict: 'E'
      };
   
  }

})();
