angular.module('neograph.controller.mob',['neograph.neo','neograph.utils','neograph.session'])
.controller("MobController", ['$scope', '$window', '$document', 'neo', 'utils', 'session', '$routeParams','$location',
 function ($scope, $window, $document, neo, utils, session, routeParams,$location) {
        
        
        $scope.window = {
            tabsWidth: 0,
            topBarHeight: 150
        }
        
        $scope.selection = {
            selectedNode: null,
            selectedEdge: null,
            hoverNode: null
        }
        
        $scope.tabs = [];
        
        $scope.selectTab = function (tab) {
            $scope.selectedTab = tab;
            utils.selectedTab = tab;
        }
        
        if (routeParams.label) {
            
            //load full node including labels and relationships
            neo.getNodeByLabel(routeParams.label, true)
            .then(function (node) {
                $scope.selection.selectedNode = node;
                $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                setTab();
            });

        }
        
        if (routeParams.pictureid) {
            
           // utils.selectedTab = "Images";
            
            //load full node including labels and relationships
            neo.getNode(routeParams.pictureid, true)
            .then(function (node) {
                $scope.selection.selectedNode = node;
                $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                setTab();
            });


        }
        
        
        $scope.$watch('nodeLookup', function (n) {
            
            if (n && n.id) {

                $location.path('/label/'+n.Label)
                
                ////load full node including labels and relationships
                //neo.getNode(n.id, true)
                //.then(function (node) {
                //    $scope.selection.selectedNode = node;
                //    $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                //    setTab();
                //});
            }
        });
        
        
        
        var setTab = function () {

            if ($scope.tabs.indexOf(utils.selectedTab) > -1) {
                $scope.selectTab(utils.selectedTab);
            }
            else {
                $scope.selectTab($scope.tabs[0]);
            }


        }
        
        
        $scope.tabSettings = utils.tabSettings;
        
        $scope.$watch('tabs', function (tabs) {
            $(tabs).each(function (i, tab) {
                
                if (utils.tabSettings[tab] === undefined) {
                    utils.tabSettings[tab] = {
                        'editable': false
                    }
                }
            })
        });
        
        
        
        $scope.toggleEditSelectedTab = function () {
            
            utils.tabSettings[$scope.selectedTab].editable = !$scope.tabSettings[$scope.selectedTab].editable;
        }
        
        //update tabs & properties if labels change
        var settingPropsAndTabs = false;
        
        //how can i stop this firing for newly loaded nodes ?
        $scope.$watchCollection('selection.selectedNode.labels', function (labels) {
            
            if (labels && labels.length && !settingPropsAndTabs) {
                
                settingPropsAndTabs = true;

                neo.getProps(labels).then(function (out) {

                    $scope.selection.selectedNode = $.extend(null, out.properties, $scope.selection.selectedNode);
                    $scope.selection.selectedNode.temp.tabs = out.tabs;
                    $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                    if (session.user.favourites[$scope.selection.selectedNode.id]) {
                        $scope.tabs.push("Favourite");
                    }
                    settingPropsAndTabs = false;

                })


            }

        });
        
        
        $scope.newNode = function () {
            
            var newNode = {
                id: -1,
                labels: [],
                Type: "",
                temp: {
                    tabs: ["Properties"]
                }
            }
            
            if ($scope.nodeLookupText && (!$scope.selection.selectedNode || $scope.nodeLookupText != $scope.selection.selectedNode.Lookup)) {
                newNode.Lookup = $scope.nodeLookupText;
            }
            
            $scope.selection.selectedNode = newNode;
            $scope.tabs = $scope.selection.selectedNode.temp.tabs;
            
            $scope.selectedTab = 'Properties';


        }



    }]);



