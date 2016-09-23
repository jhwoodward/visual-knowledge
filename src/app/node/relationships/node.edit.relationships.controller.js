(function() {
  'use strict';
    
  angular.module('neograph.node.edit.relationships.controller', [])
    .controller('EditRelationshipsCtrl', controller);

  function controller($scope, predicateFactory) {
    var vm = this;
    vm.node = {};

    vm.nodeTypes = [];

    $scope.$watch('newPredicate', function(predicate) {
      if (predicate) {
        addRelationship({ lookup: predicate.toUpperCase().replace(/ /g, '_') });
      }
    });

    function addRelationship(item) {
      var p = predicateFactory.create({ lookup: item.lookup, direction: 'out' });// currently no way to select 'in' relationships
      vm.node.relationships = vm.node.relationships || {};
      if (!vm.node.relationships[p.toString()]) {
        vm.node.relationships[p.toString()] = { predicate: p, items: [] };
      }
    }
  }

})();
