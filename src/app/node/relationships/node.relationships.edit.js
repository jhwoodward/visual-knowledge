angular.module('neograph.node.relationships',['neograph.node.service', 'neograph.session', 'neograph.utils'])
    .controller('EditRelationshipsCtrl',  function (nodeService, session, utils,$scope,$stateParams) {
       
                if ($stateParams.node){
                    nodeService.get($stateParams.node,true).then(function(node){
                            $scope.node = node;
                        }); 
                }

                $scope.$watch("node", function (node) {
                    if (node) {
                        
                        node.labelled = node.labelled || [];
                        
                        $(".labelEdit input").val('');
                        
                        $scope.deleted = node.labels.indexOf('Deleted') > -1;
                    }

                });
                
                
                
                
             

          
                
                
                $scope.nodeTypes = [];
                
                
    //update tabs & properties if labels change
    var settingPropsAndTabs = false;
 
 /*
    //how can i stop this firing for newly loaded nodes ?
    $scope.$watchCollection('selection.selectedNode.labels', function (labels) {
     
        if (labels && labels.length && !settingPropsAndTabs ) {

            settingPropsAndTabs = true;

            nodeService.getProps(labels).then(function (out) {

                console.dir($scope.selection.selectedNode);
                $scope.selection.selectedNode = $.extend(null,out.properties, $scope.selection.selectedNode);
                $scope.selection.selectedNode.temp.tabs = out.tabs;
                $scope.tabs = $scope.selection.selectedNode.temp.tabs;
          
                settingPropsAndTabs = false;
            })
        }
    });
    */
                
             
           
      
                
                $scope.$watch('newPredicate', function (v) {
                    
                    if (v) {
                        $scope.addRelationship({ lookup: v.toUpperCase().replace(/ /g, "_") });
                    }
                });
                
                
                
                
                $scope.addRelationship = function (item) {
                    
                    
                    var p = predicateFactory.create({lookup:item.lookup,direction: "out"});//currently no way to select 'in' relationships
                    
              
                    $scope.node.relationships = $scope.node.relationships || {};
                    if (!$scope.node.relationships[p.toString()]) {
                        $scope.node.relationships[p.toString()] = { predicate: p, items: [] };
                    }



                }




           


            });