angular.module('neograph.common.filters', []).filter('checkmark', function () {
    return function (input) {
        return input ? '\u2713' : '\u2718';
    };
}).filter('predicate', function () {
    return function (input) {
        return input ? '\u2713' : '\u2718';
    };
});