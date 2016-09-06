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
    'neograph.query'
  ]).
  config(($stateProvider, $urlRouterProvider) => {
    $stateProvider
        .state('admin', { 
          url:'/admin?querypreset',
          views: {
            '@': {
              templateUrl:'app/partials/admin.html'
            }, 
            'search@admin':{
              controller:'SearchCtrl as vm',
              templateUrl:'app/node/search/search.html'
            }, 
            'query@admin':{
              controller:'QueryCtrl',
              templateUrl:'app/query/query.html'
            }
          }
        })
        .state('search', {
          url:'/search',
          templateUrl:'app/partials/search.html'
        });

    $urlRouterProvider.otherwise('/admin');
  })
  .controller('AdminController', ($scope, neo, queryPresets, utils, session) => {
    $scope.subscribe('hover', node => {
      $scope.selection.hoverNode = node;
    });

    function shouldEnabledAddToGraph() {
      $scope.enableAddToGraph = $scope.selection.selectedNode &&
      $scope.selection.selectedNode.id &&
      $scope.activeView.type == 'Graph' &&
      !$scope.activeView.data.nodes[$scope.selection.selectedNode.id];
    }

    $scope.$watch('selection.selectedEdge', edge => {
      if (edge) {
        $scope.selection.selectedNode = undefined;
        $scope.selection.multiple = undefined;
        $scope.selection.images = [];
      }
    });

    $scope.subscribe('favourite', node => {
      neo.saveFavourite(node, session.user);
    });

    $scope.subscribe('newEdge', newEdge => {
      $scope.$apply(() => {
        $scope.selection.selectedEdge = newEdge;
        $scope.tabs = ['Properties'];
        $scope.selectedTab = 'Properties';
      });
    });

  })
  .run(($rootScope, PubSubService) => {
    PubSubService.init($rootScope);
  });


