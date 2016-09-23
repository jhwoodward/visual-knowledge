(function() {
  'use strict';

  angular.module('neograph.node.controller', [
    ])
    .controller('NodeCtrl', controller);

  function controller($scope) {
    var vm = this;
    vm.node = {};
    vm.edit = edit;
    vm.delete = del;
    vm.destroy = destroyNode;
    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;
    vm.selectTab = selectTab;
    vm.closeTabs = closeTabs;
    vm.node = {};
    vm.tabs = ['Properties', 'Image', 'Relationships', 'Refs'];
    //vm.selectedTab = 'Properties';

    function selectTab(tab) {
      vm.selectedTab = tab;
    }

    function closeTabs() {
      vm.selectedTab = undefined;
    }

    $scope.$watch('vm.selectedTab',function(tab) {
      if (vm.onTabChanged) {
        vm.onTabChanged({tab: tab});
      }
    });

    function edit() {
      if (vm.onToggleEdit) {
        vm.onToggleEdit({editing:true});
        if (!vm.selectedTab) {
          vm.selectedTab = 'Properties';
        }
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