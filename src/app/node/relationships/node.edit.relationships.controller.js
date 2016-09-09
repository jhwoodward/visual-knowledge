(function() {
  'use strict';
    
  angular.module('neograph.node.relationships.edit.controller', [])
    .controller('EditRelationshipsCtrl', controller);

  function controller($scope, predicateFactory) {
    var vm = this;
    vm.node = {};
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

    vm.nodeTypes = [];

    $scope.$watch('vm.node', function(node) {
      if (node) {
        node.labelled = node.labelled || [];
        $('.labelEdit input').val('');
        vm.deleted = node.labels.indexOf('Deleted') > -1;
      }
    });

    $scope.$watch('newPredicate', function(v) {
      if (v) {
        addRelationship({ lookup: v.toUpperCase().replace(/ /g, '_') });
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
