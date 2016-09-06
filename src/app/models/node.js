  angular.module('neograph.models.node', ['neograph.models.predicate'])
  .factory('nodeFactory', function (predicateFactory) {

    function Node(data) {

      this.labels = [];

      Object.assign(this, data);

        // instead i think i should call the service to get the reverse
      for (var relKey in this.relationships) {
        var rel = this.relationships[relKey];
        rel.predicate = predicateFactory.create(rel.predicate);
      }

      if (!this.label && this.lookup) {
        this.label = this.lookup;
      }


    }

    Node.prototype.isPicture = function () {

      return this.labels.indexOf('Picture') > -1;

    };

    Node.prototype.isPerson = function () {

      return this.labels.indexOf('Person') > -1;

    };

    Node.prototype.isProperty = function () {

      return this.labels.indexOf('Property') > -1;

    };



    Node.prototype.isCustomField = function (key) {

      return key != 'lookup'
            && key != 'class'
            && key != 'label'
            && key != 'description'
            && key != 'text' &&
            key != 'name' &&
            key != 'systemInfo' &&
            key != 'labels' &&
            key != 'id' &&
            key != 'created' &&
            key != 'image' &&
            key != 'relationships' &&
            key != 'labelled';

    };


    return {
      create:function (data) {
        return new Node(data);
      }
    };


  });



