(function() {
    'use strict';
  angular.module('neograph.node.multiple', ['neograph.neo', 'neograph.utils'])
      .directive('multiple', ['neo', 'utils', function (neo, utils) {
        return {
          restrict: 'E',
          templateUrl: 'app/node/multiple/node.multiple.html',
          scope: {
            nodes: '='
          },
          link: function ($scope) {

            $scope.$watch('nodes', function (nodes) {

              if (nodes) {
                var allLabels = nodes.map(function (node) {
                  return node.labels;
                });

                $scope.labels = allLabels.shift().filter(function (v) {
                  return allLabels.every(function (a) {
                    return a.indexOf(v) !== -1;
                  });
                });

                $scope.originalLabels = angular.copy($scope.labels);// store for saving so we know what to change

              }

            });

            $scope.addLabel = function (item) {

              if ($scope.labels.indexOf(item.Label) === -1) {
                $scope.labels.push(item.Label);
              }
            };
            $scope.removeLabel = function (label) {

              var ind = $scope.labels.indexOf(label);
              if (ind > -1) {
                $scope.labels.splice(ind, 1);
              }

            };

            $scope.save = function () {
              neo.saveMultiple({
                nodes: $scope.nodes,
                labels: $scope.labels,
                originalLabels: $scope.originalLabels
              });
            };

            $scope.restore = function () {
              var restored = [];
              angular.forEach($scope.nodes, function (node) {
                neo.restoreNode(node).then(function () {
                  restored.push(node);
                  if (restored.length === $scope.nodes.length) {
                    $scope.publish('restored', { selection: { nodes: restored } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };

            $scope.delete = function () {
              var deleted = [];
              angular.forEach($scope.nodes, function (node) {
                neo.deleteNode(node).then(function () {
                  deleted.push(node);
                  if (deleted.length === $scope.nodes.length) {
                    $scope.publish('deleted', { selection: { nodes: deleted } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };

            $scope.destroy = function () {
              var deleted = [];
              angular.forEach($scope.nodes, function (node) {
                neo.destroyNode(node).then(function () {
                  deleted.push(node);
                  if (deleted.length === $scope.nodes.length) {
                    $scope.publish('deleted', { selection: { nodes: deleted } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };


              // $scope.selection.multiple = new (function (nodes, labels) {
              //    var self = this;
              //    this.nodes = nodes;
              //    this.labels = labels;





              // })(params.selection.nodes, labels);

          }
        };
      }]);
})();
