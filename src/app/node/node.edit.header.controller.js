(function() {
  'use strict';

  angular.module('neograph.node.edit.header.controller', [])
    .controller('NodeEditHeaderCtrl', controller);

  function controller($scope, $state, nodeService) {
    var vm = this;
    vm.node = undefined;
    
    vm.cancel = cancel;
    vm.del = del;
    vm.destroy = destroy;
    vm.save = save;
    vm.restore = restore;

    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function cancel() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function del() {
      nodeService.delete(vm.node)
        .then(function(deleted) {
          vm.node = deleted;
          $scope.node = vm.node;
          //$scope.publish('deleted', { selection: { nodes: [n] } });
        });
    };

    function destroy() {
      nodeService.destroy(vm.node)
        .then(function() {
          vm.node = undefined;
          $scope.node = vm.node;
        });
    };


    function save() {
  
      nodeService.save(vm.node)
        .then(function(saved) {
          vm.node = saved;
          $scope.node = vm.node;
        //  var newData = {};
        //  newData[node.id] = node;
        //  $scope.publish('dataUpdate', newData);
          // if type, refresh types
        //  if (node.class == 'Type') {
       //     utils.refreshTypes();
       //   }
       ///   $(node.temp.links).each((i, e) => { e.editing = undefined; });
        });
 
    };

    function restore() {
      nodeService.restore(vm.node)
        .then(function(restored) {
          vm.node = restored;
          $scope.node = vm.node;
        //  var newData = {};
        //  newData[node.id] = node;
        //  $scope.publish('dataUpdate', newData);
      });
    };


  }



})();