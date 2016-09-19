(function(){

  angular.module('neograph.common.scrollBottom', [])
    .directive('scrollBottom', function () {
      return {
        restrict: 'EA',
        scope: {
          scrollBottom: '&'
        },
        link: function (scope, element, attrs) {

          var offset = 70;
          element.on('scroll', function() {
            if(element.scrollTop() + element.innerHeight() >= element[0].scrollHeight - offset) {
                scope.scrollBottom();
            }
          });
        
        }
      };
    });

})();
