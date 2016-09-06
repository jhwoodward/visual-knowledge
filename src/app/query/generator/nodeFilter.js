angular.module('neograph.query.generator.nodeFilter', ['neograph.neo'])
    .directive('nodeFilter', neo => ({
      restrict: 'E',
      templateUrl: 'app/query/generator/nodeFilter.html',
      scope: {
        options: '=',
        generated: '=',
        nodechanged: '&?'
      },
      link: ($scope) => {
        $scope.filters = [];
        $scope.node = {};
        let labels = [];

        const getFilters = () => {
          if (labels && labels.length) {
            neo.getDistinctLabels(labels).
                then(l => {
                  // Remove filter for this node as it is duplicating
                  labels.forEach(lab => { l.splice(lab.indexOf(l), 1); });
                  $scope.filters = l;
                });
          }
        };

        const load = () => {
          if ($scope.node) {
            labels = [$scope.node.label, 'Picture'];
            getFilters();
            $scope.enabledFilters = [];
            $scope.process();
          }
        };

        $scope.$watch('options', options => {
          $scope.node = options.node;
        });

        $scope.$watch('node', node => {
          if ($scope.nodechanged) {
            $scope.nodechanged({ node });
          }
          load();
        });

        $scope.openNode = () => {
          if ($scope.node) {
            $scope.publish('selected', { selection:{ nodes:[$scope.node] } });
          }
        };

        $scope.process = labs => {
          if ($scope.node) {
            if (!labs || !labs.length) {
              labs = labels;
            } else {
              labs = labs.concat(labels);
            }
            $scope.generated = `
              match (a:${labs.join(':')}) return a 
              order by a.Status desc limit 500
              `;
            if (labs != labels) {
              neo.getDistinctLabels(labs).
                  then(l => { $scope.enabledFilters = l; });
            } else {
              $scope.enabledFilters = [];
            }
          }
        };
      }
    })
);
