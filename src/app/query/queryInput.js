angular.module('neograph.queryInput',
['neograph.neo', 'neograph.query.presets', 'neograph.query.generator'])
.directive('queryinput', (neo, queryPresets) =>
  ({
    replace: true,
    restrict: 'E',
    templateUrl: 'app/query/queryInput.html',
    scope: {
      query: '=',
      editable: '=?',
      defaultpreset: '=?'
    },
    link: $scope => {
      $scope.$watch('preset', preset => {
        if (preset) {
          $scope.query.body = preset;
        }
      });

      if ($scope.defaultpreset) {
        $scope.preset = queryPresets[$scope.defaultpreset];
      }

      $scope.$watch('query.body', (body) => {
        if (body && body.q) {
          $scope.getData();
        }
      });

      $scope.generated = { q: '' };
      $scope.$watch('generated', (generated) => {
        if (generated) {
          $scope.query.body = generated;
        }
      });

      $scope.nodeChanged = (node) => {
        if (node) {
          $scope.query.name = node.Label || node.Lookup;
        }
      };

      $scope.connectAll = () => neo.getAllRelationships($scope.query.data.nodes)
                    .then(g => {
                      // Add to cached data
                      Object.assign($scope.query.data.edges, g.edges);
                      $scope.publish('dataUpdate', g);
                    });


      $scope.getData = () => {
        const body = $scope.query.body;
        if (body && body.q) {
        // If grid query then return results as array to preserve sort order
          const returnArray = $scope.query.type === 'Grid';
          neo.getGraph(body.q, returnArray).
            then(g => {
              if (body.connectAll) {
                neo.getAllRelationships(g.nodes).
                  then(g2 => Object.assign(g.edges, g2.edges));
              } else {
                $scope.query.data = g;
              }
            });
        }
      };
    }
  })
);
