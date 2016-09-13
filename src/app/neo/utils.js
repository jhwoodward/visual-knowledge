(function() {

angular.module('neograph.utils', ['neograph.neo.client'])
  .factory('utils', factory);

  function factory(neoClient, $q) {

    Array.prototype.diff = function (a) {
      return this.filter(function (i) { return a.indexOf(i) < 0; });
    };
    Array.prototype.ids = function () {
      return this.map(function (e) { return e.id; });
    };
    Array.prototype.hasAny = function (a) {
      return this.filter(function (i) { return a.indexOf(i) > -1; }).length > 0;
    };
    Array.prototype.unique = function () {
      var a = [];
      for (i = 0; i < this.length; i++) {
        var current = this[i];
        if (a.indexOf(current) < 0) a.push(current);
      }
      return a;
    };

    var api = {
      isType: function (label) {
        return api.types[label] != undefined;
      },
      // returns type object from lookup
      getType: function(type) {
         return api.getTypes()
          .then(function(types) {
            return types[type];
          });
      },   
      getTypes: function () {
        if (api.types) {
          var deferred = $q.defer();
          deferred.resolve(api.types);
          return deferred.promise;
        } else {
          return api.refreshTypes();
        }
      },
      refreshTypes: function () {
        return neoClient.type.getAll()
          .$promise.then(function (types) {
            api.types = types.toJSON();
            return api.types;
          });
      },
      getPredicates: function() {
        if (api.predicates) {
          var deferred = $q.defer();
          deferred.resolve(api.predicates);
          return deferred.promise;
        } else {
          return api.refreshPredicates();
        }
      },
      refreshPredicates: function () { 
        return neoClient.predicate.getAll()
          .$promise.then(function (predicates) {
            api.predicates = predicates.toJSON();
            return api.predicates;
          });
      },
      isSystemInfo: function (label) {
        return label === 'Global' || 
          label === 'Type' || 
          label === 'Label' || 
          label === 'SystemInfo';
      },
      getLabelClass: function (node, label) {
        if (node && label === node.Type) {
          return 'label-warning';
        }
        if (api.isSystemInfo(label)) {
          return 'label-system';
        }
        if (api.isType(label)) {
          return 'label-inverse pointer';
        }
        return 'label-info';
      }
    };

    api.refreshPredicates();
    api.refreshTypes();
    return api;
  }

})();