angular.module("neograph.neo",["neograph.utils","neograph.neo.client"])
.factory("neo", ["neoClient",  "utils",function (neoClient, utils) {


    var that = {
        setPropsAndTabsFromLabels: function (node) {
            return neoClient.node.setPropsAndTabs({ node:node}).$promise.then(function (data) {

                return data.toJSON();

            });
        }
        ,
        getGraph: function (q,returnArray) {

            return neoClient.graph.get({ q: q, returnArray: returnArray }).$promise.then(function (data) {

                var out = data.toJSON();
                console.dir(out);
                return out;

            });
        }
       ,
        //returns all relationships between supplied nodes, which can be vis.Dataset or graph data object
        getAllRelationships: function (nodes) {
            var nodeIds = "";

            if (nodes.getIds) //if vis.DataSet
            {
                nodeIds = nodes.getIds({ returnType: 'Array' }).join(",");
            }
            else { //otherwise data object

                for (var key in nodes) {
                    if (nodeIds.length) {
                        nodeIds += ",";
                    }
                    nodeIds += key;
                }
            }

            var q = "MATCH a -[r]- b WHERE id(a) IN[" + nodeIds + "] and id(b) IN[" + nodeIds + "] and not (a-[:TYPE_OF]-b) return r";

            return that.getGraph(q);

        }
        ,
        getNode: function (id, addrelprops) {

                if (addrelprops) {
                   
                    return neoClient.node.getWithRels({ id: id }).$promise.then(function (node) {

                      

                        //instead i think i should call the service to get the reverse
                            //or use cached predicates in utils
                        for (var relPropKey in node.temp.relProps) {
                            var relProp = node.temp.relProps[relPropKey];
                            relProp.predicate = new utils.Predicate(relProp.predicate.Lookup, relProp.predicate.Direction);
                        }
                        return node.toJSON();
                    });

                }
                else {

                    return neoClient.node.get({ id: id }).$promise.then(function (node) {
                        return node.toJSON();
                    });
                }

        }
             ,
        getRelationships: function (id) {

                return neoClient.node.getRelationships({ id: id }).$promise.then(function (data) {
                    return data.toJSON();
                });
            

        }
            ,
        getNodeByLabel: function (label, addrelprops) {

            if (addrelprops) {

                return neoClient.node.getWithRelsByLabel({ label: label }).$promise.then(function (node) {

                 

                    //instead i think i should call the service to get the reverse
                    for (var relPropKey in node.temp.relProps) {
                        var relProp = node.temp.relProps[relPropKey];
                        relProp.predicate = new utils.Predicate(relProp.predicate.Lookup, relProp.predicate.Direction);
                    }

                    return node.toJSON();



                });

            }
            else {

                return neoClient.node.getByLabel({ label: label }).$promise.then(function (node) {
                    return node.toJSON();
                });
            }


        }
           ,
        getNodeList: function (q, limit) {//q = match (n) & where only (without return)

            return neoClient.node.getList({ q: q, limit: limit }).$promise;//returns array
        }
          ,
        saveWikipagename: function (n)//short version for freebase prop saving
        {
            return neoClient.node.saveWikipagename({ 
                id: n.id, 
                name: n.Wikipagename 
            }).$promise.then(function (data) {
                return data.toJSON();
            });
        }
        ,
        getImages:function(node){
        
            return neoClient.node.getImages({
                id: node.id,
                isPicture: node.temp.isPicture,
                isGroup: node.temp.isGroup
            }).$promise;//returns array
        }
        ,
      
        saveProps: function (n)//short version for freebase prop saving
        {
            return neoClient.node.saveProps({ node: n, user: user }).$promise.then(function (data) {
                return data.toJSON();
            });
        
        }
        ,
        getProps: function (labels) {

            return neoClient.node.getProps({ labels: labels }).$promise.then(function (data) {
                return data.toJSON();
            });
        }
        ,
        //TODO: 
        //for labels (types), type hierachy needs to be enforced - eg if Painter then add Person:Global,-----------------DONE
        //if Painting the add Picture:Creation. These will need to be kept updated.
        //when Lookup is updated, the corresponding label needs to be renamed MATCH (n:OLD_LABEL)  REMOVE n:OLD_LABEL SET n:NEW_LABEL--------------- DONE
        //when updating Type, label needs to be updated, when creating----------------------DONE
        //When we come to modifying labels on creations, their relationships will need to be kept updated
        saveNode: function (n, user) {


            if (n.temp.trimmed) {
                throw ("Node is trimmed - cannot save");
            }


          
            return neoClient.node.save({ node: n, user: user }).$promise.then(function (data) {
                return data.toJSON();
            });



        }
        ,
        saveRels: function (n) {
          
            return neoClient.node.saveRels({ node: n }).$promise.then(function (data) {
                return data.toJSON();
            });

        }
        ,
        saveMultiple: function (multiple) {

        
            return neoClient.node.saveMultiple({ multiple: multiple }).$promise.then(function (data) {
                return data.toJSON();
            });


        }
           ,
        //saves edge to neo (update/create)
        //TODO: according to certain rules labels will need to be maintained when relationships are created. (update not required as we always delete and recreate when changing start/end nodes)
        //tag a with label b where:
        // a=person and b=provenance (eg painter from france)
        // a=person and n=group, period (eg painter part of les fauves / roccocco)
        // a=picture and b=non-person (eg picture by corot / of tree) - although typically this will be managed through labels directly (which will then in turn has to keep relationships up to date)
        saveEdge: function (e) {//startNode and endNode provide the full node objects for the edge

            return neoClient.edge.save({ edge: e }).$promise.then(function (data) {
                return data.toJSON();
            });
        }
        ,
        saveFavourite: function (node, user) {

           
            return neoClient.user.saveFavourite({ user: user, node: node }).$promise.then(function (data) {
                return data.toJSON();
            });


        }

        ,
        destroyNode: function (node) {//deletes node and relationships forever

            return neoClient.node.destroy({ node: node }).$promise.then(function (data) {
                return data.toJSON();
            });

        }
        ,
        //TODO: return something
        deleteNode: function (node) {

            if (node && node.id) {
                //only supports 1 node at the mo
                return neoClient.node.delete({ node: node }).$promise.then(function (data) {
                    return data.toJSON();
                });
            }
            else { }//need to return a resolved promise
        }
        ,

        restoreNode: function (node) {

            if (node && node.id) {
             
                //only supports 1 node at the mo
                return neoClient.node.restore({ node: node }).$promise.then(function (data) {
                    return data.toJSON();
                });


            }
            else { }//need to return a resolved promise


        }
        ,
        deleteEdge: function (edge) {

            if (edge && edge.id) {

                return neoClient.edge.delete({ edge: edge }).$promise.then(function (data) {
                    return data.toJSON();
                });
            

            }

        }
        ,
        getUser: function (userLookup) {
          
            return neoClient.user.get({ user: userLookup }).$promise.then(function (data) {
        
                return data.toJSON();
            });

        }
        ,

        getOne: function (q) {//q must be a match return a single entity n

          

            return neoClient.node.getOne({ q: q }).$promise.then(function (data) {
                return data.toJSON();
            });

        }
        ,
        matchNodes: function (txt, restrict) { //restrict = labels to restrict matches to


            if (txt) {
                return neoClient.node.match({ txt: txt, restrict: restrict }).$promise;//returns array
            }
            

        }

      
     ,
        getImageRelationships: function (edge) { //loks up id/label first then call get by label

            return neoClient.edge.getImageRelationships({ edge: edge }).$promise.then(function (data) {
                return data.toJSON();
            });

        }
        //,
     
        //getRelationships: function (node, callback) {

        //    var q = "match (n)-[r]-(m:Global) where ID(n)=" + node.id + " return r";

        //    return getGraph(q);
        //}
        ,
        //Alternatively i could query the actual labels and merge them into a distinct array
        getDistinctLabels: function (labels) {

          
            return neoClient.utils.getDistinctLabels({ labels: labels }).$promise;//returns array
            


        }
        ,
        getDistinctLabelsQuery: function (q) {

            return neoClient.utils.getDistinctLabels({ q: q }).$promise;//returns array

        }

    }

    return that;

}]);
