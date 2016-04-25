angular.module("templates",[]);
var app = angular
    .module("Neograph", 
    [
    "templates",
    'publishSubscribe',
    'ui.router',
    'ngSanitize',
    'neograph.common',
    'neograph.edge',
    'neograph.interaction',
    'neograph.layout',
    'neograph.neo',
    'neograph.node',
    'neograph.query'
    ])
    .config( ($stateProvider, $urlRouterProvider)=> {


        $stateProvider
          
            .state('admin',{
                url:'/admin',
                templateUrl:'app/partials/admin.html'
            })
            .state('admin.main',{
                url:'/main?querypreset',
                views:{
                    'nodeSearch@admin':{
                        controller:'NodeSearchCtrl',
                        templateUrl:'app/node/node.search.html'
                    }
                    ,
                    'query@admin':{
                        controller:'QueryCtrl',
                        templateUrl:'app/query/query.html'
                    }
                    
                }

            })
    

        $urlRouterProvider.otherwise("/admin/main");

    })
    .controller("AdminController", ['$scope', 'neo', 'queryPresets', 'utils','session', 
function ($scope,  neo, presets, utils,session) {

    //SWAP ADMIRES FOR INSPIRES
    //MATCH (n)-[r:ADMIRES]->(m) CREATE (m)-[r2:INSPIRES]->(n) SET r2 = r WITH r DELETE r

   
        

    $scope.subscribe("hover", function (node) {

        $scope.selection.hoverNode = node;

    });

   

    //= function () {

    //    var view = newView($scope.selection.selectedNode.Lookup, "Grid");
    //    view.queryGenerators.nodeFilter.options = { node: $scope.selection.selectedNode };
    //    view.queryGenerator = view.queryGenerators.nodeFilter;
    //    $scope.activeViewKey = view.key;

    //}


  





   
 function shouldEnabledAddToGraph() {

        $scope.enableAddToGraph = $scope.selection.selectedNode &&
            $scope.selection.selectedNode.id &&
            $scope.activeView.type == "Graph" &&
            !$scope.activeView.data.nodes[$scope.selection.selectedNode.id];


    }
 

   


    $scope.$watch('selection.selectedEdge', function (edge) {

        if (edge) {
            $scope.selection.selectedNode = undefined;
            $scope.selection.multiple = undefined;
            $scope.selection.images = [];

        }

    });

    $scope.subscribe("favourite", function (node) {

        neo.saveFavourite(node, session.user);

    });

 








    ////published by graph ondelete
    //$scope.subscribe("deleting", function () {

    //    if (confirm("Delete Confirm ? ")) {
    //        //TODO: WHY DOES THIS FIRE 3 TIMES ??
    //        if ($scope.selection.selectedNode) {

    //            $scope.deleteNode($scope.selection.selectedNode);

    //        }
    //        else if ($scope.selection.selectedEdge) {

    //            $scope.deleteEdge($scope.selection.selectedEdge);
    //        }
    //    }

    //})



    //published by graph onconnecting
    //the new edge shows in the properties window and must then be saved 
    $scope.subscribe("newEdge", function (newEdge) {

        $scope.$apply(function () {

            $scope.selection.selectedEdge = newEdge;
            $scope.tabs = ["Properties"];
            $scope.selectedTab = "Properties";

        })


    });

/*
    $scope.defaultpreset = presets["British Only"];
  
   
    setTimeout(function(){
        var initNode = {id:78550};
        
         $scope.nodeLookup=initNode;
        $scope.publish("selected", 
        {
            selection:{nodes:[initNode]}
        }
        );
        
        $scope.selectedTab = "Images";
        
    },1000);
*/

}])
   .run(function ($rootScope, PubSubService) {
      PubSubService.Initialize($rootScope);
  });
   

