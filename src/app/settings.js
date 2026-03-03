(function() {

  angular.module('neograph.settings', [])
    .factory('settings', function() { 
      
      return {
        apiRoot: 'https://graph.vsys.co.uk' 
      };
    
    });

})();

