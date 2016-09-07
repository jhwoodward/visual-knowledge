angular.module('neograph.common.nodeArray', ['neograph.utils'])
    .directive('nodeArray', ['utils', function (utils) {
      return {
        replace: true,
        restrict: 'EA',
        templateUrl: 'app/common/nodeArray.html',
        scope: {

          items: '='// an array of string or  items with label property
            ,
          enabled: '='
            ,
          onselected: '&?'
            ,
          node: '=?'
            ,
          directbinding: '@?'// set this to false if passing in array of strings
            ,
          width: '@?'

        },
        link: function ($scope, $element, $attrs) {

          var directBinding = $attrs['directbinding'] == 'false' ? false : true;

          $scope.nodes = [];

          $scope.$watch('items', function (items) {

            if (items && items.length) {

              if (items[0] && (items[0].label || items[0].lookup)) {

                $scope.nodes = items;

              }
              else {
                directBinding = false;
                $scope.nodes = items.map(function (e) { return { label: e }; });


              }

            }
            else {
              if (directBinding) {
                $scope.nodes = items;
              }
              else {
                $scope.nodes = [];
              }

            }
          });

          $($element).on('click', function () {
            $($element).find('input').focus();
          });

          $scope.getClass = function (node) {
            return utils.getLabelClass($scope.node, node.label);
          };

          $scope.clickable = $attrs['onselected'] != undefined;

          $scope.nodeClicked = function (node) {

            if ($attrs['onselected']) {

              $scope.onselected({ item: node });

            }
          };

          var indexOf = function (node) {

            var ind = -1;

            $($scope.nodes).each(function (i, e) {

              if ((node.label && e.label === node.label) || node.lookup && e.lookup == node.lookup) {
                ind = i;
                return;
              }
            });

            return ind;

          };

          $scope.addNode = function (node) {

            if (indexOf(node) == -1) {

              $scope.nodes.push(node);

              if (!directBinding) {

                $scope.items.push(node.label);

              }

            }


                // else highlight the node momentarily


          };

          $scope.removeNode = function (node) {

            var ind = indexOf(node);

            if (ind > -1) {
              $scope.nodes.splice(ind, 1);

              if (!directBinding) {
                $scope.items.splice($scope.items.indexOf(node.label || node.lookup), 1);
              }

            }

          };


        }
      };
    }]);
