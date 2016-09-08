(function() {
  'use strict';

  angular.module('neograph.node', [
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.images',
    'neograph.node.properties',
    'neograph.node.relationships',
    'neograph.node.service',
    'neograph.node.routes',
    'neograph.node.controller',
    'ui.router'
  ]);

})();