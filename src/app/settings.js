(function() {

  angular.module('neograph.settings', [])
    .factory('settings', function() { 
      
      return {
        apiRoot: 'http://localhost:1337' 
      };
    
    });

})();

