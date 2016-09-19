(function() {
  'use strict';

  angular.module('neograph.node.directive.controller', [
    ])
    .controller('NodeDirectiveCtrl', controller);

  function controller($scope, $stateParams, $state, nodeManager) {
    var vm = this;
    vm.node = {};
    vm.edit = edit;
    vm.delete = del;
    vm.destroy = destroyNode;
    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;
    vm.selectTab = selectTab;
    vm.node = {};
    vm.tabs = ['Properties', 'Image', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';

    function selectTab(tab) {
      vm.selectedTab = tab;
      if (vm.onTabChanged) {
        vm.onTabChanged({tab: tab});
      }
    }

    function edit() {
      if (vm.onToggleEdit) {
        vm.onToggleEdit({editing:true});
      } else {
        vm.editing = true;
      }
    }

    function del() {
      vm.node.delete();
    };

    function destroyNode() {
      vm.node.destroy()
        .then(function() {
          vm.node = undefined;
          //where to now ???
        });
    };

    function finishEditing(node) {
      if (vm.onToggleEdit) {
        vm.onToggleEdit({editing:false});
      } else {
        vm.editing = false;
      }
    }

    function cancel() {
      if (vm.node.id > -1) {
        vm.node.revert();
      }
      finishEditing();
    }

    function save() {
      vm.node.save()
        .then(finishEditing);
    };

    function restore() {
      vm.node.restore(vm.node)
        .then(finishEditing);
    }

  }

})();