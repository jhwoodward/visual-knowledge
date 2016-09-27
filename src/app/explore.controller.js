(function() {

  angular.module('neograph.explore.controller', [])
    .controller('ExploreCtrl', function($scope, $state, $stateParams, stateManager, modal, $timeout) {
      var vm = this;
      vm.leftPanelVisible = true;
      vm.rightPanelVisible = false;
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

      vm.leftPanelHalf = false;
      vm.rightPanelHalf = false;
      vm.leftPanelWide= false;
      vm.rightPanelWide = false;
      vm.leftPanelFull = false;
      vm.rightPanelFull = false;

      vm.panelNoShadow = true;

      vm.viewPictures = viewPictures;
      vm.closePictures = closePictures;
      vm.pairedPictures = [];

      vm.swapNodes = swapNodes;

      var blank = '';

      var slideInterval = 12000;

      vm.toggleLeftPanel = function() {
        vm.leftPanelVisible = !vm.leftPanelVisible;
      }
      vm.toggleRightPanel = function() {
        vm.rightPanelVisible = !vm.rightPanelVisible;
      }

      stateManager.subscribe('loaded', function(state) {
        vm.node = state.node;
        if (vm.node && vm.node.image) {
          vm.nodeImageUrl = vm.node.image.full.url;
        } else {
          vm.nodeImageUrl = blank;
        }
      });

      stateManager.subscribe('comparison', function(state) {
        vm.comparison = state.comparison;

        if (vm.comparison && vm.comparison.image) {
          vm.comparisonImageUrl = vm.comparison.image.full.url;
          vm.rightPanelVisible = true;
        } else if (vm.comparison) {
          vm.rightPanelVisible = true;
        } else {
          vm.comparisonImageUrl = blank;
          vm.rightPanelVisible = false;
        }
        
      });

      stateManager.subscribe('tab', function(state) {
        console.log(state,'tab');
        vm.comparisonActiveTab = state.comparisonActiveTab;
        vm.nodeActiveTab = state.nodeActiveTab;
      });

      stateManager.subscribe('editing', function(state) {
        vm.leftPanelEditing = state.nodeEditing;
        vm.rightPanelEditing = state.comparisonEditing;
      });

      stateManager.subscribe('nodePictures', function(state) {
        vm.nodePictures = state.nodePictures;
      });
      stateManager.subscribe('comparisonPictures', function(state) {
        vm.comparisonPictures = state.comparisonPictures;
      });

      stateManager.subscribe('pairedPictures', function(state) {
        vm.pairedPictures = state.pairedPictures;
        nodeSlideShowOn = false;
        comparisonSlideShowOn = false;
        pairedSlideShowOn = true;
        showNextPair();
      });


      var nodeSlideShowOn = false;
      var comparisonSlideShowOn = false;
      var pairedSlideShowOn = false;
      var nodeSlideTimeout;
      var comparisonSlideTimeout;
      var pairedSlideTimout;
      
      function closePictures() {
        nodeSlideShowOn = false;
        comparisonSlideShowOn = false;
        pairedSlideShowOn = false;
        vm.leftPanelHalf = false;
        vm.rightPanelHalf = false;
        vm.leftPanelFull = false;

/*
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
*/

      }

      function viewPictures() {
        if (vm.pairedPictures.length) {
          vm.leftPanelHalf = true;
          vm.rightPanelHalf = true;
          vm.panelNoShadow = true;
          pairedSlideShowOn = true;
          showNextPair();
        }
        else if (vm.comparison && vm.node) {
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

      function Queue(pictures) {
        this.index = 0;
      }

      var currentPairedIndex = 0;
      function showNextPair() {
        if (pairedSlideShowOn && vm.pairedPictures.length) {
          if (currentPairedIndex > vm.pairedPictures.length -1) {
            currentPairedIndex = 0;
          }
          vm.nodeImageUrl = vm.pairedPictures[currentNodeImageIndex].from.image.full.url;
          vm.comparisonImageUrl = vm.pairedPictures[currentNodeImageIndex].to.image.full.url;
          currentPairedIndex += 1;
          $timeout(showNextPair, slideInterval);
        } else {
          pairedSlideShowOn = false;
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
        stateManager.go.node(node);
      }

      function loadComparison(node) {
        stateManager.go.comparison(node);
      }

      function swapNodes() {
        stateManager.go.swap();
      }



    });

})();
