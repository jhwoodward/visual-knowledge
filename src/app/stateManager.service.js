(function() {
  'use strict';

  angular.module('neograph.stateManager.service',[])
    .factory('stateManager', service);

  function service(nodeService, neo, $state) {

    var listeners = {};
    var state = {
      node: undefined,
      nodeEditing: false,
      nodeActiveTab: undefined,
      comparison: undefined,
      comparisonEditing: false,
      comparisonActiveTab: undefined
    };
 
   
    function raiseEvent(eventName) {
      if (listeners[eventName]) {
        listeners[eventName].forEach(function(cb) {
          cb(state);
        })
      }
    }

    function getPictures(node) {
      var labels = [node.label];
      var query = {labels: labels};
      var options = {pageNum: 1, pageSize: 10};
      return neo.searchPictures(query, options)
        .then(function(pictureData) {

         // var canGetMorePictures = pageNum * pageSize < pictureData.count;
          return  pictureData.items;

        });
    }

    function getComparisons() {
      if (state.node && state.comparison) {
        neo.getVisual(state.node, state.comparison)
          .then(function(comparisons) {
            state.pairedPictures = comparisons;
            raiseEvent('pairedPictures');
          });
      }
    }

    var api = {
      go: {
        node: function (node) {
          if (node && node.label) {
            $state.go('explore.node', { node: node.label });
            api.clearComparison();
          } 
        },
        comparison: function (node) {
          if (node && node.label) {
            $state.go('explore.node.comparison', { comparison: node.label });
          }
        },
        compare: function (node, comparison) {
          $state.go('explore.compare', { node: node.label, comparison: comparison.label });
        },
        swap: function() {
          if (state.node && state.comparison) {
            $state.go('explore.compare', { node: state.comparison.label, comparison: state.node.label });
          }
        }
      },
      load: function (id) {
        return nodeService.get(id).then(function (node) {
          state.node = node;
          raiseEvent('loaded');
          raiseEvent('comparison');

          getPictures(node).then(function(pictures) {
            state.nodePictures = pictures;
            raiseEvent('nodePictures');
            getComparisons();
          });

        

          return node;
        });
      },
      compare: function(id) {
        return nodeService.get(id).then(function (node) {
          state.comparison = node;
          raiseEvent('comparison');

          getPictures(node).then(function(pictures) {
            state.comparisonPictures = pictures;
            raiseEvent('comparisonPictures');
            getComparisons();
          });

          return node;
        });
      },
      clearComparison: function() {
        state.comparison = undefined;
        raiseEvent('comparison');
      },
      setNodeActiveTab: function(tab) {
        state.nodeActiveTab = tab;  
        raiseEvent('tab');
      },
      setComparisonActiveTab: function(tab) {
        state.comparisonActiveTab = tab;
        raiseEvent('tab');
      },
      setNodeEditing: function(editing) {
        state.nodeEditing = editing;
        raiseEvent('editing');
      },
      setComparisonEditing: function(editing) {
        state.comparisonEditing = editing;
        raiseEvent('editing');
      },
     
      new: function () {
        state.node = nodeService.create();
        state.nodeEditing = true;
        raiseEvent('new');
        raiseEvent('loaded');
        raiseEvent('editing');
        return state.node;
      },
      subscribe: function(eventName, cb) {
        if (!listeners[eventName]) {
          listeners[eventName] = [];
        }
        listeners[eventName].push(cb);

        if (eventName === "loaded" && state.node ||
            eventName === "tabChanged" && state.tab
        ) {
          cb(state);
        }
      },
      setActiveTab: function(tab) {
        state.tab = tab;
        raiseEvent('tabChanged')
      }
    };
    return api;

  }
})();