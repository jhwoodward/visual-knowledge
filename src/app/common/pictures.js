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
        append: '=',
        onSelected: '&?',
        imageWidth: '=?'
      },
      link: linkFn
    };

    function linkFn(scope, element) {

      scope.imageWidth = scope.imageWidth || 236;

      scope.items = [];
      scope.onImageLoaded = onImageLoaded;

      $($window).on('resize', _.debounce(applyMasonry));

      var listContainer = $(element).find('ul');

      scope.$watch('pictures', function (pictures) {
        scope.items = pictures.map(function(p){ p.image.loaded = false; return p;});
        applyMasonry();
      });

      function addPictures(pictures) {
        pictures.forEach(function(p){
          p.image.loaded = false;
          scope.items.push(p);
        });
      }

      scope.$watch('append', function (pictures) {
        if (pictures && pictures.length) {
          addPictures(pictures);
          applyMasonry();
        }
      });

      function applyMasonry() {
        $timeout(function() {
          if (listContainer.hasClass('masonry')) {
            listContainer.masonry('reload');
          }
          else {
            listContainer.masonry({
              nodeselector: 'li'
            });
          }
        });
      }

      function onImageLoaded(picture) {
        picture.image.loaded = true;
      }

      scope.$watch('selected', function (selectedIndices) { // NB selected is now an array of node indexes
        if (selectedIndices && selectedIndices.length === 1) {
          var selectedPicture = scope.items[selectedIndices[0]];
          scope.onSelected({picture: selectedPicture});
        }
      });


    }
  }

})();