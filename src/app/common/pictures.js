(function(){
angular.module('neograph.common.pictures',[])
  .directive('pictures', directive);

  function directive($timeout, $window, _) {
    return {
      replace: true,
      restrict: 'EA',
      templateUrl: 'app/common/pictures.html',
      scope: {
        pictures: '=', // must be an array to preserve sort order
        active: '=',
        onSelected: '&?',
        imageWidth: '=?'
      },
      link: linkFn
    };

    function linkFn(scope, element) {

      scope.imageWidth = scope.imageWidth || 236;

      $($window).on('resize', _.debounce(applyMasonry));

      var listContainer = $(element).find('ul');

      scope.$watch('pictures', function (pictures) {
        listContainer.removeClass('masonryLoaded');
        $timeout(applyMasonry, 100);
      });

      scope.$watch('updatemasonry', function () {
        if (listContainer.hasClass('masonry')) {
          listContainer.masonry('reload');
        }
      });

      scope.$watch('active', function(isActive) {
        if (isActive) {
          $timeout(applyMasonry, 100);
        }
      });

      function applyMasonry() {
        if (listContainer.hasClass('masonry')) {
          listContainer.masonry('reload');
        }
        else {
          listContainer.masonry({
            nodeselector: 'li'
          });
        }
        listContainer.addClass('masonryLoaded');
      }
    

      scope.$watch('selected', function (selectedIndices) { // NB selected is now an array of node indexes
        if (selectedIndices && selectedIndices.length === 1) {
          var selectedPicture = scope.pictures[selectedIndices[0]];
          scope.onSelected({picture: selectedPicture});
        }
      });
    }
  }

})();