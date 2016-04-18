angular.module('neograph.query',['neograph.utils','neograph.queryDirective'])
    .factory('viewService',function(utils){
        
        var views = {};

        var newView = function (key, type) {
            var view = utils.newView(key, type);
            view.key = key;
            views[key] = view;
            return view;
        }

        var graphView = newView('Graph', 'Graph');
        var defaultImageView = newView('Grid', 'Grid');
        
        var activeView = defaultImageView;
        
        var cloneView = function () {
            views[$scope.views[activeView].queryGenerators.nodeFilter.options.node.Lookup] = angular.copy(views[activeView]);
        }
        
        var listeners = [];
        
        
        function publishViewChange(){
            
            for (var i =0;i<listeners.length;i++){
                listeners[i](activeView);
            }
        }
        
        
        return {
            views:views,
            activeView:activeView,
            updateView:function(key){
                activeView = views[key];
                publishViewChange();
            }
            ,
            subscribe:function(callback){
                listeners.push(callback);
            }
        }
        
    })
    .controller('QueryCtrl',function($scope,viewService,$stateParams){
        
        console.log($stateParams);
        
        //todo - should be per view
        if ($stateParams.querypreset){
            $scope.defaultpreset = $stateParams.querypreset;
        }
        
        viewService.subscribe(function(activeView){
            $scope.activeView = activeView;
        })
        
        $scope.views = viewService.views;
        $scope.activeView = viewService.activeView;

        
    })
    .controller('QueryResultsCtrl',function($scope,viewService){
        
        viewService.subscribe(function(activeView){
            $scope.activeView = activeView;
        })
        
        $scope.views = viewService.views;
        $scope.activeView = viewService.activeView;
        
        $scope.selectedTab = $scope.activeView.key;

        $scope.$watch('selectedTab',function(key){
            viewService.updateView(key);
        });
        
       
/*
        $scope.$watch('activeView', function (view) {
            $scope.activeViewKey = view.key;
       //     shouldEnabledAddToGraph();
        });

        $scope.$watch('activeViewKey', function (key) {
            $scope.activeView = $scope.views[key];
        });
        
        */
        /*
        $scope.subscribe("query", function (query) {

            if (query && (query.q || query.queryGenerator)) {

                if (!query.view) {
                    query.view = query.type;
                }

                var view = $scope.views[query.view];

                if (view) {
                    //reset name incase it changed due to node filter
                    view.name = query.view;
                }
                else {

                    view = newView(query.view, query.type);//view = view key, type = "Graph" or "Grid"
                }

                if (query.queryGenerator) {
                    var qg = view.queryGenerators[query.queryGenerator.id];
                    qg.options = query.queryGenerator.options;
                    view.queryGenerator = qg;

                }
                else {
                    view.query = query;
                }

                $scope.activeView = view;

            }

        });

*/
        
        
    });
    