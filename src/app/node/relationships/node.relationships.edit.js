angular.module('neograph.node.relationships', ['neograph.node.service', 'neograph.session', 'neograph.utils', 'neograph.models.predicate'])
    .controller('EditRelationshipsCtrl', (nodeService, session, utils, $scope, $stateParams, predicateFactory) => {
      if ($stateParams.node) {
        nodeService.get($stateParams.node, true).then(node => {
          $scope.node = node;
        });
      }

      $scope.$watch('node', node => {
        if (node) {
          node.labelled = node.labelled || [];
          $('.labelEdit input').val('');
          $scope.deleted = node.labels.indexOf('Deleted') > -1;
        }
      });

      $scope.nodeTypes = [];

      $scope.$watch('newPredicate', v => {
        if (v) {
          $scope.addRelationship({ lookup: v.toUpperCase().replace(/ /g, '_') });
        }
      });

      $scope.addRelationship = item => {
        const p = predicateFactory.create({ lookup:item.lookup, direction: 'out' });// currently no way to select 'in' relationships
        $scope.node.relationships = $scope.node.relationships || {};
        if (!$scope.node.relationships[p.toString()]) {
          $scope.node.relationships[p.toString()] = { predicate: p, items: [] };
        }
      };
    });
