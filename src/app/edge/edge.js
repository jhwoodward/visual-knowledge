angular.module('neograph.edge',['neograph.neo', 'neograph.utils','ui.router'])
    .config(function($stateProvider){
         $stateProvider.state('admin.main.edge',{
            url:'/edge/:edge',
            //abstract:true,
            views:{
                    'edgeHeader@admin':{
                        controller:function ($scope,$stateParams) {
                            if ($stateParams.edge){
                                $scope.edge=JSON.parse($stateParams.edge);
                            }
                        },
                        templateUrl:'app/edge/edge.header.html'
                    }
                    ,
                      'edge@admin':{
                        controller:function($scope){
                             $scope.tabs = ["Properties"];
                             $scope.selectedTab = "Properties";
                             $scope.selectTab = function (tab) {
                                    $scope.selectedTab = tab;
                                }
                        }
                        ,
                        templateUrl:'app/edge/edge.html'
                    }
            }
            
        })
        .state('admin.main.edge.view',{
            url:'/view',
            views:{
                     'properties@admin.main.edge':{
                        templateUrl:'app/edge/properties.html',
                        controller:function ($scope,$stateParams) {
                            if ($stateParams.edge){
                                $scope.edge=JSON.parse($stateParams.edge);
                            }
                        }
                    }
            }
            
        })
        .state('admin.main.edge.edit',{
            url:'/edit',
            views:{
          
                    'editproperties@admin.main.edge':{
                       templateUrl:'app/edge/properties.edit.html',
                       controller:'EditEdgeCtrl'
                    }
                    
            }
            
        });
      
    })

    .controller('EditEdgeCtrl', function (neo, utils,$stateParams,$scope) {
   
            
           if ($stateParams.edge){
                $scope.edge=JSON.parse($stateParams.edge);
                $scope.predicateType = utils.predicates[$scope.edge.type];
           }

           $scope.$watch("predicateType", function (predicateType) {
               if (predicateType) {
                   $scope.edge.type = predicateType.Lookup;
               }
           });

           $scope.deleteEdge = function (e) {

               neo.deleteEdge(e,
                           $scope.activeView.data.nodes[e.startNode],
                           $scope.activeView.data.nodes[e.endNode])
                   .then(function () {


                       //let view handle its own data ?
                       delete $scope.activeView.data.edges[e.id];
                       if ($scope.selection.selectedEdge && $scope.selection.selectedEdge.id === e.id) {
                           $scope.selection.selectedEdge = null;
                       }

                       $scope.publish("deleted", { selection: { edges: [e] } });

                   });

           }

           $scope.saveEdge = function (e) {

               neo.saveEdge(e)
               .then(
                   function (g) {

                       $scope.publish("dataUpdate", g)

                       //update cache
                       for (key in g.nodes) {
                           $scope.activeView.data.nodes[key] = g.nodes[key];
                       }

                       for (key in g.edges) {
                           $scope.activeView.data.edges[key] = g.edges[key];

                           if ($scope.selection.selectedEdge && (key === $scope.selection.selectedEdge.id || !$scope.selection.selectedEdge.id)) {
                               $scope.selection.selectedEdge = g.edges[key];
                           }

                       }
                   });
           }

});
    
