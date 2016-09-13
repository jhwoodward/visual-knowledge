(function() {
  'use strict';

  angular.module('neograph.node.edit.image.controller', [])
    .controller('EditImageCtrl', controller);

  function controller(nodeManager, neo) {

    var vm = this;
    vm.active = false;
    vm.onSelected = onSelected;

    nodeManager.subscribe('loaded', function(state) {
      vm.node = state.node;
      neo.getPictures(vm.node.label).then(function(pictureData) {
        vm.pictures = pictureData.items;
      });
    });

    nodeManager.subscribe('tabChanged', function(state) {
      vm.active = state.tab === 'Image';
    });

    function onSelected(picture) {
      vm.node.image = picture.image;
    }

  }
})();
