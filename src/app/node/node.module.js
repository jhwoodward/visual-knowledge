(function() {
  'use strict';

  angular.module('neograph.node', [
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.properties',
    'neograph.node.relationships',
    'neograph.node.references',
    'neograph.node.service',
    'neograph.node.image',
    'neograph.node.directive',
    'neograph.node.controller',
    'neograph.models.predicate'
  ]);

})();