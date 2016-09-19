(function() {
  'use strict';

  angular.module('neograph.node.image.select.controller', [])
    .controller('NodeImageSelectCtrl', controller);

  function controller(nodeManager, neo, modal) {

    var vm = this;
    var modalId = 'node.image.select';
    vm.onSelected = onSelected;
    vm.selectConfirm = selectConfirm;
    vm.getMorePictures = getMorePictures;
    vm.filterChanged = filterChanged;
    vm.canGetMorePictures = false;
    vm.pictures = [];
    vm.more = [];
    vm.filters = [];
    vm.enabledFilters = [];

    activate();

    var pageNum = 1;
    var pageSize = 20;
    var currentFilters = [];


    function activate() {
      vm.node = modal.getData(modalId).node;
      getFilters();
      getPictures();
    }

    function filterChanged(filters) {
      console.log(filters);
      if (filters) {
        vm.pictures = [];
        pageNum = 1;
        currentFilters = filters;
        getPictures();
      }
    }

    function getPictures() {
      var labels = [vm.node.label];
      if (currentFilters && currentFilters.length) {
        labels = labels.concat(currentFilters);
      }
      console.log(labels);
      var query = {labels: labels};
      var options = {pageNum: pageNum, pageSize: pageSize};
      neo.searchPictures(query, options)
        .then(function(pictureData) {

          vm.canGetMorePictures = pageNum * pageSize < pictureData.count;
          if (pageNum === 1) {
            vm.pictures = pictureData.items;
          } else {
            vm.more = pictureData.items;
          }

          console.log(vm.pictures);

          if (currentFilters && currentFilters.length) {
            neo.getDistinctLabels(labels)
              .then(function(distinctLabels) { 
                vm.enabledFilters = distinctLabels; 
              });
          } else {
            vm.enabledFilters = [];
          }


        });
    }

    function getFilters()  {
      neo.getDistinctLabels([vm.node.label])
        .then(function(distinctLabels) {
          /*
          // Remove filter for this node as it is duplicating
          labels.forEach(function(label) { 
            distinctLabels.splice(distinctLabels.indexOf(label), 1); 
          });
          */
          vm.filters = distinctLabels;
        });
      
    }

    function onSelected(picture) {
      vm.selectedPicture = picture;
    }

    function selectConfirm() {
      modal.close(modalId, vm.selectedPicture);
    }

    function getMorePictures() {
      if (vm.canGetMorePictures) {
        pageNum +=1;
        getPictures();
      }
    }

  }
})();
