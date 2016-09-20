(function () {
    'use strict';

  angular.module('neograph.common', [
    'neograph.common.filter',
    'neograph.common.pictures',
    'neograph.common.labels',
    'neograph.common.network',
    'neograph.common.nodeArray',
    'neograph.common.typeahead',
    'neograph.common.typeaheadSimple',
    'neograph.common.focusTo',
    'neograph.common.modal',
    'neograph.common.scrollBottom',
    'neograph.common.onImageLoaded'
  ]).config(config);

  function config(modalProvider) {

    modalProvider.add('node.images', {
      templateUrl: 'app/node/image/node.images.modal.html',
      controller: 'NodeImagesModalCtrl',
      controllerAs: 'vm',
      animation: false,
      backdrop: 'static',
      size: 'lg'
    });
  }

})();
