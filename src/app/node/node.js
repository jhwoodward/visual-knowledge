angular.module('neograph.node',[
    'neograph.node.graphpanel',
    'neograph.node.favourites',
    'neograph.node.freebase',
    'neograph.node.graphpanel',
    'neograph.node.images',
    'neograph.node.edit',
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.cache',
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
                        templateUrl:'app/node/nodeHeader.html'
                    }
                     ,
                      'node@admin':{
                        controller:'NodeCtrl',
                        templateUrl:'app/node/node.html'
                    }
             
            }
            
        })
        .state('admin.main.node.view',{
            url:'/view',
            views:{
                     'viewnode@admin.main.node':{
                        templateUrl:'app/node/node.view.html',
                        controller:function ($scope,$stateParams,cache) {
                            if ($stateParams.node){
                                cache.getNode($stateParams.node).then(function(node){
                                        $scope.node = node;
                                    }); 
                            }
                        }
                    }
            }
            
        })
        .state('admin.main.node.edit',{
            url:'/edit',
            views:{
          
                      'editnode@admin.main.node':{
                       templateUrl:'app/node/node.edit.html',
                       controller:'EditNodeCtrl'
                    }
            }
            
        });
})
.controller('NodeSearchCtrl',function($scope,$state,cache){
        
    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    }
        
     $scope.$watch('nodeLookup', function (n) {

        if (n && n.id) {
             cache.getNode(n.Label).then(function(node){
                 $scope.selection.selectedNode = node;
                 $state.go('admin.main.node.view',{node:n.Label});
             })    
          
        }
    });
    
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
.controller('NodeHeaderCtrl',function($scope,$stateParams,cache){
        
    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    }

     if ($stateParams.node){
          
           cache.getNode($stateParams.node).then(function(node){
                 $scope.selection.selectedNode = node;
            });
                
      }
   

        
})
.controller('NodeCtrl',function($scope,$stateParams,neo,cache){

       $scope.selection = {
            selectedNode: null,
            selectedEdge: null,
            hoverNode: null
        }
        
      
      if ($stateParams.node){
          
           cache.getNode($stateParams.node).then(function(node){
                 $scope.selection.selectedNode = node;
            });
                
      }
      

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

    $scope.tabs = [];
    $scope.selectedTab = "Properties";
    $scope.selectTab = function (tab) {
        $scope.selectedTab = tab;
    }


    //update tabs & properties if labels change
    var settingPropsAndTabs = false;
 
    //how can i stop this firing for newly loaded nodes ?
    $scope.$watchCollection('selection.selectedNode.labels', function (labels) {
     
        if (labels && labels.length && !settingPropsAndTabs ) {

            settingPropsAndTabs = true;

            console.dir($scope.selection.selectedNode);
            neo.getProps(labels).then(function (out) {

                console.dir($scope.selection.selectedNode);
                $scope.selection.selectedNode = $.extend(null,out.properties, $scope.selection.selectedNode);
                $scope.selection.selectedNode.temp.tabs = out.tabs;
                $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                /*
                if (session.user.favourites[$scope.selection.selectedNode.id]) {
                    $scope.tabs.push("Favourite");
                }
                */
                settingPropsAndTabs = false;
            })
        }
    });
    
   

 


    
    
    
}) 