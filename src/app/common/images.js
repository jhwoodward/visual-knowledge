angular.module('neograph.common.images', ['neograph.neo', 'neograph.session'])
.directive('images', ['neo', 'session', function (neo) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'app/common/images.html',
    scope: {
      editing: '='
            , nodes: '=' // must be an array to preserve sort order
            , active: '='
            , updatemasonry: '='// required to update masonry on resize

    },
    link: function ($scope, $element, $attrs) {

      var $ul = $($element).find('ul');

      $scope.items = {};

      $scope.$watch('nodes', function (nodes) {
        $ul.removeClass('masonryLoaded');
        $scope.items = nodes;
        applyMasonry();

      });

      $scope.$watch('updatemasonry', function () {
        if ($ul.hasClass('masonry')) {
          $ul.masonry('reload');
        }
      });

      $scope.$watch('active', applyMasonry);

      var applyMasonry = function () {

            //    if ($scope.updatemasonry) {

        setTimeout(function () {

          if ($ul.hasClass('masonry')) {
            $ul.masonry('reload');
          }
          else {
            $ul.masonry({
              nodeselector: 'li'
                                // ,
                                // columnWidth: 1,
                                // "isFitWidth": true
            });
          }

          $ul.addClass('masonryLoaded');


        }, 100);
             //   }
           //     else {
                 //   $ul.addClass('masonryLoaded');
           // /     }
      };

      $scope.navigate = function (label) {
        $scope.publish('query', {
          name: label,
          view: label,
          type: 'Grid',
          queryGenerator: { id: 'nodeFilter', options: { node: { Label: label } } }
        });

      };

      $scope.selectAll = function () {

        if ($ul.find('li.ui-selected').length < $ul.find('li').length) {
          $ul.find('li').addClass('ui-selected');
          $scope.selected = $scope.nodes.map(function (e, i) { return i; });
        }
        else {
          $ul.find('li').removeClass('ui-selected');
          $scope.selected = [];
        }
      };

            // this assumes that we are looking at a view of not deleted items
      $scope.subscribe('deleted', function (params) {

                // alternatively i could have a deep watch on nodearray and update that
        removeItems(params.selection.nodes);
      });

            // this assumes that we are looking at a view of deleted items
      $scope.subscribe('restored', function (params) {

                // alternatively i could have a deep watch on nodearray and update that
        removeItems(params.selection.nodes);
      });


      var removeItems = function (items) {

        if (items && items.length) {
          angular.forEach(items, function (node) {
            var sel = "li[nodeid='" + node.id + "']";
            console.log(sel);
            $ul.find(sel).remove();
          });
          applyMasonry();

        }
      };



      $scope.getFilterClass = function (value) {

        if (value === 1)
          return 'label-success';
        else if (value === 0)
          return 'label-info';
                else return '';
      };

      $scope.toggleFilter = function (label) {
        if ($scope.filters[label] == 1) {
          $scope.filters[label] = 0;
          refreshContent();
        }
        else if ($scope.filters[label] == 0) {
          $scope.filters[label] = 1;
          refreshContent();
        }
                else if ($scope.filters[label] == -1) {
                  for (var f in $scope.filters) {
                    $scope.filters[f] = 0;
                  }

                  $scope.filters[label] = 1;
                  refreshContent();
                }


      };

            // triggered by selecting a filter
      $scope.$watch('filterBy', function (label) {
        if (label) {
          $scope.filters[label] = 1;
          $scope.filterBy = undefined;
          refreshContent();
        }

      });



            // triggered by selecting one or more images
      $scope.$watch('selected', function (selected) { // NB selected is now an array of node indexes

        if (selected && selected.length) {


          var selectedNodes = selected.map(function (i) {
            return $scope.nodes[i];
          });

            // NB if there are multiple instances of the images directive (as typically) it wont be possible ot know which one the event was sent from
                    // but mainly we need to know that it wasnt sent from the graph or controller, as images currently doesnt substribe to selected event
          $scope.publish('selected', { sender: 'Images', selection: { nodes: selectedNodes } });



        }


      });

      $scope.makeFavourite = function (node) {
        console.log(node);
        $scope.publish('favourite', node);

      };


    }
  };
}]);
