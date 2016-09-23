(function() {

  angular.module('neograph', [
    'templates',
    'ui.router',
    'ngSanitize',
    'ngAnimate',
    'neograph.common', 
    'common.filters',
    'neograph.edge',
    'neograph.interaction',
    'neograph.layout',
    'neograph.neo',
    'neograph.node',
    'neograph.search',
    'neograph.graph',
    'neograph.routes',
    'neograph.constant',
    'neograph.explore.controller',
    'neograph.stateManager.service',
    'ui.bootstrap'
    ]);

})();
