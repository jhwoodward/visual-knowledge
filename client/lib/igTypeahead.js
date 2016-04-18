angular.module('igTypeahead', []).directive('typeahead', function(){
  return{
    restrict: 'E',
    replace: true,
    scope: {
      choice: '=',
      list: '='
    },
    template: '<input type="text" ng-model="choice" />',
    link: function(scope, element, attrs){
      scope.typeaheadElement = element;
      $(element).typeahead({
        source: scope.list,
        updater: function(item){
          scope.$apply(function(){
            scope.choice = item;
          });
          return item;
        }
      });
      
      scope.$watch('list', function(newList, oldList){
        $(element).data('typeahead').source = newList;
      } ,true);
    }
  };
});
