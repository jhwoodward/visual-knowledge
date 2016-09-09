(function() {
  'use strict';

  angular
    .module('common.filters.startcase', [])
    .filter('startcase', filterFunc);

  function filterFunc(_) {
    return function (input) {
      if (input != null) {
        return _.startCase(input);
      } else {
        return null;
      }
    };
  }
})();