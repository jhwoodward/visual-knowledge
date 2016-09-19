(function() {
  'use strict';

  angular.module('neograph.node.image.controller', [])
    .controller('NodeImageCtrl', controller);

  function controller(nodeManager, neo, modal) {

    var vm = this;
    var modalId = 'node.image.select';
    vm.active = false;
    vm.openModal = openModal;
    vm.isDirty = false;
    vm.save = save;
    vm.revert = revert;

/*

    nodeManager.subscribe('loaded', function(state) {
      vm.node = state.node;
      vm.original = angular.copy(vm.node.image);
    });
*/

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
            if (!vm.node.image ||
              (vm.node.image && selectedPicture.image.id !== vm.node.image.id)) {
              vm.node.image = selectedPicture.image;
              vm.isDirty = true;
            } else {
              vm.isDirty = false;
            }
          }
        });
    }

    function save() {
      neo.saveImage(vm.node).then(function(resp) {
        vm.isDirty = false;
      });
    }

    function revert() {
      vm.node.image = vm.original;
      vm.isDirty = false;
    }

  }
})();
