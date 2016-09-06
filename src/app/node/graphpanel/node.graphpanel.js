angular.module('neograph.node.graphpanel', ['neograph.neo', 'neograph.utils'])
    .directive('nodegraphpanel', ['neo', 'utils', function (neo, utils) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/node/graphpanel/node.graphpanel.html',
        scope: {
          node: '='
                , active: '='
                , window: '=?'
                , width: '=?'
                , height: '=?'
        },
        link: function ($scope, $element, $attrs) {




          var network;

          var graph = {
            nodes: new vis.DataSet(),
            edges: new vis.DataSet()
          };

          $scope.view = utils.newView('NodeGraph', 'NodeGraph');

          $scope.view.queryGenerator = {
            type: 'nodeGraph',
            options: { node: $scope.node }
          };

          $scope.$watch('node', function (n) {
            $scope.view.queryGenerator.options = { node: n };
          });

          $scope.w = 200;
          $scope.h = 200;

          $scope.$watch('active', function (active) {
            if (active && !network) {


              if ($scope.width && $scope.height) {
                $scope.w = $scope.width;
                $scope.h = $scope.height;


              }
              else if ($scope.window) {
                $scope.w = $scope.window.width;
                $scope.h = $scope.window.height - 170;
              }


              network = new vis.Network($element.find('.graphContainer')[0], graph, utils.graphOptions);
              network.setSize(($scope.w) + 'px', ($scope.h) + 'px');
                        // fit to screen on resize
              network.on('resize', function (params) {
                network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
              });


                    // network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
            }
          });




          $scope.$watch('view.data', function (data) {
            if ($scope.active) {
              console.log('drawing new graph');
              graph.nodes.clear();
              graph.edges.clear();
              var gArr = utils.toGraphData(data);
              graph.nodes.add(gArr.nodes);
              graph.edges.add(gArr.edges);
            }

          });


          $scope.$watch('window', function (w) {

            if (network && w) {
              network.setSize(($scope.window.width) + 'px', ($scope.window.height - 170) + 'px');
              network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
            }


          });


          $scope.$watch('width', function () {

            if (network) {
              network.setSize(($scope.width) + 'px', ($scope.height - 170) + 'px');
              network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
            }


          });
          $scope.$watch('height', function () {

            if (network) {
              network.setSize(($scope.width) + 'px', ($scope.height - 170) + 'px');
              network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
            }


          });



        }
      };
    }]);
