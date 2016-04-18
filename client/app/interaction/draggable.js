angular.module('neograph.interaction.draggable',[])
    .directive('draggable', function () {
    return {

        link: function ($scope, element, attrs) {
          
            var initLeft = $(element).position().left;

            $(element).draggable({ 
                axis: "x" ,  
                drag: function() {
                
                    var change = initLeft - $(element).position().left;
                  
                    $scope.$apply(function () {
                        $scope.window.tabsWidth = $scope.window.tabsWidth + change;
                    });
                   

                    initLeft = $(element).position().left;

                    }
            });
        }
    };
});
