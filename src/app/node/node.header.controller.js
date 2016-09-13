(function() {
  'use strict';

  angular.module('neograph.node.header.controller', [])
    .controller('NodeHeaderCtrl', controller);

  function controller($state, nodeManager) {
    var vm = this;
    vm.edit = edit;
    vm.delete = del;
    vm.destroy = destroy;
    
    activate();
    function activate() {
      //set node when loaded by parent controller
      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;
      });
    }

    function reload() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function edit() {
      $state.go('admin.node.edit');
    }

    function del() {
      vm.node.delete();
    };

    function destroy() {
      vm.node.destroy()
        .then(function() {
          vm.node = undefined;
          //where to now ???
        });
    };


  }

})();