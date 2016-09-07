angular.module('templates', []);
var app = angular
  .module('Neograph',
  [
    'templates',
    'publishSubscribe',
    'ui.router',
    'ngSanitize',
    'neograph.common',
    'neograph.edge',
    'neograph.interaction',
    'neograph.layout',
    'neograph.neo',
    'neograph.node',
    'neograph.map'
  ]).
  config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('admin', { 
          url:'/admin',
          views: {
            '@': {
              templateUrl:'app/partials/admin.html'
            }, 
            'search@admin':{
              controller:'SearchCtrl as vm',
              templateUrl:'app/node/search/search.html'
            }, 
            'map@admin':{
              controller:'MapCtrl as vm',
              templateUrl:'app/map/map.html'
            }
          }
        });

    $urlRouterProvider.otherwise('/admin');
  });


