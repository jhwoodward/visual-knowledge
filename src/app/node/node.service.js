(function() {
  'use strict';

  angular.module('neograph.node.service',[])
    .factory('nodeService', service);

  function service(neoClient, utils, $q, predicateFactory) {

    function Node(data) {
      this.labels = [];
      this.id = -1;
      _.extend(this, data);

      for (var relKey in this.relationships) {
        var rel = this.relationships[relKey];
        rel.predicate = predicateFactory.create(rel.predicate);
      }
      if (!this.label && this.lookup) {
        this.label = this.lookup;
      }
   
      this.original = angular.copy(this);
    }

    Node.prototype.revert = function() {
      var reverted = angular.copy(this.original);
      reverted.original = angular.copy(reverted);
      this.replace(reverted);
    }

    Node.prototype.save = function() {
      return neoClient.node.save({ node: this })
        .$promise.then(create)
        .then(this.replace);
    }

    Node.prototype.delete = function () {
      /*
      return neoClient.node.delete({ node: this })
        .$promise.then(create)
        .then(this.replace);
        */
    }

    Node.prototype.restore = function () {
      return neoClient.node.restore({ node: this })
        .$promise.then(create)
        .then(this.replace);
    }

     // deletes node and relationships forever
    Node.prototype.destroy = function () {
      //return neoClient.node.destroy({ node: this });
    }

    Node.prototype.replace = function(node) {
      for (var prop in this) { 
        if (this.hasOwnProperty(prop) && prop !== 'labels') { 
          delete this[prop]; 
        } 
      }
      _.extend(this, node);
    }

    Node.prototype.isDeleted = function () {
      return this.labels.indexOf('Deleted') > -1;
    };
    
    Node.prototype.isPicture = function () {
      return this.labels.indexOf('Picture') > -1;
    };

    Node.prototype.isPerson = function () {
      return this.labels.indexOf('Person') > -1;
    };

    Node.prototype.isProperty = function () {
      return this.labels.indexOf('Property') > -1;
    };

 

    function create(nodeResponseData) {
      var node = nodeResponseData.toJSON();
      return utils.getType(node.type)
        .then(function(typeObject) {
          node.type = typeObject;
          return new Node(node);
        });
    }

    var api = {
      // id = label or internal id
      get: function (id) {
        return neoClient.node.getWithRels({ id: id })
          .$promise.then(create);
      },
      getList: function (q, limit) { // q = match (n) & where only (without return)
        return neoClient.node.getList({ q: q, limit: limit }).$promise;// returns array
      },
      getImages:function (node) {
        return neoClient.node.getImages({
          id: node.id,
          isPicture: node.isPicture(),
          isGroup: node.isGroup()
        }).$promise;// returns array
      },
      search: function (txt, restrict) { // restrict = labels to restrict matches to
        if (txt) {
          return neoClient.node.search({ txt: txt, restrict: restrict }).$promise;// returns array
        }
      },
      create: function(nodeAsJson) {
        return new Node(nodeAsJson);
      }
    };
    return api;

  }
})();