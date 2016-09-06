(function() {
  'use strict';

  angular.module('neograph.node.properties', ['neograph.node.service', 'neograph.session', 'neograph.utils'])
      .controller('EditPropertiesCtrl', controller);

  function controller(nodeService, session, utils, $scope, $stateParams) {
    if ($stateParams.node) {
      nodeService.get($stateParams.node, true).then(node => {
        $scope.node = node;
      });
    }

    $scope.deleteNode = n => {
      nodeService.delete(n)
        .then(deleted => {
          $scope.selection.selectedNode = deleted;
          // this assumes that the current view is not of deleted items, otherwise this would be inconsistent
          // let view handle its own data ?
          delete $scope.activeView.data.nodes[n.id];
          $scope.publish('deleted', { selection: { nodes: [n] } });
        });
    };

    $scope.destroyNode = n => {
      nodeService.destroy(n)
        .then(deleted => {
          $scope.selection.selectedNode = undefined;
          // this assumes that the current view is not of deleted items, otherwise this would be inconsistent
          // let view handle its own data ?
          delete $scope.activeView.data.nodes[n.id];
          $scope.publish('deleted', { selection: { nodes: [n] } });
        });

    };

    $scope.saveNode = n => {
      nodeService.save(n, session.user)
        .then(node => {
          $scope.node = node;
          var newData = {};
          newData[node.id] = node;
          $scope.publish('dataUpdate', newData);
          // if type, refresh types
          if (node.class == 'Type') {
            utils.refreshTypes();
          }
          $(node.temp.links).each((i, e) => { e.editing = undefined; });
        });
    };

    $scope.restoreNode = n => {
      nodeService.restore(n)
        .then(node => {
          $scope.node = node;
          var newData = {};
          newData[node.id] = node;
          $scope.publish('dataUpdate', newData);
      });
    };

    // tie label value to lookup if empty or the same already
    $scope.$watch('node.lookup', function (lookup, beforechange) {
      if (lookup) {
        if ($scope.node.label != undefined && $scope.node.label.trim() == '' || $scope.node.label == beforechange) {
          $scope.node.label = lookup;

        }
      }
    });

    $scope.nodeTypes = [];
    $scope.$watchCollection('node.labels', labels => {
      if (labels) {
        const selectedTypes = [];
        angular.forEach($scope.node.labels, function (l) {
          if (utils.types[l]) {
            selectedTypes.push({ lookup: l, class: 'Type' });
          }
        });
        $scope.nodeTypes = selectedTypes;
        if (!$scope.node.class && $scope.nodeTypes.length === 1) {
          $scope.node.class = $scope.nodeTypes[0].lookup; // for types the lookup will always be the label
        }
      }
    });

    // Can be called from clicking label,
    // in which case item is text value,
    // or from the typeahead in which case it is an object with Lookup property
    $scope.setType = item => {
      if (utils.isType(item.label)) {
        $scope.node.class = item.label;
      }
    };

    $scope.$watch('newPredicate', v => {
      if (v) {
        $scope.addRelationship({ lookup: v.toUpperCase().replace(/ /g, '_') });
      }
    });

    $scope.addRelationship = item => {
      const p = predicateFactory.create({ lookup: item.lookup, direction: 'out' });// currently no way to select 'in' relationships
      $scope.node.relationships = $scope.node.relationships || {};
      if (!$scope.node.relationships[p.toString()]) {
        $scope.node.relationships[p.toString()] = { predicate: p, items: [] };
      }
    };
  }
})();
