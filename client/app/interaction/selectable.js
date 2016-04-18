angular.module('neograph.interaction.selectable',[])
.directive('selectable', function () {
    return {
        scope: {
            selected: '='

        },
        link: function ($scope, element, attrs) {

            $scope.$watch($(element).find("li.ui-selected").length, function (i) {






                $(element).selectable({
                    filter: "li",
                    stop: function (event, ui) {


                        var selected = [];


                        $(element).find("li.ui-selected").each(function (i, e) {
                            selected.push(parseInt($(e).attr("nodeindex")));
                        });

                        $scope.$apply(function () {

                            $scope.selected = selected;

                        });

                    }
                    ,
                    cancel: '.badge, .label'



                });


            });


        }
    }
});





