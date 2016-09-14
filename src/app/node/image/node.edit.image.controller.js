(function() {
  'use strict';

  angular.module('neograph.node.edit.image.controller', [])
    .controller('EditImageCtrl', controller);

  function controller(nodeManager, neo, modal) {

    var vm = this;
    var modalId = 'node.image.select';
    vm.active = false;
    vm.openModal = openModal;

    nodeManager.subscribe('loaded', function(state) {
      vm.node = state.node;
    });


    function onSelected(picture) {
      vm.node.image = picture.image;
    }

    function openModal() {
      var modalData = {
        node: vm.node
      };
      modal.open(modalId, modalData)
        .then(function (selectedPicture) {
          if (selectedPicture) {
            console.log(selectedPicture);
            vm.node.image = selectedPicture.image;
          }
        });
    }
  }
})();
