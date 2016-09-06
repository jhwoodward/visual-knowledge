angular.module('neograph.common.network', [])
.directive('network', function () {
  return {

    restrict:'E',
    template:'<div></div>',
    scope:{
      graph:'=',
      options:'=',
      network:'=',
      width:'@',
      height:'@'
    }
        ,
    link:function ($scope, $element) {

      $scope.network = new vis.Network($element, $scope.graph, $scope.options);
      $scope.network.setSize($scope.width + 'px', $scope.height + 'px');
    }


  };

});
