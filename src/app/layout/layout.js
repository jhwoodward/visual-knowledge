angular.module('neograph.layout',[])
.directive('tabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            tabs:'=',//required to remove panes no longer available
            selected: '=?'
        },
        controller: function ($scope) {
            var panes = $scope.panes = [];
            var self = this;

            $scope.select = function (pane) {
                angular.forEach(panes, function (pane) {
                    pane.selected = false;
                });
                pane.selected = true;
                $scope.selected = pane.key;
            };

            this.add = function (pane) {
                if (panes.length === 0) {
                    $scope.select(pane);
                }
                panes.push(pane);
            };

            this.remove = function (pane) {
                //console.log('remove')
                //console.log(pane);
                angular.forEach(panes, function (p, i) {
                    if (pane.key == p.key) {
                        panes.splice(i, 1);
                        if (pane.selected) {
                            pane.selected = false;
                            $scope.select($scope.panes[0]);
                        }


                    }
                });

            }

            $scope.$watch('selected', function (key) {//the title of the selected pane
               
                if (key) {
                    angular.forEach(panes, function (pane) {
                       
                        pane.selected = pane.key === key;
                    });
                }

            });


            //remove tabs not in list (child pane only adds them)
            $scope.$watch('tabs', function (tabs) {//the title of the selected pane

                if (tabs) {
                    angular.forEach(panes, function (pane) {

                        if (tabs.indexOf(pane.key) === -1) {

                            self.remove(pane);
                        }
                    });
                }

            });


        },
        templateUrl: 'app/layout/tabs.html'
    };
})
.directive('tabPane', function () {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: {
            key:'@',
            title: '=',
            visible: '=',
            active: '=?',
            window:'='
        },
        link: function ($scope, element, attrs, tabsCtrl) {


               tabsCtrl.add($scope);


            //$scope.$watch('visible', function (visible) {

            //    if (visible) {
            //        tabsCtrl.addPane($scope);
            //    }
            //    else {
            //        tabsCtrl.removePane($scope);

            //    }

            //});

         
            $scope.$watch('active', function (active) {//the title of the selected pane

                $scope.selected = active;
             
            });


        },
        templateUrl: 'app/layout/tabPane.html'
    };
})
.directive('noBubble', function () {
    return {

        link: function ($scope, element, attrs, tabsCtrl) {


            
            $(element).on('keydown', function (event) {
  
                event.stopPropagation()
            });

        },
        templateUrl: 'app/layout/tabPane.html'
    };


});