var app = angular
    .module("app", 
    [
    'publishSubscribe',
    'ngRoute',
    'ngSanitize',
    'neograph.common',
    'neograph.edge',
    'neograph.graph',
    'neograph.interaction',
    'neograph.layout',
    'neograph.neo',
    'neograph.node',
    'neograph.query',
    'neograph.controller.main',
    'neograph.controller.mob'
    ])
    .config(['$routeProvider','$locationProvider',
  function ($routeProvider,$locationProvider) {

      $locationProvider.html5Mode(true);

      $routeProvider.
      when('/', {
          templateUrl: 'app/partials/layout.html',
          controller: 'MainController'
      }).
           when('/mob', {
               templateUrl: 'app/partials/mob.html',
               controller: 'MobController'
           }).
             when('/label/:label', {
                 templateUrl: 'app/partials/mob.html',
                 controller: 'MobController'
             }).
             when('/picture/:pictureid', {
                 templateUrl: 'app/partials/mob.html',
                 controller: 'MobController'
             }).
        otherwise({
            redirectTo: '/'
        });
        
        
  }])
  .run(function ($rootScope, PubSubService) {
      PubSubService.Initialize($rootScope);
  });
   

