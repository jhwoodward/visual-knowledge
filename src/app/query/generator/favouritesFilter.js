angular.module('neograph.query.generator.favouritesFilter', ['neograph.neo'])
.directive('favouritesFilter', neo => ({
  restrict: 'E',
  templateUrl: 'app/query/generator/favouritesFilter.html',
  scope: {
    options: '=',
    generated: '='
  },
  link: ($scope, $element, $attrs) => {
    $scope.filters = [];
    $scope.node = {};
    let labels = [];
    $scope.$watch('options', function (options) {
      if (options) {
        $scope.node = options.user;
      }
    });

    $scope.$watch('node', function (user) {
      load();
    });

    const load = function () {
      if ($scope.node) {
        labels = [$scope.node.Lookup, 'Favourite'];
        getFilters();
        $scope.enabledFilters = [];
        $scope.process();
      }

    };

    const getFilters = function () {
      if (labels && labels.length) {
        const labelQuery = `match (a:${labels.join(':')}) - [] -> (b) return distinct(LABELS(b))`;
        neo.getDistinctLabelsQuery(labelQuery).
            then(l => {
                // remove filter for this node as it is duplicating
              angular.forEach(labels, function (lab) {
                l.splice($.inArray(lab, l), 1);
              });
              $scope.filters = l;
            });
      }
    };

    $scope.process = labs => {
      if ($scope.node) {
        labs = labs || [];
        let b = 'b';
        if (labs.length) {
          b += `:${labs.join(':')}`;
        }
        const q = `match (a:${labels.join(':')}) - [] -> (${b})`;
        $scope.generated = `${q} return b`;
        if (labs.length) {
          neo.getDistinctLabelsQuery(`${q}  return distinct(LABELS(b))`).
              then(l => { $scope.enabledFilters = l; });
        } else {
          $scope.enabledFilters = [];
        }
      }
    };
  }
})
);
