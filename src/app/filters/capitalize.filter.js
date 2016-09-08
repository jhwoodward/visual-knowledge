(function() {
  'use strict';
  
  angular
    .module('common.filters.capitalize', [])
    .filter('capitalize', filterFunc);

  function filterFunc() {
    return function (input) {
      if (input != null) {
        input = input.toLowerCase();
        return input.substring(0, 1).toUpperCase() + input.substring(1);
      } else {
        return null;
      }
    };
  }

})();