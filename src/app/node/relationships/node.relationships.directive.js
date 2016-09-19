(function() {
  'use strict';
  angular.module('neograph.node.relationships.directive', [])
    .directive('nodeRelationships', directive);

    function directive() {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditRelationshipsCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-if="!vm.editing" ng-include="\'app/node/relationships/node.relationships.html\'"></div>
          <div ng-if="vm.editing" ng-include="\'app/node/relationships/node.edit.relationships.html\'"></div>
        </div>
        `,
        restrict: 'E'
      };

  }

})();
