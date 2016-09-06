angular.module('neograph.query',
['neograph.query.presets', 'neograph.queryInput', 'neograph.query.graph'])
.factory('queryFactory', queryPresets => {
  function Query(key, render) {
    this.key = key;
    this.name = key;
    this.render = render;
    this.data = {
      nodes: {},
      edges: {}
    };
    this.body = { q: '', connectAll: false };
    this.presets = queryPresets;
    this.generators = {};

    if (render === 'Graph') {
      this.generators.nodeGraph = {
        type: 'nodeGraph',
        options: {}
      };
    }

    if (render === 'Grid') {
      this.generators.nodeFilter = {
        type: 'nodeFilter',
        options: {}
      };
      this.generators.favouritesFilter = {
        type: 'favouritesFilter',
        options: {}
      };
    }
  }
  return {
    create: (key, type) => new Query(key, type)
  };
}).
factory('queryService', queryFactory => {
  let active = queryFactory.create('Query', 'Graph');
  const queries = {};
  queries[active.key] = active;

  const listeners = [];
  const publishChange = () => {
    for (let i = 0; i < listeners.length; i ++) {
      listeners[i](active);
    }
  };
  return {
    queries,
    active,
    update: key => {
      active = queries[key];
      publishChange();
    },
    subscribe: callback => listeners.push(callback)
  };
}).
controller('QueryCtrl', ($scope, queryService) => {
  queryService.subscribe(active => { $scope.active = active; });
  $scope.queries = queryService.queries;
  $scope.active = queryService.active;
  $scope.selectedTab = $scope.active.key;
  $scope.$watch('selectedTab', key => queryService.update(key));
});
