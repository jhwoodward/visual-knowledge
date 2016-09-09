(function() {
  'use strict';

  angular.module('neograph.node.edit.references.controller', [])
    .controller('EditReferencesCtrl', controller);

  function controller($scope) {

    var vm = this;
    vm.node = {};
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

  }
})();
