(function() {
  'use strict';

  angular.module('neograph.node.edit.image.select.controller', [])
    .controller('NodeImageSelectCtrl', controller);

  function controller(nodeManager, neo, modal) {

    var vm = this;
    var modalId = 'node.image.select';
    vm.onSelected = onSelected;
    vm.selectConfirm = selectConfirm;

    activate();

    function activate() {
      vm.node = modal.getData(modalId).node;
      neo.getPictures(vm.node.label).then(function(pictureData) {
        vm.pictures = pictureData.items;
      });
    }

    function onSelected(picture) {
      vm.selectedPicture = picture;
    }

    function selectConfirm() {
      modal.close(modalId, vm.selectedPicture);
    }

  }
})();
