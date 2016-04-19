angular.module('neograph.cache',['neograph.neo'])
.factory('cache',function(neo,$q){
    
    var currentNode;
    
    return {
        
        getNode:function(label){
            
            if (currentNode && label===currentNode.Label){
                return $q.when(currentNode);
            }
            else{
                    //load full node including labels and relationships
                return neo.getNodeByLabel(label, true)
                    .then(function (node) {


                        currentNode = node;
                        return node;
                        /*
                        $scope.tabs = $scope.selection.selectedNode.temp.tabs;

                        if ($scope.activeView.data.nodes[node.id]) {
                            $scope.publish("focus", node.id)
                        }
                        else {
                            if ($scope.addToGraphOnLookup) {
                                $scope.addNodeToGraph(node);
                            }

                        }
                        */
                        
                        
                    });
            }
           
        }

    }
    
    
})