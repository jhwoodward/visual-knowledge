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
    'neograph.map',
    'neograph.routes',
    'neograph.constant'
    ]);

})();
