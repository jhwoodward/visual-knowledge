(function() {
  'use strict';

  angular.module('neograph.node.properties.edit.controller', ['neograph.node.service', 'neograph.session', 'neograph.utils', 'ui.router'])
    .controller('EditPropertiesCtrl', controller);

  function controller(nodeService, session, utils, $scope, $stateParams) {

    var vm = this;
    vm.node = {};
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

    vm.nodeTypes = [];
    // Can be called from clicking label,
    // in which case item is text value,
    // or from the typeahead in which case it is an object with Lookup property
    vm.setType = setType;

    // tie label value to lookup if empty or the same already
    $scope.$watch('vm.node.lookup', onNodeLookupChanged);
    $scope.$watchCollection('vm.node.labels', onNodeLabelsChanged);

    function onNodeLookupChanged(lookup, beforechange) {
      if (lookup) {
        if (vm.node.label != undefined && 
          vm.node.label.trim() == '' || vm.node.label == beforechange) {
          vm.node.label = lookup;
        }
      }
    }
  
    function onNodeLabelsChanged(labels) {
      if (labels) {
        const selectedTypes = [];
        angular.forEach(vm.node.labels, function (l) {
          if (utils.types[l]) {
            selectedTypes.push({ lookup: l, class: 'Type' });
          }
        });
        vm.nodeTypes = selectedTypes;
        if (!vm.node.class && vm.nodeTypes.length === 1) {
          vm.node.class = vm.nodeTypes[0].lookup; // for types the lookup will always be the label
        }
      }
    }

    function setType(item) {
      if (utils.isType(item.label)) {
        $scope.node.class = item.label;
      }
    };

  }
})();
