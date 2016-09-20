(function() {
  'use strict';

  angular.module('neograph.node', [
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.properties',
    'neograph.node.relationships',
    'neograph.node.references',
    'neograph.node.service',
    'neograph.node.routes',
    'neograph.node.controller',
    'neograph.node.create.controller',
    'neograph.comparison.controller',
    'neograph.node.image',
    'neograph.node.directive',
    'neograph.node.directive.controller',
    'neograph.models.predicate',
    'neograph.nodeManager.service'
  ]);

})();