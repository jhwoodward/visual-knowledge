(function() {
  'use strict';
  angular.module('common.filters', [
    'common.filters.startcase',
    'common.filters.capitalize'
  ])
  .filter('checkmark', function () {
    return function (input) {
      return input ? '\u2713' : '\u2718';
    };
  })
  .filter('predicate', function () {
    return function (input) {
      return input ? '\u2713' : '\u2718';
    };
  })
  .filter('lowercase', function() {
    return function (input) {
      if (input) {
        return input.toLowerCase().replace(/_/g,' ')
      } else {
        return null;
      }
      
    };
  })
  ;
})();