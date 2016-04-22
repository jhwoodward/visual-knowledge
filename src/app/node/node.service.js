angular.module('neograph.node.service',['neograph.utils','neograph.neo.client','neograph.models.node'])
.factory('nodeService', ['neoClient',  'utils','$q','nodeFactory',function (neoClient, utils,$q,nodeFactory) {

    var lastLoadedNode = {};
    

    var that = {
        setPropsAndTabsFromLabels: function (node) {
            return neoClient.node.setPropsAndTabs({ node:node}).$promise.then(function (data) {
                return data.toJSON();
            });
        }
        ,
        get: function (label, addrelprops) {

        
            
            if (addrelprops) {
                
                if (lastLoadedNode && (label===lastLoadedNode.Label || label ===lastLoadedNode.id)){
                    return $q.when(lastLoadedNode);
                }
                else{
                
                    return neoClient.node.getWithRels({ id: label }).$promise.then(function (node) {
                        
                     
                        lastLoadedNode = nodeFactory.create(node.toJSON());
                        console.log(lastLoadedNode);
                        return lastLoadedNode;
                    });
                }

               
            }
            else {
                return neoClient.node.get({ id: label }).$promise.then(function (node) {
                    return node.toJSON();
                });
            }

        }
        ,
        getList: function (q, limit) {//q = match (n) & where only (without return)

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
        save: function (n, user) {
            if (n.temp.trimmed) {
                throw ('Node is trimmed - cannot save');
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
        //deletes node and relationships forever
        destroy: function (node) {

            return neoClient.node.destroy({ node: node }).$promise.then(function (data) {
                return data.toJSON();
            });

        }
        ,
       //only supports 1 node at the mo
        delete: function (node) {

             var deferred = $q.deferred();
                
            if (node && node.id) {
                
                return neoClient.node.delete({ node: node }).$promise.then(function (data) {
                   deferred.resolve(data.toJSON());
                });
            }
            else { 
                deferred.resolve({});
            }
        }
        ,
           //only supports 1 node at the mo
        restore: function (node) {

            var deferred = $q.deferred();
            
            if (node && node.id) {
                neoClient.node.restore({ node: node }).$promise.then(function (data) {
                    deferred.resolve(data.toJSON());
                });
            }
            else { 
                deferred.resolve({});
                
            }

            return deferred.promise;

        }
        ,
        search: function (txt, restrict) { //restrict = labels to restrict matches to

console.log(txt);
            if (txt) {
                return neoClient.node.search({ txt: txt, restrict: restrict }).$promise;//returns array
            }

        }


    }

    return that;

}]);
