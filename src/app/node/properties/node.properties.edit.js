angular.module('neograph.node.properties',['neograph.node.service', 'neograph.session', 'neograph.utils'])
    .controller('EditPropertiesCtrl',  function (nodeService, session, utils,$scope,$stateParams) {
       
                if ($stateParams.node){
                    nodeService.get($stateParams.node,true).then(function(node){
                            $scope.node = node;
                        }); 
                }
                
                $scope.deleteNode = function (n) {
                    
                    nodeService.delete(n)
                    .then(function (deleted) {
                        
                        $scope.selection.selectedNode = deleted;
                        //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
                        //let view handle its own data ?
                        delete $scope.activeView.data.nodes[n.id];
                        $scope.publish("deleted", { selection: { nodes: [n] } });

                    });
                }
                
                
                $scope.destroyNode = function (n) {
                    
                    nodeService.destroy(n)
                    .then(function (deleted) {
                        
                        $scope.selection.selectedNode = undefined;
                        
                        //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
                        //let view handle its own data ?
                        delete $scope.activeView.data.nodes[n.id];
                        
                        $scope.publish("deleted", { selection: { nodes: [n] } });

                    });

                }
                
                $scope.saveNode = function (n) {
        
                    nodeService.save(n, session.user)
                    .then(function (node) {
                        
                        $scope.node = node;
                        
                        var newData = {};
                        newData[node.id] = node;
                        $scope.publish("dataUpdate", newData)
                        //if type, refresh types
                        if (node.class == "Type") {
                            utils.refreshTypes();
                        }
                        
                        $(node.temp.links).each(function (i, e) { e.editing = undefined; })

                    });
                }
                
                
                $scope.restoreNode = function (n) {
                    nodeService.restore(n).then(function (node) {
                        $scope.node = node;
                        var newData = {};
                        newData[node.id] = node;
                        $scope.publish("dataUpdate", newData)
                    });
                }
                
                
                $scope.$watch("node", function (node) {
                    if (node) {
                        
                        node.labelled = node.labelled || [];
                        
                        $(".labelEdit input").val('');
                        
                        $scope.deleted = node.labels.indexOf('Deleted') > -1;
                    }

                });
                
                
                
                
                //tie label value to lookup if empty or the same already
                $scope.$watch("node.lookup", function (lookup, beforechange) {
                    if (lookup) {
                        
                        if ($scope.node.label != undefined && $scope.node.label.trim() == "" || $scope.node.label == beforechange) {
                            $scope.node.label = lookup;

                        }
                 

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
                
                $scope.$watchCollection("node.labels", function (labels) {
                    console.log('labels changed')
                    console.log(labels);
                    if (labels) {
                        
                        var selectedTypes = [];
                        angular.forEach($scope.node.labels, function (l) {
                            if (utils.types[l]) {
                                selectedTypes.push({ lookup: l, class: 'Type' });
                            }
                        });
                        
                        $scope.nodeTypes = selectedTypes;
                        
                        //     console.log(selectedTypes);
                        
                        //set type if not yet set and one label added that is a type
                        if (!$scope.node.class && $scope.nodeTypes.length === 1) {
                            
                            $scope.node.class = $scope.nodeTypes[0].lookup; //for types the lookup will always be the label

                        }

                    //get properties relating to chosen labels and extend node to enable them
                    //nodeService.getProps(labels).then(function (out) {
                    //    console.log('extending node');
                    //    console.log(out);
                    //    console.log(out.props);
                    //    $scope.node = $.extend(out.props,$scope.node);
                    //    console.log($scope.node);
                    //});


                    }

                });
                
                //can be called from clicking label, in which case item is text value, or from the typeahead in which case it is an object with Lookup property
                $scope.setType = function (item) {
                    //   var itemtext = item.Label ||item.Lookup
                    console.log(item);
                    if (utils.isType(item.label)) {
                        $scope.node.class = item.label;
                    }
                }
                
      
                
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