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

      vm.loadNode = loadNode;
      vm.loadComparison = loadComparison;
      vm.graphSelectionChanged = graphSelectionChanged;
      vm.nodeActivated = nodeActivated;

      vm.leftPanelHalf = false;
      vm.rightPanelHalf = false;
      vm.leftPanelWide= false;
      vm.rightPanelWide = false;
      vm.leftPanelFull = false;
      vm.rightPanelFull = false;

      vm.panelNoShadow = true;

      vm.viewPictures = viewPictures;
      vm.closePictures = closePictures;

      vm.swapNodes = swapNodes;

      var blank = '';

      var slideInterval = 12000;

      vm.toggleLeftPanel = function() {
        vm.leftPanelVisible = !vm.leftPanelVisible;
      }
      vm.viewImages = viewImages;

      nodeManager.subscribe('loaded', function(state) {
        vm.node = state.node;

        if (vm.node && vm.node.image) {
          vm.nodeImageUrl = vm.node.image.full.url;
        } else {
          vm.nodeImageUrl = blank;
        }
    
      });

      nodeManager.subscribe('comparison', function(state) {
        vm.comparison = state.comparison;

        if (vm.comparison && vm.comparison.image) {
          vm.comparisonImageUrl = vm.comparison.image.full.url;
        } else {
          vm.comparisonImageUrl = blank;
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
      });
      nodeManager.subscribe('comparisonPictures', function(state) {
        vm.comparisonPictures = state.comparisonPictures;
      });


      var nodeSlideShowOn = false;
      var comparisonSlideShowOn = false;
      var nodeSlideTimeout;
      var comparisonSlideTimeout;
      
      function closePictures() {
        nodeSlideShowOn = false;
        comparisonSlideShowOn = false;
        vm.leftPanelHalf = false;
        vm.rightPanelHalf = false;
        vm.leftPanelFull = false;

        if (vm.node && vm.node.image) {
          vm.nodeImageUrl = vm.node.image.full.url;
        } else {
          vm.nodeImageUrl = blank;
        }

        if (vm.comparison && vm.comparison.image) {
          vm.comparisonImageUrl = vm.comparison.image.full.url;
        } else {
          vm.comparisonImageUrl = blank;
        }
      }

      function viewPictures() {
        if (vm.comparison && vm.node) {
          vm.leftPanelHalf = true;
          vm.rightPanelHalf = true;
          vm.panelNoShadow = true;
          nodeSlideShowOn = true;
          comparisonSlideShowOn = true;
          showNextNodePicture();
          showNextComparisonPicture();
        } else {
          vm.leftPanelFull = true;
          nodeSlideShowOn = true;
          showNextNodePicture();
        }
    
      


      }

      var currentNodeImageIndex = 0;
      function showNextNodePicture() {
        if (nodeSlideShowOn) {
          if (currentNodeImageIndex > vm.nodePictures.length -1) {
            currentNodeImageIndex = 0;
          }
          vm.nodeImageUrl = vm.nodePictures[currentNodeImageIndex].image.full.url;
          currentNodeImageIndex += 1;
          $timeout(showNextNodePicture, slideInterval);
        }
      }
      var currentComparisonImageIndex = 0;
      function showNextComparisonPicture() {
        if (comparisonSlideShowOn) {
          if (currentComparisonImageIndex > vm.comparisonPictures.length -1) {
            currentComparisonImageIndex = 0;
          }
          vm.comparisonImageUrl = vm.comparisonPictures[currentComparisonImageIndex].image.full.url;
          currentComparisonImageIndex += 1;
          $timeout(showNextComparisonPicture, slideInterval);
        }
    
      }

      function loadNode(node) {
        if (node && node.label) {
          $state.go('explore.node', { node: node.label });
          nodeManager.clearComparison();
        }
      }

      function loadComparison(node) {
        if (node && node.label) {
          $state.go('explore.node.compare', { comparison: node.label });
        }
      }

      function graphSelectionChanged(node, edges) {
        //load node into right panel
        console.log(node, 'graph selection changed');
        if (node) {
          loadComparison(node)
        } else {
          loadNode(vm.node);
        }
     
      }

      function swapNodes() {
        $state.go('explore.compare', { node: vm.comparison.label, comparison: vm.node.label });

      }

      function nodeActivated(node) {
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
