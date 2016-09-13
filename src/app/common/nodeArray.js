angular.module('neograph.common.nodeArray', ['neograph.utils'])
    .directive('nodeArray', ['utils', function (utils) {
      return {
        replace: true,
        restrict: 'EA',
        templateUrl: 'app/common/nodeArray.html',
        scope: {
          items: '=',// an array of string or  items with label property
          enabled: '=',
          onselected: '&?',
          node: '=?',
          directbinding: '@?',// set this to false if passing in array of strings
          width: '@?'
        },
        link: function (scope, $element, $attrs) {

          var directBinding = $attrs['directbinding'] == 'false' ? false : true;
          scope.nodes = [];
          scope.$watch('items', onItemsChanged);
          $element.on('click', focusInput);
          scope.clickable = $attrs['onselected'] != undefined;
          scope.removeNode = removeNode;
          scope.addNode = addNode;
          scope.nodeClicked = onNodeClicked;
          scope.getClass = function (node) {
            return utils.getLabelClass(scope.node, node.label);
          };
          
          function focusInput() {
            $element.find('input').focus();
          }

          function onItemsChanged(items) {
            if (items && items.length) {
              if (items[0] && (items[0].label || items[0].lookup)) {
                scope.nodes = items;
              } else {
                directBinding = false;
                scope.nodes = items.map(function (e) { return { label: e }; });
              }
            } else {
              if (directBinding) {
                scope.nodes = items;
              } else {
                scope.nodes = [];
              }
            }
          }

          function onNodeClicked(node) {
            if ($attrs['onselected']) {
              scope.onselected({ item: node });
            }
          };

          function indexOf(node) {
            var ind = -1;
            $(scope.nodes).each(function (i, e) {
              if ((node.label && e.label === node.label) || node.lookup && e.lookup == node.lookup) {
                ind = i;
                return;
              }
            });
            return ind;
          };

          function addNode(node) {
               console.log(scope.nodes);
            if (indexOf(node) == -1) {
              scope.nodes.push(node);
              console.log(scope.nodes);
              if (!directBinding) {
                scope.items.push(node.label);
              }
            }
            // else highlight the node momentarily
          }

          function removeNode(node) {
            var ind = indexOf(node);
            if (ind > -1) {
              scope.nodes.splice(ind, 1);
              if (!directBinding) {
                scope.items.splice(scope.items.indexOf(node.label || node.lookup), 1);
              }
            }
          }
        }
      };
    }]);
