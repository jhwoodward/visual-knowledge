(function() {
  'use strict';
  angular.module('neograph.node.properties.directive', [])
    .directive('nodeProperties', directive);

    function directive() {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditPropertiesCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-show="!vm.editing" tfade ng-include="\'app/node/properties/node.properties.html\'"></div>
          <div ng-show="vm.editing" tfade ng-include="\'app/node/properties/node.edit.properties.html\'"></div>
        </div>
        `,
        restrict: 'E'
      };
  }

})();
