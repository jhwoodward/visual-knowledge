(function() {
  'use strict';
  angular.module('neograph.node.references.directive', [])
    .directive('nodeReferences', directive);

    function directive($timeout) {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditReferencesCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-if="!vm.editing" ng-include="\'app/node/references/node.references.html\'"></div>
          <div ng-if="vm.editing" ng-include="\'app/node/references/node.edit.references.html\'"></div>
        </div>
        `,
        restrict: 'E',
        link: link
      };

      function link(scope, element, attrs, ctrl) {
      }
   
  }

})();
