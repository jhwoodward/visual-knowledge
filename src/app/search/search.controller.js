(function() {
  'use strict';
    
  angular.module('neograph.search.controller',['neograph.node.service', 'ui.router'])
    .controller('SearchCtrl', controller);

  function controller($scope) {
      var vm = this;
      vm.node = undefined;

      $scope.$watch('vm.node', function (node) {
        vm.onSelected({ node: node });
      });

    }
 
})();