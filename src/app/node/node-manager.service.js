(function() {
  'use strict';

  angular.module('neograph.nodeManager.service',[])
    .factory('nodeManager', service);

  function service(nodeService) {

    var listeners = {};
    var state = {
      node: undefined,
      tab: undefined
    };
 
   
    function raiseEvent(eventName) {
      if (listeners[eventName]) {
        listeners[eventName].forEach(function(cb) {
          cb(state);
        })
      }
    }

    var api = {
      load: function (id) {
        return nodeService.get(id).then(function (node) {
           state.node = node;
           raiseEvent('loaded');
           return node;
        });
      },
      compare: function(id) {
        return nodeService.get(id).then(function (node) {
           state.comparison = node;
           raiseEvent('comparison');
           return node;
        });
      },
      new: function () {
        state.node = nodeService.create()
        raiseEvent('new');
        raiseEvent('loaded');
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