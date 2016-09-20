(function() {

  angular.module('neograph.explore.controller', [])
    .controller('ExploreCtrl', function($scope, $state, nodeManager, modal, $timeout) {
      var vm = this;
      vm.leftPanelVisible = true;
      vm.node = undefined;
      vm.nodeImageUrl = undefined;
      vm.comparisonImageUrl = undefined;
      vm.comparison = undefined;
      vm.comparisonActiveTab = undefined;
      vm.nodeActiveTab = undefined;
      vm.leftPanelEditing = false;
      vm.rightPanelEditing = false;

      vm.searchSelectionChanged = searchSelectionChanged;
      vm.graphSelectionChanged = graphSelectionChanged;
      vm.graphNodeActivated = graphNodeActivated;

      vm.leftPanelHalf = false;
      vm.rightPanelHalf = false;
      vm.leftPanelWide= false;
      vm.rightPanelWide = false;

      var slideInterval = 12000;

      vm.toggleLeftPanel = function() {
        vm.leftPanelVisible = !vm.leftPanelVisible;
      }
      vm.viewImages = viewImages;

      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;
        if (vm.node) {
          vm.nodeImageUrl = vm.node.image.full.url;
        }
    
      });

      nodeManager.subscribe('comparison', function(state) {
        vm.comparison = state.comparison;
        if (vm.comparison) {
          vm.comparisonImageUrl = vm.comparison.image.full.url;
        }
        
      });

      nodeManager.subscribe('tab', function(state) {
        console.log(state,'tab');
        vm.comparisonActiveTab = state.comparisonActiveTab;
        vm.nodeActiveTab = state.nodeActiveTab;
      });

      nodeManager.subscribe('editing', function(state) {
        vm.leftPanelEditing = state.nodeEditing;
        vm.rightPanelEditing = state.comparisonEditing;
      });

      nodeManager.subscribe('nodePictures', function(state) {
        vm.nodePictures = state.nodePictures;
        $timeout(showNextNodePicture, slideInterval);
      });

      var currentNodeImageIndex = 0;
      function showNextNodePicture() {
        if (currentNodeImageIndex > vm.nodePictures.length -1) {
          currentNodeImageIndex = 0;
        }
        vm.nodeImageUrl = vm.nodePictures[currentNodeImageIndex].image.full.url;
        currentNodeImageIndex += 1;
        $timeout(showNextNodePicture, slideInterval);
      }

      nodeManager.subscribe('comparisonPictures', function(state) {
        vm.comparisonPictures = state.comparisonPictures;
        $timeout(showNextComparisonPicture, slideInterval);
      });

      var currentComparisonImageIndex = 0;
      function showNextComparisonPicture() {
        if (currentComparisonImageIndex > vm.comparisonPictures.length -1) {
          currentComparisonImageIndex = 0;
        }
        vm.comparisonImageUrl = vm.comparisonPictures[currentComparisonImageIndex].image.full.url;
        currentComparisonImageIndex += 1;
        $timeout(showNextComparisonPicture, slideInterval);
      }

      function searchSelectionChanged(node) {
        if (node && node.label) {
          $state.go('explore.node', { node: node.label });
          nodeManager.clearComparison();
        }
      }

      function graphSelectionChanged(node, edges) {
        //load node into right panel
        console.log(node, 'graph selection changed');
        if (node) {
          $state.go('explore.node.compare', { comparison: node.label });
        } else {
          $state.go('explore.node', { node: vm.node.label});
          nodeManager.clearComparison();
        }
     
      }

      function graphNodeActivated(node) {
        console.log(node,'node activated');
        $state.go('explore.node', { node: node.label});
        nodeManager.clearComparison();
      }

      function viewImages(node) {
       
        if (vm.node && node.id === vm.node.id) {
          vm.leftPanelWide = !vm.leftPanelWide;
        }

        if (vm.comparison && node.id === vm.comparison.id) {
          vm.rightPanelWide = !vm.rightPanelWide;
        }
       
      }

    });

})();
