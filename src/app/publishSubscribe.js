angular.module('publishSubscribe', [])
.service('PubSubService', () => ({
  init: scope => {
    // Keep a dictionary to store the events and its subscriptions
    const publishEventMap = {};
    // Register publish events
    scope.constructor.prototype.publish = function publish() {
      // Get event and rest of the data
      const args = [].slice.call(arguments);
      const evnt = args.splice(0, 1);
      if (!publishEventMap[evnt]) {
        publishEventMap[evnt] = [];
      }
      // Loop though each handlerMap and invoke the handler
      publishEventMap[evnt].forEach(handlerMap => {
        handlerMap.handler.apply(this, args);
      });
    };
    // Register Subscribe events
    scope.constructor.prototype.subscribe = function subscribe(evnt, handler) {
      const handlers = (publishEventMap[evnt] = publishEventMap[evnt] || []);
      // Just keep the scopeid for reference later for cleanup
      handlers.push({ $id: this.$id, handler });
      // When scope is destroy remove the handlers that it has subscribed.
      this.$on('$destroy', () => {
        for (let i = 0, l = handlers.length; i < l; i++) {
          if (handlers[i].$id === this.$id) {
            handlers.splice(i, 1);
            break;
          }
        }
      });
    };
  }
})
);
