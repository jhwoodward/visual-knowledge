angular.module('neograph.common.typeaheadSimple',[])
.directive('typeaheadSimple', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=?',   //the choice should be an object for 2 way binding with Lookup property
            source: '='
        },
        template: '<input type="text" />',
        link: function ($scope, element, attrs) {

            var placeholderDefault = "";

            var $input = $(element);//.find('input');
            $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);


            $input.typeahead({
                source: $scope.source,
                updater: function (item) {


                    $scope.$apply(function () {


                        $scope.ngModel = item;


                    });



                    return item;


                }
            });






        }
    };
}]);
