(function() {
  'use strict';

  angular.module('neograph.node.edit.properties.controller', [])
    .controller('EditPropertiesCtrl', controller);

  function controller(utils, $scope, nodeManager) {

    var vm = this;
    vm.node = {};

    /*
    nodeManager.subscribe('loaded', function(state) {
      vm.node = state.node;
    });
    */

    vm.nodeTypes = [];
    // Can be called from clicking label,
    // in which case item is text value,
    // or from the typeahead in which case it is an object with Lookup property
    vm.setType = setType;

    // tie label value to lookup if empty or the same already
    $scope.$watch('vm.node.lookup', syncLabelWithLookupIfSame);
    $scope.$watchCollection('vm.node.labels', onNodeLabelsChanged);

    function syncLabelWithLookupIfSame(lookup, beforechange) {
      if (lookup) {
        if (vm.node.label != undefined && 
          vm.node.label.trim() == '' || vm.node.label == beforechange) {
          vm.node.label = lookup;
        }
      }
    }
  
    function onNodeLabelsChanged(labels) {
      if (labels) {
        var selectedTypes = [];
        angular.forEach(vm.node.labels, function (l) {
          if (utils.types[l]) {
            selectedTypes.push(utils.types[l]);
          }
        });
      }
    }

    function setType(type) {
      vm.node.type = type;
    };

  }
})();
