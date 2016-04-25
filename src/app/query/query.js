angular.module('neograph.query',['neograph.query.presets','neograph.queryInput','neograph.query.graph'])
.factory("queryFactory",function(queryPresets){
    
     function Query (key, render) {



        this.key = key;
        this.name = key;
        this.render = render;

        this.data = {
            nodes: {},
            edges: {}
        }
        
        this.body = {q:"",connectAll:false}


       this.presets = queryPresets;
       this.generators = {};
            
        if (render === "Graph") {
         
            this.generators.nodeGraph = {
                type: "nodeGraph",
                options: {}
            }
        }

        if (render === "Grid") {
            this.generators.nodeFilter = {
                type: "nodeFilter",
                options: {}
            }
            this.generators.favouritesFilter = {
                type: "favouritesFilter",
                options: {}
            }
        }

    }


        return {
              create : function (key, type) {
                var query = new Query(key, type);
                return query;
            }
        }
      
})
    .factory('queryService',function(queryFactory){
        
        var active = queryFactory.create("Query","Graph");
        var queries = {};
        queries[active.key] = active;

        var clonequery = function () {
            queries[$scope.queries[active].generators.nodeFilter.options.node.lookup] = angular.copy(queries[active]);
        }
        
        var listeners = [];
        
        
        function publishChange(){
            
            for (var i =0;i<listeners.length;i++){
                listeners[i](active);
            }
        }
        
        
        return {
            queries:queries,
            active:active,
            update:function(key){
                active = queries[key];
                publishChange();
            }
            ,
            subscribe:function(callback){
                listeners.push(callback);
            }
        }
        
    })   

    .controller('QueryCtrl',function($scope,queryService){
        
        queryService.subscribe(function(active){
            $scope.active = active;
        })
        
        $scope.queries = queryService.queries;
        $scope.active = queryService.active;
        
        $scope.selectedTab = $scope.active.key;

        $scope.$watch('selectedTab',function(key){
            queryService.update(key);
        });
        
    })