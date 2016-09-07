(function() {
  'use strict';

  angular.module('neograph.node.images', ['neograph.neo', 'ui.router'])
    .controller('NodeImagesCtrl', controller);

  function controller($scope, $stateParams, neo, nodeService) {
    var vm = this;
    vm.images = [];
    if ($stateParams.node) {
      neo.getImages($stateParams.node).then(function (images) {
        vm.images = images;
        loaded = true;
      });
    }
  }
})();