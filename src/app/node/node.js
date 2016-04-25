angular.module('neograph.node',[
    'neograph.node.graphpanel',
    'neograph.node.favourites',
    'neograph.node.freebase',
    'neograph.node.graphpanel',
    'neograph.node.images',
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.service',
    'neograph.node.properties',
    'neograph.node.relationships',
    'ui.router'
    
])
.config(function($stateProvider){
    $stateProvider
        .state('admin.main.node',{
            url:'/node/:node',
            //abstract:true,
            views:{
                    'nodeHeader@admin':{
                        controller:'NodeHeaderCtrl',
                        templateUrl:'app/node/node.header.html'
                    }
                     ,
                      'node@admin':{
                        controller:'NodeCtrl',
                        templateUrl:'app/node/node.html'
                    }
                    ,
                      'nodeimages@admin':{
                        controller:'NodeImagesCtrl',
                        templateUrl:'app/node/images/node.images.html'
                    }
             
            }
            
        })
        .state('admin.main.node.view',{
            url:'/view',
            views:{
                     'properties@admin.main.node':{
                        templateUrl:'app/node/properties/node.properties.html',
                        controller:function ($scope,$stateParams,nodeService) {
                            if ($stateParams.node){
                                nodeService.get($stateParams.node,true).then(function(node){
                                        $scope.node = node;
                                    }); 
                            }
                        }
                    }
                    ,
                     'relationships@admin.main.node':{
                        templateUrl:'app/node/relationships/node.relationships.html',
                        controller:function ($scope,$stateParams,nodeService) {
                            if ($stateParams.node){
                                nodeService.get($stateParams.node,true).then(function(node){
                                        $scope.node = node;
                                        console.log(node);
                                    }); 
                            }
                        }
                    }
            }
            
        })
        .state('admin.main.node.edit',{
            url:'/edit',
            views:{
          
                    'editproperties@admin.main.node':{
                       templateUrl:'app/node/properties/node.properties.edit.html',
                       controller:'EditPropertiesCtrl'
                    },
                       'editrelationships@admin.main.node':{
                       templateUrl:'app/node/relationships/node.relationships.edit.html',
                       controller:'EditRelationshipsCtrl'
                    }
                    
            }
            
        });
})
.controller('NodeSearchCtrl',function($scope,$state,nodeService){
        
    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    }
        
     $scope.$watch('nodeLookup', function (n) {

        if (n && n.id) {
             nodeService.get(n.label,true).then(function(node){
                 $scope.selection.selectedNode = node;
                 $state.go('admin.main.node.view',{node:n.label});
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
    
    $scope.addNodeToGraph = function (node) {
        console.log('add node to graph');
        //check node is not already in graph
        if (!$scope.views.Graph.data.nodes[node.id]) {
            console.log('get relationships');
            //pull in relationships
            neo.getRelationships(node.id).then(function (g) {
                console.log('got relationships');
                console.dir(g);

                var newData = {
                    edges: g.edges,
                    nodes: {}
                }
                newData.nodes[node.id] = node;


                $scope.publish("dataUpdate", newData);


                if (node.id === $scope.selection.selectedNode.id) {
                    $scope.publish("selected", { selection: { nodes: [node.id] } });
                    $scope.publish("focus", node.id)
                }

            });

            $scope.activeView = graphView;

        }


    }

        
})
.controller('NodeHeaderCtrl',function($scope,$stateParams,nodeService){
        
    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    }

     if ($stateParams.node){
          
           nodeService.get($stateParams.node,true).then(function(node){
                 $scope.selection.selectedNode = node;
            });
                
      }
   

        
})
.controller('NodeCtrl',function($scope,$stateParams,nodeService){

       $scope.selection = {
            selectedNode: null,
            selectedEdge: null,
            hoverNode: null
        }
        
      
      if ($stateParams.node){
          
           nodeService.get($stateParams.node,true).then(function(node){
                 $scope.selection.selectedNode = node;
            });
                
      }
      

  

/*
    //respond to published event from other component
     $scope.subscribe("selected", function (params) {//params is object containing array of nodes and array of edges


        //avoid feedback loop by checking that sender is not self
        if (params.sender != "Controller") {

            if (params.selection.nodes.length == 1) {

                if (params.selection.nodes[0].id) {

                 
                    neo.getNode(params.selection.nodes[0].id, true)
                   .then(function (loadedNode) {
                 
                       $scope.selection.selectedNode = loadedNode;
                       $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                    

                   
                   });
                }
                else if (params.selection.nodes[0].Label) {

                    neo.getNodeByLabel(params.selection.nodes[0].Label, true)
                   .then(function (loadedNode) {
                      
                       $scope.selection.selectedNode = loadedNode;
                       $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                       
                   });
                }

            }
            else if (params.selection.nodes.length > 1)//multiple node selection
            {
                $scope.selection.multiple = params.selection.nodes;
                $scope.selection.selectedNode = undefined;
                $scope.selection.selectedEdge = undefined;
                $scope.tabs = ["Properties"];
                $scope.selectedTab = $scope.tabs[0];

            }
            else if (params.selection.edges.length == 1) {
                $scope.selection.selectedNode = undefined;
                $scope.selection.selectedEdge = params.selection.edges[0];
                $scope.tabs = ["Properties", "Images"];
                $scope.selectedTab = $scope.tabs[0];

            }
        }
    });
    */

    $scope.tabs = ["Properties","Relationships","Images"];
    $scope.selectedTab = "Properties";
    $scope.selectTab = function (tab) {
        $scope.selectedTab = tab;
    }


    
    
}) 