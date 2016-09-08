(function() {
  'use strict';

  angular.module('neograph.node.controller', [])
    .controller('NodeCtrl', controller)
    .controller('ChildNodeCtrl', childController);

  function controller($scope, $state, $stateParams, nodeService) {
    var vm = this;
    vm.node = {};
    vm.tabs = ['Properties', 'Relationships'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    vm.edit = edit;
    vm.new = newNode;
    vm.cancel = cancel;
    vm.del = del;
    vm.destroy = destroy;
    vm.save = save;
    vm.restore = restore;

    activate();
    function activate() {
      if ($stateParams.node) {
        nodeService.get($stateParams.node, true).then(function (node) {
          //set node property on scope - propagates to child controllers
          vm.node = node;
          $scope.node = vm.node;
          $scope.hasNode = true;
        });
      }
    }

    function newNode() {
      vm.node = node;
      $scope.node = vm.node;
    }

    function edit() {
      $state.go('admin.node.edit', { node: vm.node.label });
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

  function childController($scope, $stateParams, nodeService) {
    var vm = this;
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });
  }

})();