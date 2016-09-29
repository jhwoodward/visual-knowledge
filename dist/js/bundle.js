(function() {

  angular.module('neograph', [
    'templates',
    'ui.router',
    'ngSanitize',
    'ngAnimate',
    'neograph.common', 
    'common.filters',
    'neograph.edge',
    'neograph.interaction',
    'neograph.layout',
    'neograph.neo',
    'neograph.node',
    'neograph.search',
    'neograph.graph',
    'neograph.routes',
    'neograph.constant',
    'neograph.explore.controller',
    'neograph.stateManager.service',
    'ui.bootstrap'
    ]);

})();

(function() {

  angular.module('neograph.explore.controller', [])
    .controller('ExploreCtrl', ["$scope", "$state", "$stateParams", "stateManager", "modal", "$timeout", function($scope, $state, $stateParams, stateManager, modal, $timeout) {
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



    }]);

})();

(function() {

  angular.module('neograph.routes', [])
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        createCtrl.$inject = ["stateManager"];
        nodeCtrl.$inject = ["$stateParams", "stateManager"];
        comparisonCtrl.$inject = ["$stateParams", "stateManager"];
      $stateProvider
        .state('explore', { 
          url:'/explore',
          views: {
            '@': {
              templateUrl:'app/explore.html',
              controller: 'ExploreCtrl as vm'
            }
          }
        })
        .state('explore.create', {
          url:'/create',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="true" />',
              controller: createCtrl,
              controllerAs: 'vm'
            }
          }
        })
        .state('explore.node', {
          url:'/:node',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: nodeCtrl,
              controllerAs: 'vm'
            }
          }
        })
        .state('explore.node.comparison', {
          url:'/:comparison',
          views: {
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: comparisonCtrl,
              controllerAs: 'vm'
            }
          }
        })    
        .state('explore.compare', {
          url:'/:node/:comparison',
          views: {
            'leftpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing" on-tab-changed="vm.onTabChanged(tab)" on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: nodeCtrl,
              controllerAs: 'vm'
            },
            'rightpanel@explore': {
              template: '<node node="vm.node" editing="vm.editing"  on-tab-changed="vm.onTabChanged(tab)"  on-toggle-edit="vm.onToggleEdit(editing)" />',
              controller: comparisonCtrl,
              controllerAs: 'vm'
            }
          }
        });


        function nodeCtrl($stateParams, stateManager) {
          var vm = this;
          vm.node = {};
          vm.onTabChanged = onTabChanged;
          vm.onToggleEdit = onToggleEdit;

          stateManager.load($stateParams.node).then(function(node) {
            console.log(node);
            vm.node = node;
          });

          function onTabChanged(tab) {
            stateManager.setNodeActiveTab(tab);
          }
          function onToggleEdit(editing) {
            vm.editing = editing;
            stateManager.setNodeEditing(editing);
          }
        }

        function comparisonCtrl($stateParams, stateManager) {
          var vm = this;
          vm.node = {};
          vm.onTabChanged = onTabChanged;
          vm.onToggleEdit = onToggleEdit;

          stateManager.compare($stateParams.comparison).then(function(node) {
            vm.node = node;
          });

          function onTabChanged(tab) {
            stateManager.setComparisonActiveTab(tab);
          }
          function onToggleEdit(editing) {
            vm.editing = editing;
            stateManager.setComparisonEditing(editing);
          }
        }

        function createCtrl(stateManager) {
          var vm = this;
          vm.node = stateManager.new();
          stateManager.setNodeEditing(true);
        }

      $urlRouterProvider.otherwise('/explore');
    }]);

})();

(function() {

  angular.module('neograph.settings', [])
    .factory('settings', function() { 
      
      return {
        apiRoot: 'http://localhost:1337' 
      };
    
    });

})();


(function() {
  'use strict';

  service.$inject = ["nodeService", "neo", "$state"];
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
(function() {

  angular.module('templates', []);

})();
(function() {

    controller.$inject = ["$scope"];
    childController.$inject = ["$scope", "$stateParams"];
  angular.module('neograph.edge.controller', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .controller('EdgeCtrl', controller)
    .controller('ChildEdgeCtrl', childController);

    function controller ($scope) {
      var vm = this;
      vm.tabs = ['Properties'];
      vm.selectedTab = 'Properties';
      vm.selectTab = function (tab) {
        vm.selectedTab = tab;
      };
    }

    function childController ($scope, $stateParams) {
      var vm = this;
      if ($stateParams.edge) {
        vm.edge = JSON.parse($stateParams.edge);
      }
    }

  })();

(function() {

  angular.module('neograph.edge', [
    'neograph.edge.routes', 
    'neograph.edge.controller',
    'neograph.edge.edit.properties.controller'
  ]);


})();
   
(function() {

  angular.module('neograph.edge.routes', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .config(["$stateProvider", function ($stateProvider) {
      $stateProvider
      .state('admin.edge', {
        url:'/edge/:edge',
        views: {
          'panel@admin':{
            templateUrl:'app/edge/edge.html',
            controller: 'EdgeCtrl as vm'
          },
          'header@admin.edge':{
            templateUrl:'app/edge/edge.header.html',
            controller: 'EdgeCtrl as vm'
          },
          'properties@admin.edge':{
            templateUrl:'app/edge/properties/edge.properties.html',
            controller: 'ChildEdgeCtrl as vm'
          }
        }
      })
      .state('admin.edge.edit', {
          url:'/edit',
          views: {
            'header@admin.edge':{
              templateUrl:'app/edge/edge.edit.header.html',
              controller: 'EdgeCtrl as vm'
            },
            'properties@admin.edge':{
              templateUrl:'app/edge/properties/edge.edit.properties.html',
              controller:'EditEdgeCtrl as vm'
            }
          }
        });
    }]);

})();
(function () {
    'use strict';

  config.$inject = ["modalProvider"];
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

(function() {
  'use strict';
  angular
    .module('neograph.constant', [])
    .constant('_', window._);
})();
(function(){

  angular.module('neograph.common.filter', [])
    .directive('filter', function () {
      return {
        restrict: 'E',
        templateUrl: 'app/common/filter.html',
        scope: {
          labels: '=',// an array of labels
          enabled: '=',
          onChange: '&'
        },
        link: function (scope, $element, $attrs) {

          scope.filters = {};
          scope.toggle = toggle;
          scope.getClass = getClass;

          scope.$watch('labels', function (labels) {
            var filters = {};
            angular.forEach(labels, function (f) {
              filters[f] = 0;
            });
            scope.filters = filters;
          });

          function getClass(value) {
            if (value === 1)
              return 'label-success';
            else if (value === 0)
              return 'label-info';
            else return '';
          };

          function toggle (label) {
            if (scope.filters[label] === 1) {
              scope.filters[label] = 0;
            } else if (scope.filters[label] == 0) {
              scope.filters[label] = 1;
            } else if (scope.filters[label] == -1) {
              for (var f in scope.filters) {
                scope.filters[f] = 0;
              }
              scope.filters[label] = 1;
            }
            var labels = [];
            for (var f in scope.filters) {
              if (scope.filters[f] === 1) {
                labels.push(f);
              }
            }
            scope.onChange({ filters: labels });
          };

          scope.$watch('enabled', function (labels) { // labels = selectable labels following filtering
            if (labels && labels.length) {
              for (var f in scope.filters) {
                if ($.inArray(f, labels) == -1) { // disable filter if not in list
                  scope.filters[f] = -1;
                } else if (scope.filters[f] == -1) { // enable filter if in list and previously disabled
                  scope.filters[f] = 0;
                }
              }
            } else {
              for (var f in scope.filters) {
                scope.filters[f] = 0;
              }
            }
          });
        }
      };
    });

})();

(function() {
  'use strict';
    directive.$inject = ["$timeout"];
  angular.module('neograph.common.focusTo', [])
    .directive('focusTo', directive);

    function directive($timeout) {
      return {
        restrict: 'A',
        link: link
      };

      function link(scope, element, attrs) {

        var focusElement = element.closest(attrs.focusTo);
        element.on('focus', function(){
          focusElement.addClass('focus');
          focusElement.removeClass('unfocus');
        })
        element.on('blur', function(){
          focusElement.removeClass('focus');
        })
      }
    }
})();

angular.module('neograph.common.images', ['neograph.neo', 'neograph.session'])
.directive('images', ['neo', 'session', function (neo) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'app/common/images.html',
    scope: {
      editing: '='
            , nodes: '=' // must be an array to preserve sort order
            , active: '='
            , updatemasonry: '='// required to update masonry on resize

    },
    link: function ($scope, $element, $attrs) {

      var $ul = $($element).find('ul');

      $scope.items = {};

      $scope.$watch('nodes', function (nodes) {
        $ul.removeClass('masonryLoaded');
        $scope.items = nodes;
        applyMasonry();

      });

      $scope.$watch('updatemasonry', function () {
        if ($ul.hasClass('masonry')) {
          $ul.masonry('reload');
        }
      });

      $scope.$watch('active', applyMasonry);

      var applyMasonry = function () {

            //    if ($scope.updatemasonry) {

        setTimeout(function () {

          if ($ul.hasClass('masonry')) {
            $ul.masonry('reload');
          }
          else {
            $ul.masonry({
              nodeselector: 'li'
                                // ,
                                // columnWidth: 1,
                                // "isFitWidth": true
            });
          }

          $ul.addClass('masonryLoaded');


        }, 100);
             //   }
           //     else {
                 //   $ul.addClass('masonryLoaded');
           // /     }
      };

      $scope.navigate = function (label) {
        $scope.publish('query', {
          name: label,
          view: label,
          type: 'Grid',
          queryGenerator: { id: 'nodeFilter', options: { node: { Label: label } } }
        });

      };

      $scope.selectAll = function () {

        if ($ul.find('li.ui-selected').length < $ul.find('li').length) {
          $ul.find('li').addClass('ui-selected');
          $scope.selected = $scope.nodes.map(function (e, i) { return i; });
        }
        else {
          $ul.find('li').removeClass('ui-selected');
          $scope.selected = [];
        }
      };

/*
            // this assumes that we are looking at a view of not deleted items
      $scope.subscribe('deleted', function (params) {

                // alternatively i could have a deep watch on nodearray and update that
        removeItems(params.selection.nodes);
      });

            // this assumes that we are looking at a view of deleted items
      $scope.subscribe('restored', function (params) {

                // alternatively i could have a deep watch on nodearray and update that
        removeItems(params.selection.nodes);
      });
*/

      var removeItems = function (items) {

        if (items && items.length) {
          angular.forEach(items, function (node) {
            var sel = "li[nodeid='" + node.id + "']";
            console.log(sel);
            $ul.find(sel).remove();
          });
          applyMasonry();

        }
      };



      $scope.getFilterClass = function (value) {

        if (value === 1)
          return 'label-success';
        else if (value === 0)
          return 'label-info';
                else return '';
      };

      $scope.toggleFilter = function (label) {
        if ($scope.filters[label] == 1) {
          $scope.filters[label] = 0;
          refreshContent();
        }
        else if ($scope.filters[label] == 0) {
          $scope.filters[label] = 1;
          refreshContent();
        }
                else if ($scope.filters[label] == -1) {
                  for (var f in $scope.filters) {
                    $scope.filters[f] = 0;
                  }

                  $scope.filters[label] = 1;
                  refreshContent();
                }


      };

            // triggered by selecting a filter
      $scope.$watch('filterBy', function (label) {
        if (label) {
          $scope.filters[label] = 1;
          $scope.filterBy = undefined;
          refreshContent();
        }

      });



            // triggered by selecting one or more images
      $scope.$watch('selected', function (selected) { // NB selected is now an array of node indexes

        if (selected && selected.length) {


          var selectedNodes = selected.map(function (i) {
            return $scope.nodes[i];
          });

            // NB if there are multiple instances of the images directive (as typically) it wont be possible ot know which one the event was sent from
                    // but mainly we need to know that it wasnt sent from the graph or controller, as images currently doesnt substribe to selected event
    //      $scope.publish('selected', { sender: 'Images', selection: { nodes: selectedNodes } });



        }


      });

    
    


    }
  };
}]);

angular.module('neograph.common.labels', ['neograph.neo', 'neograph.utils'])
.directive('labels', ['neo', 'utils', function (neo, utils) {
  return {
    restrict: 'E',
    templateUrl: 'app/common/labels.html',
    scope: {
      node: '=?'
            ,
      labels: '=?'
            ,
      items: '=?'
            ,
      navpath: '@'
            ,
      highlight:'@?'
    },
    link: function ($scope, $element, $attrs) {

      $scope.$watch('node', function (node) {
        if (node) {
          $scope.labels = $scope.node.labels;
        }

      });

      $scope.$watch('items', function (items) {
        if (items) {
          $scope.labels = $scope.items.map(function (x) { return x.label; });
        }

      });




      $scope.getClass = function (label) {
        if (label === $attrs['highlight']) {
          return 'label-warning';
        }
        else
                return utils.getLabelClass($scope.node, label);
      };





    }
  };
}]);

(function() {
    'use strict';
    modalClose.$inject = ["modal"];
    modalOpen.$inject = ["modal"];
    angular.module('neograph.common.modal',[])
      .provider('modal', modalProvider)
      .directive('modalClose', modalClose)
      .directive('modalOpen', modalOpen);

    /* @ngInject */
    function modalProvider() {
        /* jshint validthis:true */

        var _map = {};
        var current;
        var passedData;
        var service = {
            open: modalOpen,
            close: modalClose,
            add: modalAdd,
            getData: getData
        };
        var bootstrapModal;

        /* @ngInject */
        this.$get = ["$uibModal", function($uibModal) {
            bootstrapModal = $uibModal;
            return service;
        }];
        this.$get.$inject = ["$uibModal"];

        this.add = modalAdd;

        function modalAdd(name, obj) {
            if (_map[name]) {
                throw new Error(name, 'already existing');
            }
            _map[name] = {};
            _map[name].config = obj;
            return this;
        }

        function getData(name) {
            name = name || current;
            if (!_map[name]) {
                return null;
            }
            return passedData;
        }

        function modalOpen(name, data) {
            if (!_map[name]) {
                return false;
            }
            current = name;
            passedData = data;
            _map[name].instance = bootstrapModal.open(_map[name].config);
            return _map[name].instance.result;
        }

        function modalClose(name, result) {
            name = name || current;
            if (!_map[name] || !_map[name].instance) {
                return false;
            }
            _map[name].instance.close(result);
            current = null;
            passedData = null;
            delete _map[name].instance;
            return true;
        }
    }
    /* @ngInject */
    function modalClose(modal) {
        return {
            scope: false,
            restrict: 'A',
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
                $element.bind('click', function() {
                    var name = $attrs.modalClose;
                    var reason = $attrs.dismiss;
                    modal.close(name, reason);
                });
            }]
        };
    }
    /* @ngInject */
    function modalOpen(modal) {
        return {
            scope: false,
            restrict: 'A',
            controller: ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
                $element.bind('click', function() {
                    var name = $attrs['modalOpen'];
                    modal.open(name);
                });
            }]
        };
    }

}());

angular.module('neograph.common.network', [])
.directive('network', function () {
  return {

    restrict:'E',
    template:'<div></div>',
    scope:{
      graph:'=',
      options:'=',
      network:'=',
      width:'@',
      height:'@'
    }
        ,
    link:function ($scope, $element) {

      $scope.network = new vis.Network($element, $scope.graph, $scope.options);
      $scope.network.setSize($scope.width + 'px', $scope.height + 'px');
    }


  };

});

angular.module('neograph.common.nodeArray', ['neograph.utils'])
    .directive('nodeArray', ['utils', function (utils) {
      return {
        replace: true,
        restrict: 'EA',
        templateUrl: 'app/common/nodeArray.html',
        scope: {
          items: '=',// an array of string or  items with label property
          enabled: '=',
          onselected: '&?',
          node: '=?',
          directbinding: '@?',// set this to false if passing in array of strings
          width: '@?'
        },
        link: function (scope, $element, $attrs) {

          var directBinding = $attrs['directbinding'] == 'false' ? false : true;
          scope.nodes = [];
          scope.$watch('items', onItemsChanged);
          $element.on('click', focusInput);
          scope.clickable = $attrs['onselected'] != undefined;
          scope.removeNode = removeNode;
          scope.addNode = addNode;
          scope.nodeClicked = onNodeClicked;
          scope.getClass = function (node) {
            return utils.getLabelClass(scope.node, node.label);
          };
          
          function focusInput() {
            $element.find('input').focus();
          }

          function onItemsChanged(items) {
            if (items && items.length) {
              if (items[0] && (items[0].label || items[0].lookup)) {
                scope.nodes = items;
              } else {
                directBinding = false;
                scope.nodes = items.map(function (e) { return { label: e }; });
              }
            } else {
              if (directBinding) {
                scope.nodes = items;
              } else {
                scope.nodes = [];
              }
            }
          }

          function onNodeClicked(node) {
            if ($attrs['onselected']) {
              scope.onselected({ item: node });
            }
          };

          function indexOf(node) {
            var ind = -1;
            $(scope.nodes).each(function (i, e) {
              if ((node.label && e.label === node.label) || node.lookup && e.lookup == node.lookup) {
                ind = i;
                return;
              }
            });
            return ind;
          };

          function addNode(node) {
               console.log(scope.nodes);
            if (indexOf(node) == -1) {
              scope.nodes.push(node);
              console.log(scope.nodes);
              if (!directBinding) {
                scope.items.push(node.label);
              }
            }
            // else highlight the node momentarily
          }

          function removeNode(node) {
            var ind = indexOf(node);
            if (ind > -1) {
              scope.nodes.splice(ind, 1);
              if (!directBinding) {
                scope.items.splice(scope.items.indexOf(node.label || node.lookup), 1);
              }
            }
          }
        }
      };
    }]);

(function(){

  angular.module('neograph.common.onImageLoaded', [])
    .directive('onImageLoaded', function () {
      return {
        restrict: 'A',
        scope: {
          onImageLoaded: '&',
          onImageError: '&?'
        },
        link: function (scope, element, attrs) {
          element.bind('load', function() {
            scope.$apply(function() {
              scope.onImageLoaded();
            });
            
          });
          element.bind('error', function(err) {
            if (scope.onImageError) {
              scope.onImageError(err);
            }
          });
        }
      };
    });

})();

(function(){
  directive.$inject = ["$timeout", "$window", "_"];
angular.module('neograph.common.pictures',[])
  .directive('pictures', directive);

  function directive($timeout, $window, _) {
    return {
      replace: true,
      restrict: 'EA',
      templateUrl: 'app/common/pictures.html',
      scope: {
        pictures: '=', // must be an array to preserve sort order
        append: '=',
        onSelected: '&?',
        imageWidth: '=?'
      },
      link: linkFn
    };

    function linkFn(scope, element) {

      scope.imageWidth = scope.imageWidth || 236;

      scope.items = [];
      scope.onImageLoaded = onImageLoaded;

      $($window).on('resize', _.debounce(applyMasonry));

      var listContainer = $(element).find('ul');

      scope.$watch('pictures', function (pictures) {
        scope.items = pictures.map(function(p){ p.image.loaded = false; return p;});
        applyMasonry();
      });

      function addPictures(pictures) {
        pictures.forEach(function(p){
          p.image.loaded = false;
          scope.items.push(p);
        });
      }

      scope.$watch('append', function (pictures) {
        if (pictures && pictures.length) {
          addPictures(pictures);
          applyMasonry();
        }
      });

      function applyMasonry() {
        $timeout(function() {
          if (listContainer.hasClass('masonry')) {
            listContainer.masonry('reload');
          }
          else {
            listContainer.masonry({
              nodeselector: 'li'
            });
          }
        });
      }

      function onImageLoaded(picture) {
        picture.image.loaded = true;
      }

      scope.$watch('selected', function (selectedIndices) { // NB selected is now an array of node indexes
        if (selectedIndices && selectedIndices.length === 1) {
          var selectedPicture = scope.items[selectedIndices[0]];
          scope.onSelected({picture: selectedPicture});
        }
      });


    }
  }

})();
(function(){

  angular.module('neograph.common.scrollBottom', [])
    .directive('scrollBottom', function () {
      return {
        restrict: 'EA',
        scope: {
          scrollBottom: '&'
        },
        link: function (scope, element, attrs) {

          var offset = 70;
          element.on('scroll', function() {
            if(element.scrollTop() + element.innerHeight() >= element[0].scrollHeight - offset) {
                scope.scrollBottom();
            }
          });
        
        }
      };
    });

})();

angular.module('neograph.common.typeahead', ['neograph.utils', 'neograph.node.service'])
    .directive('typeahead', ['utils', 'nodeService', function (utils, nodeService) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          choice: '=?',   // the choice should be an object for 2 way binding with label property
          watchvalue: '=?',  // watchvalue should be a text string  -just for updating the textbox value when the value changes, not fed back
          text: '=?', // to feed back the text value when it changes (when no item has been selected)
          restrict: '=?', // options to retrict the items that can be selected = Type,Predicate,User,custom object array with label property
          onselected: '&?',
          autosize: '@?'
        },
        template: '<input type="text" class="form-control" />',
        link: function (scope, element, attrs) {

          var placeholderDefault = 'Node...';
          var itemSelected = false;
          var restrict = attrs['restrict'];

          element
            .typeahead({
              source: getSource(),
              matcher: matcher,
              sorter: sorter,
              highlighter: highlighter,
              updater: updater
            })
            .attr('placeholder', attrs['placeholder'] || placeholderDefault)
            .on('keydown', selectIfEnterPressed);

          scope.$watch('choice', setChoice);
          scope.$watch('restrict', setSource, true);
          if (!attrs['choice']) {
            scope.$watch('watchvalue', setWatchvalue);
          }

           if (attrs['autosize']) {

            element.css({ width: '10px' });
            element.attr('placeholder', '+');
            element.on('focus', function () {
              element.css({ width: '100px' });
              element.attr('placeholder', attrs['placeholder'] || placeholderDefault);
              setTimeout(function () {
                element.css({ width: '100px' });
                element.attr('placeholder', attrs['placeholder'] || placeholderDefault);
              }, 100);

            });
            element.on('blur', function () {
              element.css({ width: '10px' });
              element.attr('placeholder', '+');
              element.val('');
            });

          }

          function setChoice(node) {
            if (node) {
              element.val(node.label);
            }
          }

          function setWatchvalue(n) {
            element.val(n);
          }

          function selectIfEnterPressed(e) {
            itemSelected = false;
            if (e.keyCode == 13) { // enter
              setTimeout(function () {
                scope.$apply(function () {
                  if (!itemSelected) {
                    scope.text = element.val();
                    element.val('');
                  }
                });
              }, 100);
            }
          }

          function updater(obj) {
            itemSelected = true;
            var item = JSON.parse(obj);
            scope.$apply(function () {
              if (attrs['choice']) {
                scope.choice = item;
              }
              if (attrs['onselected']) {
                scope.onselected({ item: item });
              }
            });
            if (!attrs['clearonselect']) {
              return item.label;
            }
          }
          
          function matcher (obj) {
            var item = JSON.parse(obj);
            var matchOn = item.lookup || item.label;
            return ~matchOn.toLowerCase().indexOf(this.query.toLowerCase());
          }

          function sorter(items) {
            var beginswith = [], caseSensitive = [], caseInsensitive = [], aItem, item;
            while (aItem = items.shift()) {
              var item = JSON.parse(aItem);
              if (!item.label.toLowerCase().indexOf(this.query.toLowerCase())) {
                beginswith.push(JSON.stringify(item));
              } else if (~item.label.indexOf(this.query)) {
                caseSensitive.push(JSON.stringify(item));
              } else { 
                caseInsensitive.push(JSON.stringify(item));
              }
            }
            return beginswith.concat(caseSensitive, caseInsensitive);
          }

          function highlighter(obj) {
            var item = JSON.parse(obj);
            var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
            var regex = new RegExp('(' + query + ')', 'ig');
            if (restrict === 'Predicate') {
              return new utils.Predicate(item.label).ToString().replace(regex, function ($1, match) {
                return '<strong>' + match + '</strong>';
              });
            } 
            if (restrict === 'Type') {
              return item.lookup.replace(regex, function ($1, match) {
                return '<strong>' + match + '</strong>';
              });
            } 
            var typeInfo = '<div class="typeahead-type-info">' + item.type + '</div>';
            return item.label.replace(regex, function ($1, match) {
                return '<strong>' + match + '</strong>';
              }) + typeInfo;
          }

          function setSource () {
            element.data('typeahead').source = getSource();
          }

          function getSource() {
            if (scope.restrict && 
              $.isArray(scope.restrict) && 
              scope.restrict.length > 0) {
              return arraySource;
            }
            if (restrict === 'Type') {
              return typeSource;
            } 
            if (restrict === 'Predicate') {
              return predicateSource;
            } 
            return nodeSource;
          }

          function predicateSource(query, process) {
            utils.getPredicates().then(function(predicates) {
              var predicateArray = [];
              Object.keys(predicates).forEach(function(key) {
                predicateArray.push(JSON.stringify(predicates[key]));
              });
              process(predicateArray);
            })
          }

          function typeSource(query, process) {
            utils.getTypes().then(function(types) {
              var typeArray = [];
              Object.keys(types).forEach(function(key) {
                typeArray.push(JSON.stringify(types[key]));
              });
              process(typeArray);
            })
          }

          function arraySource() {
            if (scope.restrict[0].label) {
              return scope.restrict.map(function (d) { return JSON.stringify(d); });
            } else {
              return scope.restrict.map(function (d) { return JSON.stringify({ label: d }); });
            }
          }

            // Globals & users or one or the other depending on value of restrict
          function nodeSource (query, process) {
            nodeService.search(query, restrict)
              .then(function (nodes) {
                process(nodes.map(function (d) {
                  return JSON.stringify(d);
                }));
              });
          };

        }
      };
  }]);

angular.module('neograph.common.typeaheadSimple', [])
.directive('typeaheadSimple', [function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ngModel: '=?',   // the choice should be an object for 2 way binding with Lookup property
      source: '='
    },
    template: '<input type="text" />',
    link: function ($scope, element, attrs) {

      var placeholderDefault = '';

      var $input = $(element);// .find('input');
      $input.attr('placeholder', attrs['placeholder'] || placeholderDefault);


      $input.typeahead({
        source: $scope.source,
        updater: function (item) {


          $scope.$apply(function () {


            $scope.ngModel = item;


          });



          return item;


        }
      });






    }
  };
}]);

(function() {
  'use strict';
  
  angular
    .module('common.filters.capitalize', [])
    .filter('capitalize', filterFunc);

  function filterFunc() {
    return function (input) {
      if (input != null) {
        input = input.toLowerCase();
        return input.substring(0, 1).toUpperCase() + input.substring(1);
      } else {
        return null;
      }
    };
  }

})();
(function() {
  'use strict';
  angular.module('common.filters', [
    'common.filters.startcase',
    'common.filters.capitalize'
  ])
  .filter('checkmark', function () {
    return function (input) {
      return input ? '\u2713' : '\u2718';
    };
  })
  .filter('predicate', function () {
    return function (input) {
      return input ? '\u2713' : '\u2718';
    };
  })
  .filter('lowercase', function() {
    return function (input) {
      if (input) {
        return input.toLowerCase().replace(/_/g,' ')
      } else {
        return null;
      }
      
    };
  })
  ;
})();
(function() {
  'use strict';

  filterFunc.$inject = ["_"];
  angular
    .module('common.filters.startcase', [])
    .filter('startcase', filterFunc);

  function filterFunc(_) {
    return function (input) {
      if (input != null) {
        return _.startCase(input);
      } else {
        return null;
      }
    };
  }
})();
(function() {
  'use strict';
    
  controller.$inject = ["$scope", "$timeout", "neo", "neoClient", "graphService", "stateManager"];
  angular.module('neograph.graph.controller',['neograph.node.service', 'ui.router'])
    .controller('GraphCtrl', controller);

  function controller($scope, $timeout, neo, neoClient, graphService, stateManager) {

    var vm = this;

    vm.graph = {
      nodes: new vis.DataSet(),
      edges: new vis.DataSet()
    };

    vm.onSelect = onSelect;
    vm.loadedNode = {};
    vm.loadedComparison = {};
    vm.graphql = graphql;
    vm.focus = focus;
    vm.getGraphNode = getGraphNode;


    activate();

    function activate() {
      $scope.$watch('vm.node', function(node) {
        if (node && node.id && node.id != vm.loadedNode.id) {
          vm.loadedNode = node;
          load(node);
        }
      });

      $scope.$watch('vm.comparison', function(node) {
        if (node && node.id && node.id != vm.loadedComparison.id) {
          vm.loadedComparison = node;
          load(node);
          loadConnections();
        }
      });
        
    }

    function focus(node) {
      if (node) {
        vm.vis.focus(node.id, {
          //scale: 1.5,
          animation: {
            duration: 2000,
            easingFunction: 'easeInOutCubic'
          }
        });
      }
    }

    var darkBlue = '#1a5d98';

    var loadedConnection=[];
/*
    function loadConnections() {
      if (vm.node && vm.comparison) {

        if (loadedConnection.indexOf(vm.node.id) === -1 || 
          loadedConnection.indexOf(vm.comparison.id) === -1) {

          neo.allShortest(vm.node.lookup, vm.comparison.lookup)
            .then(function(all) {
          
              neo.shortest(vm.node.lookup, vm.comparison.lookup)
                .then(function(shortest) {
                  clearHighlight();
                  var graphAll = graphService.toVisNetworkData(all);
                  highlight(graphAll, '#3373ab');//#5696ce
                  highlight(graphService.toVisNetworkData(shortest), darkBlue);//#3e82bd


                  loadedConnection = [vm.node.id, vm.comparison.id];


                  $timeout(function() {
                    console.log(vm.comparison.lookup,'focus');
                    focus(vm.comparison);
                  // fit(graphAll.nodes);
                    },800);
                });
            });
        }
      }
    }
    */

     function loadConnections() {
      if (vm.node && vm.comparison) {

        if (loadedConnection.indexOf(vm.node.id) === -1 || 
          loadedConnection.indexOf(vm.comparison.id) === -1) {
            neo.shortest(vm.node.lookup, vm.comparison.lookup)
              .then(function(shortest) {
                clearHighlight();
                highlight(graphService.toVisNetworkData(shortest), darkBlue);//#3e82bd
                loadedConnection = [vm.node.id, vm.comparison.id];

                $timeout(function() {
                  focus(vm.comparison);
                  },800);
              });
        }
      }
    }

    function fit(nodes) {
      vm.vis.fit({
        nodes: nodes.map(function(n){return n.id;}),
        //optionally supply array of node ids
        animation: {
              duration: 2000, easingFunction: 'easeInOutCubic'
        }
      
      });
    }

    function clearHighlight() {
      var highlightedNodes = vm.graph.nodes.get({filter: function(node) {return node.highlighted;}});
      highlightedNodes.forEach(function(node) {
        node.highlighted = false;
        _.extend(node,graphService.graphNodeFromNeoNode(node.data));
        vm.graph.nodes.update(node);
      });
      var highlightedEdges = vm.graph.edges.get({filter: function(edge) {return edge.highlighted;}});
      highlightedEdges.forEach(function(edge) {
        edge.highlighted = false;
        _.extend(edge, graphService.graphEdgeFromNeoEdge(edge.data));
        vm.graph.edges.update(edge);
      });
    }

    function highlight(data, colour) {

      data.nodes.forEach(function(node) {
        highlightNode(node, colour);
        vm.graph.nodes.update(node);
      });

      data.edges.forEach(function(edge) {
        edge.color = colour;
        edge.highlighted = true;
        vm.graph.edges.update(edge);
      });

    }

    function highlightNode(node, colour) {

      if (node) {
        var neoNode = node.data || node;
        if (neoNode.isPerson()) {
          node.color = { background:  colour };
        }
        if (!node.largeText) {
          node.font.color = colour;
        } else {
          node.font.color = '#5696ce';
        }
      
        if (parseInt(node.id) === parseInt(vm.node.id) || 
          parseInt(node.id) === parseInt(vm.comparison.id)) {
            node.font.size = 24;
        }
        node.highlighted = true;
        return node;
      }
    
    }
    
    function graphql() {

      var query = ` Person (lookup:"${vm.node.lookup}"  ) {
                        type_of {
                          lookup
                        }
                        influences {
                          lookup
                          type_of {
                            lookup
                          }
                            influences {
                              lookup
                              type_of {
                                lookup
                              }
                              influences {
                                lookup
                                type_of {
                                  lookup
                                }
                              }
                            }
                          }
                      }`;

      neo.graphql(query).then(function(data) {
        console.log(data);
      });
    }

    function getGraphNode(node) {

      var id = node.id || node;

      var search = vm.graph.nodes.get({ 
        filter: function(n) { 
        return parseInt(id) == parseInt(n.id); } 
      });
      if (search.length) return search[0];

      return undefined;
    }

  
    function highlightCurrentNode() {
      var currentNode = getGraphNode(vm.node);
      if (currentNode) {
        highlightNode(currentNode, darkBlue);
        vm.graph.nodes.update(currentNode);
      }
  
    }

    function updateQueryLog(node) {
      var graphNode = getGraphNode(node);
      if (graphNode) {
        graphNode.queries = graphNode.queries || [];
        _.extend(graphNode.queries, node.queries);
        vm.graph.nodes.update(graphNode);
      }
     

    }

    function onInput(graph, parentNode)  {

      console.dir({graph:graph,parentNode:parentNode},'oninput');

      if (!vm.graph.nodes.length) {
        vm.graph.nodes.add(graph.nodes);
        vm.graph.edges.add(graph.edges);

        $timeout(highlightCurrentNode);
        
        updateQueryLog(parentNode);

        return;
      }

    

      new Queue(vm.graph, graph, parentNode).next();

    }

    function Queue(existing, adding, parentNode) {

      this.parentNode = parentNode;
      this.adding = adding;
      this.existing = existing;

      this.newnodes = adding.nodes.filter(function(node) {
        return !existing.nodes.get(node.id);
      });
      this.newedges = adding.edges.filter(function(edge) {
        return !existing.edges.get(edge.id);
      });

    }
    Queue.prototype.next = function() {
      if (this.newnodes.length) {
        var node = this.newnodes.pop();

        //get edges connected to this node
        var edges = this.newedges.filter(function(e) { 

//really need to be able to make the spring slacker to avoid reshaping the graph too much when new nodes are added that link to existing ones
/*
          if (vm.graph.nodes.get(e.from) || vm.graph.nodes.get(e.to) ) {
            console.log('setting length');
            e.length = 3;
          } else {
            e.length  =1;
          }
*/
          return e.from === node.id || e.to === node.id;
        });

        this.existing.nodes.update(node);
        this.existing.edges.update(edges);

        //subtract any added edges from the newedges array
        this.newedges = this.newedges.filter(function(e) {
          return  edges.indexOf(e) === -1;
        });
        $timeout(this.next.bind(this), 200);
      } else {
        this.finished();
      }
    }

    Queue.prototype.finished = function() {
      // any remaining stray edges - why would they exist?
   //   this.existing.edges.update(this.newedges);
      //update graph node with query details
       updateQueryLog(this.parentNode, this.adding.query);
    }

    function fixNode(node) {

      node.fixed = true;
      vm.graph.nodes.update(node);
      $timeout(function(){
        var n = getGraphNode(node);
        n.fixed = false;
        vm.graph.nodes.update(n);
      }, 2000);

    }

    function getActiveQueryIndex(node) {
      var index  =-1;
      for (var i = 0;i < node.queries.length; i++) {
        var q = node.queries[i];
        if (q.results) {
          if (q.results.remaining.length > 0) {
            index = i;
            break;
          }
        } else {
          index = i;
          break;
        }
      }
      return index;
    }

    function load(node) {

      if (getGraphNode(node)) { 
        node = getGraphNode(node);
        console.log(node);
        node.position = vm.vis.getPositions([node.id])[node.id];
        fixNode(node);

        if (node.queries && node.queries.length) {
        
          var qIndex = getActiveQueryIndex(node);

          if (qIndex === -1) {
            node.color = {
              background: '#ccc',
              hover: '#ccc'
            };
            vm.graph.nodes.update(node);
            return; // all queries used update
          }
           

          var q = node.queries[qIndex];

          if (!q.results) { //active query not yet run
            executeQuery(node, qIndex, 3);
            return;
          } 
          var remaining = q.results.remaining.filter(function(node) {
            return !vm.graph.nodes.get(node.id);
          });
          if (!remaining.length) {
            q.results.remaining = [];
            vm.graph.nodes.update(node);
            return;
          }
       
          var taken = remaining.slice(0,3);
          taken.map(function(n) {
            n.x = node.position.x;
            n.y = node.position.y;
          });
          q.results.remaining = remaining.filter(function(n) { return taken.indexOf(n) === -1; });
          vm.graph.nodes.update(node);
          var graph = {
            nodes: taken,
            edges: q.results.total.edges
          };
          onInput(graph, node);
          return;
          
        }
      } 

      var data = node.data ? node.data : node;
      node.queries = graphService.getQueries(data);
      if (node.queries && node.queries.length) {
        var initialNodeTake = data.hasType('Provenance') ? 50:3;
        executeQuery(node, 0, initialNodeTake);
      }

    }

    function executeQuery(parentNode, index, take) {

      console.log( parentNode.lookup,'executeQuery');
      index = index || 0;

      if (index > parentNode.queries.length -1) {
        return;
      }

      var query = parentNode.queries[index];

      getData(query).then(function(data) {

        var networkData = graphService.toVisNetworkData(data);

     

        var newnodes = networkData.nodes.filter(function(node) {
          return !vm.graph.nodes.get(node.id.toString());
        });

        /*
        CAUSES PARENT NODE TO JUMP FOR SOME UNKNOWN REASON
        if (parentNode.position) {
          console.log(parentNode.position);
          newnodes.map(function(n) {
            n.x = parentNode.position.x;
            n.y = parentNode.position.y;
          });
        }
        */

        var taken = newnodes
          .sort(function() { 
            return 0.5  - Math.random() ;
            })
          .filter(function(n) {
            return n.id != parentNode.id;
          })
          .slice(0, take);

        //ensure parent node is also taken if not already in graph
        taken = taken.concat(newnodes.filter(function(n) {
          return n.id == parentNode.id;
        }));

        var remaining = newnodes.filter(function(n) { 
          return taken.indexOf(n) === -1; 
        });

      //  var takenEdges = networkData.edges.filter(function(edge) {
     //     return taken.filter(function(n) {} ).length;
     //   });

        query.results = { total: networkData, newNodes: newnodes.length, taken: taken, remaining: remaining };

        if (taken.length) {
          
          // create pseudo edges for creation relations
          if (query.name === 'Creation relation') {
            networkData.edges = newnodes
            .filter(function(n){
              return n.id != parentNode.id;
            })
            .map(function(n) {
              var pseudoEdge = { 
                id: parentNode.id + '-' + n.id,
                startNode: parentNode.id.toString(),
                endNode: n.id.toString(),
                type: "CREATION"
              };
              return graphService.graphEdgeFromNeoEdge(pseudoEdge);
            });
          }

          var graph = {
            nodes: taken,
            edges: networkData.edges
          };
          onInput(graph, parentNode);
        } else {

        //  if (query.connectAll) {
        //    connectAll(networkData.nodes);
       //   }

          //record query attempt on node if present in graph
          updateQueryLog(parentNode);

          //try the next query
          executeQuery(parentNode, index + 1, 3);
        }
      });
    }



    function connectAll(data) {
      return neo.getAllRelationships(data.nodes)
        .then(function(allRelationships)  {
          vm.graph.edges.update(allRelationships.edges);
          return data;
        });
    }

    function getData(query) {
      return neo.getGraph(query.q, false, 3)
        .then(function(data) {
          return data;
        });
    }

    function onSelect(selection) {
      vm.selectedEdges = selection.edges;
      if (selection.node) {
        if (vm.comparison && parseInt(selection.node.id) === parseInt(vm.comparison.id)) {
          stateManager.go.node(selection.node);
        } else if (parseInt(selection.node.id) !== parseInt(vm.node.id)){
          stateManager.go.comparison(selection.node);
        } 
        load(selection.node);
        return;
      } 

      if (selection.edges && selection.edges.length === 1) {

        if (selection.edges[0].from == vm.node.id) {
          stateManager.go.comparison(selection.edges[0].to);
          return;
        }

        if (selection.edges[0].from == vm.comparison.id) {
          stateManager.go.node(selection.edges[0].to);
          return;
        }

        if (selection.edges[0].to == vm.node.id) {
          stateManager.go.comparison(selection.edges[0].from);
          return;
        }

        if (selection.edges[0].to == vm.comparison.id) {
          stateManager.go.node(selection.edges[0].from);
          return;
        }

        stateManager.go.compare(selection.edges[0].from, selection.edges[0].to);
      }
      
    

    }

  }
 
})();
(function() {

  'use strict';

  directive.$inject = ["graphService", "stateManager", "$window", "$timeout", "_"];
  angular.module('neograph.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, stateManager, $window, $timeout, _) {
   
    var options = {
      configure: { enabled: true },
      interaction: {
        hover: true,
        hoverConnectedEdges:false
      },
      edges: { 
        hoverWidth: function (width) {
          return width + 2;
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          enabled: false,
          levelSeparation: 10, // make this inversely proportional to number of nodes
          nodeSpacing: 200,
          direction: 'UD', //LR
                  //    layout: "hubsize"
        }
      },
      manipulation: {
        enabled: true,
        initiallyActive: true
      },
      physics: {
            minVelocity:0.2,
            maxVelocity:5,
            barnesHut: {
              damping:0.2
            }
        }
              // stabilize: true,
              // stabilizationIterations: 1000,
              /*
        physics: {
          barnesHut: {
            enabled: true,
            gravitationalvariant: -6000,
            centralGravity: 1,
            springLength: 40,
            springvarant: 0.04,
            damping: 0.09,
            avoidOverlap:0.1
          },
          repulsion: {
            centralGravity: 0.1,
            springLength: 0.5,
            springvarant: 0.05,
            nodeDistance: 100,
            damping: 0.09
          },
          hierarchicalRepulsion: {
            enabled: false,
            centralGravity: 0,
            springLength: 270,
            springvarant: 0.01,
            nodeDistance: 300,
            damping: 0.09
          },
          minVelocity:0.3,
          maxVelocity:10
        },
  */
      }

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/graph/graph.html',
      scope: {
        node: '=',
        comparison: '='
      },
      controller: 'GraphCtrl as vm',
      bindToController: true,
      link: linkFn
    }

    function linkFn(scope, element, attrs, vm) {

      vm.vis = new vis.Network(element[0], vm.graph, options);

      $timeout(setGraphSize);

      angular.element($window).on('resize', setGraphSize);
      vm.vis.on('resize', focus);
      vm.vis.on('select', onSelect);
      vm.vis.on('hoverNode', onHoverNode);

      function getSelectedNodeId() {
        var selectedNodes = vm.vis.getSelectedNodes();
        if (selectedNodes.length === 1) {
          return selectedNodes[0];
        }
        return undefined;
      };


      function setGraphSize() { 
        vm.vis.setSize($window.innerWidth + 'px', $window.innerHeight + 'px'); 
      }

      function focus() {
        console.log('resize focus');
        vm.focus(vm.comparison || vm.node);
      }

      function onSelect(params) {

        var selection = {};
        if (params.nodes.length === 1) {
          selection.node = vm.graph.nodes.get(params.nodes[0]);
        } 
        if (params.edges.length) {
          selection.edges = [];
          params.edges.forEach(function(id) {
            var edge = vm.graph.edges.get(id);
            var from = vm.graph.nodes.get(edge.from);
            var to = vm.graph.nodes.get(edge.to);
            selection.edges.push({
              id,
              from: from,
              to: to,
              type: edge.type,
              properties: edge.properties
            });
          })
        }
        scope.$apply(function() {
           vm.onSelect(selection);
        });
        vm.vis.unselectAll();
       
      }

      function onHoverNode(n) {
       
        var node = vm.getGraphNode(n.node);
        console.log(node.queries);


      }
      
      

 
    }
  }

})();

angular.module('neograph.graph', [
  'neograph.graph.service',
  'neograph.graph.directive',
  'neograph.graph.controller'
]);
(function() {

  'use strict';

  factory.$inject = ["nodeService"];
  angular.module('neograph.graph.service', [])
  .factory('graphService', factory);

  function factory(nodeService) {

    function getQueries(node) {

      if (!node) return [];

      var queries = [];
      var label = node.label;
      var labels = node.labels;

      if (!labels || !label) return [];

      if (node.label === 'Schema') {
         queries.push(
          {
            name: 'Schema',
            q: `
            MATCH (n:Class) - [r] -> (m:Class) 
            with n,r,m OPTIONAL MATCH n - [pr:PROPERTY] -> (p:Property)  
            with p,pr,n,r,m OPTIONAL MATCH m - [pr2:PROPERTY] -> (p2:Property)  
            return p,pr,p2,pr2,n,r,m
            `
          });
      }

      if (labels.indexOf('Provenance') > -1) {
        queries.push(
          {
            name: 'Provenance',
            q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' 
            and not c.Label='${label}'  return c,d,r
            `
          });
      }

      if (labels.indexOf('Period') > -1) {
        queries.push({
          name: 'Period',
          q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' and not c.Label='${label}'  return c,d,r
            `
        });
      }

      if (labels.indexOf('Theme') > -1) {
        queries.push({
          name: 'Theme',
          q: `
            MATCH (c:Label:${label})-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) 
            and not d.Label='${label}' and not c.Label='${label}'  return c,d,r
            `
        });
      }

     if (labels.indexOf('Person') > -1) {

        queries.push({
          name: 'Creation relation',
            q: ` match (n:Person {Lookup:'${label}'}) <- [:BY] - (c1:Creation) - [r] - (c2:Creation) - [:BY] -> (m:Person)
                  return n,m `
        });

        queries.push({
          name: 'Outbound Influence',
          /*
          q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Label)
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
            with c,d,r optional  match(d) -[s]->(e:Label)
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'    
              return c,d,r,s,e `,*/
           q: `
            MATCH (c:Person {Label:'${label}'})-[r]->(d:Label)
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
              
            return c,d,r limit 5 `,
          connectAll: false
        });
        queries.push({
          name: 'Inbound Influence',
          /*
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
            with c,d,r optional  match(d) <-[s]-(e:Label)   
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'  
              return c,d,r,s,e 
            `,*/
          q: `
            MATCH (c:Person {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
           
             return c,d,r limit 5 `,
          connectAll: false
        });
      }
/*
      if (labels.indexOf('Person') > -1) {
        queries.push({
          name: 'Outbound Influence',
          q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Label)  
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'   
            with c,d,r optional  match(d) -[s]->(e:Label)  
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'    
              return c,d,r,s,e `,
          connectAll: true
        });
        queries.push({
          name: 'Inbound Influence',
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Label) 
              where  type(r) = 'INFLUENCES'  OR type(r) = 'INSPIRES'  
            with c,d,r optional  match(d) <-[s]-(e:Label)   
              where  type(s) = 'INFLUENCES'  OR type(s) = 'INSPIRES'  
              return c,d,r,s,e 
            `,
          connectAll: true
        });
      }
*/
      if (labels.indexOf('Group') > -1) {
        queries.push({
          name: 'Group',
          q: `
          match (n {Label:'${label}'}) -[r]-(m:Label) -[s]-(p:Label) 
          where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) 
          and (m:Painter or m:Group) and (p:Painter or p:Group) 
          and not m:Provenance and not p:Provenance return n,r,m,s,p
          `,
          connectAll: true
        });
      }

      if (labels.indexOf('Iconography') > -1) {
        queries.push({
          name: 'Iconography',
          q: `
          MATCH (c:Label:${label})-[r]-(d:Label)  where not (c-[:INSTANCE_OF]-d)  
          and not d.Label='${label}' and (d:${label} or d:Provenance or d:Group 
          or d:Iconography or d:Place) return c,d,r
          `,
          connectAll: true
        });
      }

      if (node.YearFrom && node.YearTo) {
        queries.push({
          name: 'YearFromYearTo',
          q: `
          MATCH (c:Label)-[r]-(d:Label) where  not (c-[:INSTANCE_OF]-d) and 
          (
            (c.YearTo >= ${node.YearFrom} and c.YearTo<= ${node.YearTo}) 
            or (c.YearFrom >= ${node.YearFrom} and c.YearFrom<= ${node.YearTo})
          )
          and 
          (
            (d.YearTo >= ${node.YearFrom} and d.YearTo<= ${node.YearTo}) 
            or (d.YearFrom >= ${node.YearFrom} and d.YearFrom<= ${node.YearTo})
          )
          return c,d,r
          `,
          connectAll: true
        });
      }

      queries.push({
        name: 'All immediate relationships',
        q: `MATCH (c)-[r]-(d:Label) where ID(c) = ${node.id} and type(r) <> 'INSTANCE_OF' return c,d,r`
      });

      queries.push({
        name: 'Self',
        q: `MATCH (c:${label})-[r]-(d:${label}) WHERE  type(r) <> 'INSTANCE_OF' return c,d,r`
      });

      return queries;
    }
    
    function graphNodeFromNeoNode(neoNode) {
 
      if (!(neoNode instanceof Node)) {
        neoNode = nodeService.create(neoNode);
      }

      var yf = parseInt(neoNode.yearFrom, 10);
      var yt = parseInt(neoNode.yearTo, 10);
      var y = yt;
      if (yf && yt) {
        y = yt - ((yt - yf) / 2);
      }
      var level = 0;
      var startYear = 1400;
      var endYear = 2000;
      var step = 5;
      var cnt = 1;
      var i;
      for (i = startYear; i < endYear; i += step) {
        if (y >= i && y < i + step) {
          level = cnt;
        }
        cnt += 1;
      }
      if (y > endYear) {
        level = cnt;
      }

      var largeText = neoNode.isProvenance() || 
                    neoNode.isPeriod() || 
                    neoNode.hasType('Group') || 
                    neoNode.hasType('Iconography') || 
                    neoNode.hasType('Theme');
      
      var node = {
        largeText: largeText,
        data: neoNode,
        id: neoNode.id,
        label: neoNode.hasType('Quotation') ? neoNode.text : neoNode.label || neoNode.lookup,
        mass:  largeText ? 2 : 1,//increase value to increase repulsion
        size: neoNode.isPerson() ? (neoNode.status * 2) ^ 3 : 1,
        title:  neoNode.label,
        // for hiearchichal layout,
        //level,
    //    group: neoNode.type ? neoNode.type.lookup : 'Type',
        borderWidth: 0,
        borderWidthSelected: 0,
        shape: neoNode.isPerson() ? 'dot': 'box',
        color: {
          background: neoNode.isPerson() ? '#5a9cd6' : 'transparent',
          highlight: neoNode.isPerson() ? '#fff' : 'transparent',
          hover:  neoNode.isPerson() ? '#fff' : 'transparent',
          border: 'transparent'
        },
        labelHighlightBold: false,
        font: {
          color: largeText ? '#76a1c5' : '#3e82bd',
          size:  largeText ? 30 : 16,
          background: largeText ? 'transparent' : '#8fb1ca'
        }
      };

/*
      var image;// = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

      if (neoNode.isPicture()) {
        node.image = neoNode.image;
        node.shape = 'image';
      } 
      */
      return node;
    };

    function graphEdgeFromNeoEdge(neoEdge) {

      var type = neoEdge.type;
      var directional = type === 'INFLUENCES' || type === 'INSPIRES' || type === 'TEACHES';
      var hideLabel =
              type === 'CREATION' ||
              type === 'BY' ||
              type === 'INFLUENCES' ||
              type === 'INSPIRES' ||
              type === 'DEALS_WITH' ||
              type === 'PART_OF' ||
              type === 'MEMBER_OF' ||
              type === 'ASSOCIATED_WITH' ||
              type === 'ACTIVE_DURING' ||
              type === 'FROM' ||
              type === 'DEVELOPS' ||
              type === 'LEADS' ||
              type === 'FOUNDS' ||
              type === 'DEPICTS' ||
              type === 'WORKS_IN' ||
              type === 'STUDIES' ||
              type === 'STUDIES_AT' ||
              type === 'TEACHES' ||
              type === 'TEACHES_AT';

      var colour, fontColour;
      switch (type) {
        case 'CREATION':
          colour = '#fff';
          break;
        case 'FROM':
        case 'ACTIVE_DURING':
          colour = 'transparent';
          break;
        default:
          colour = '#3e82bd';
          fontColour = '#3e82bd';
      }

      var hidden = type === 'FROM' || type === 'ACTIVE_DURING';
     

      var label = type.toLowerCase().replace(/_/g,' ')
      var edge = {
        data: neoEdge,
        id: neoEdge.id,
        width: 1,
        title: label,
        from: neoEdge.startNode,
        to: neoEdge.endNode,
        label: hideLabel ? undefined : label,
        font: {
          color: fontColour,
          background: '#8fb1ca',
          strokeWidth: 0
        },
        color: {
          color: colour,
          opacity: 0.5,
          highlight: '#fff',
          hover: '#fff'
        },
        hidden: hidden, 
        arrows: directional ? 'to' : undefined,
        arrowStrikethrough: false,
        dashes: !directional, // arrow-center' ,
        smooth: {
          type: 'dynamic'
        },
        labelHighlightBold: false

      };
      return edge;
    };


    return {
      getQueries: getQueries,
      defaultEdgeType: function(fromType, toType) {
        if (toType === 'Provenance') {
          return 'FROM';
        } else if (toType === 'Painter') {
          return 'INFLUENCES';
        }
        return 'ASSOCIATED_WITH';
      },
      // Transforms neo graph data object into object
      // containing array of nodes and array of edges renderable by vis network
      toVisNetworkData: function(g) {
        return {
          nodes: Object.keys(g.nodes).map(function(key) { 
            return graphNodeFromNeoNode(g.nodes[key]); 
          }),
          edges: Object.keys(g.edges).map(function(key) { 
            return graphEdgeFromNeoEdge(g.edges[key]); 
          })
        };
      },
      graphNodeFromNeoNode: graphNodeFromNeoNode,
      graphEdgeFromNeoEdge: graphEdgeFromNeoEdge
    };
  }

})();
angular.module('neograph.interaction.draggable', [])
    .directive('draggable', function () {
      return {

        link: function ($scope, element, attrs) {

          var initLeft = $(element).position().left;

          $(element).draggable({
            axis: 'x',
            drag: function () {

              var change = initLeft - $(element).position().left;

              $scope.$apply(function () {
                $scope.window.tabsWidth = $scope.window.tabsWidth + change;
              });


              initLeft = $(element).position().left;

            }
          });
        }
      };
    });

angular.module('neograph.interaction', [
  'neograph.interaction.draggable',
  'neograph.interaction.resizable',
  'neograph.interaction.selectable'
]);

angular.module('neograph.interaction.resizable', [])
.directive('resizable', ["$window", function ($window) {
  return {
    scope: {
      window: '='
    },
    controller: ["$scope", "$element", function ($scope, $element) {

      var w = angular.element($window);
      var getWindowDimensions = function () {
        var width = w.width();
        var height = w.height();
        return {
          'height': height,
          'width': width,
          'tabsWidth': $scope.window.tabsWidth,
          'tabsWidthInner': $scope.window.tabsWidth - 10,
          'graphWidth': width - $scope.window.tabsWidth,
          'graphHeight': height - $scope.window.topBarHeight,
          'topBarHeight': $scope.window.topBarHeight,
          'tabsHeight': height - $scope.window.topBarHeight
        };
      };

      $scope.window = getWindowDimensions();

      $scope.$watch(getWindowDimensions, function (newValue, oldValue) {

        $scope.window = newValue;

      }, true);

      w.bind('resize', function () {
        $scope.$apply();
      });

            // w.bind("debouncedresize", function (event) {
            //    $scope.$apply();

            // });

    }]
  };
}]);


angular.module('neograph.interaction.selectable', [])
.directive('selectable', function () {
  return {
    scope: {
      selected: '='

    },
    link: function ($scope, element, attrs) {

      $scope.$watch($(element).find('li.ui-selected').length, function (i) {

        $(element).selectable({
          filter: 'li',
          stop: function (event, ui) {
            var selected = [];
            $(element).find('li.ui-selected').each(function (i, e) {
              selected.push(parseInt($(e).attr('nodeindex')));
            });

            $scope.$apply(function () {

              $scope.selected = selected;

            });

          }
                    ,
          cancel: '.badge, .label'



        });


      });


    }
  };
});






angular.module('neograph.layout', [])
.directive('tabs', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      tabs:'=', // required to remove panes no longer available
      selected: '=?'
    },
    controller: ["$scope", function ($scope) {
      var panes = $scope.panes = [];
      var self = this;

      $scope.select = function (pane) {
        angular.forEach(panes, function (pane) {
          pane.selected = false;
        });
        pane.selected = true;
        $scope.selected = pane.key;
      };

      this.add = function (pane) {
        if (panes.length === 0) {
          $scope.select(pane);
        }
        panes.push(pane);
      };

      this.remove = function (pane) {
                // console.log('remove')
                // console.log(pane);
        angular.forEach(panes, function (p, i) {
          if (pane.key == p.key) {
            panes.splice(i, 1);
            if (pane.selected) {
              pane.selected = false;
              $scope.select($scope.panes[0]);
            }


          }
        });

      };

      $scope.$watch('selected', function (key) { // the title of the selected pane

        if (key) {
          angular.forEach(panes, function (pane) {

            pane.selected = pane.key === key;
          });
        }

      });


            // remove tabs not in list (child pane only adds them)
      $scope.$watch('tabs', function (tabs) { // the title of the selected pane

        if (tabs) {
          angular.forEach(panes, function (pane) {

            if (tabs.indexOf(pane.key) === -1) {

              self.remove(pane);
            }
          });
        }

      });


    }],
    templateUrl: 'app/layout/tabs.html'
  };
})
.directive('tabPane', function () {
  return {
    require: '^tabs',
    restrict: 'E',
    transclude: true,
    scope: {
      key:'@',
      title: '=',
      visible: '=',
      active: '=?',
      window:'='
    },
    link: function ($scope, element, attrs, tabsCtrl) {


      tabsCtrl.add($scope);


            // $scope.$watch('visible', function (visible) {

            //    if (visible) {
            //        tabsCtrl.addPane($scope);
            //    }
            //    else {
            //        tabsCtrl.removePane($scope);

            //    }

            // });


      $scope.$watch('active', function (active) { // the title of the selected pane

        $scope.selected = active;

      });


    },
    templateUrl: 'app/layout/tabPane.html'
  };
})
.directive('noBubble', function () {
  return {

    link: function ($scope, element, attrs, tabsCtrl) {



      $(element).on('keydown', function (event) {

        event.stopPropagation();
      });

    },
    templateUrl: 'app/layout/tabPane.html'
  };


});

  angular.module('neograph.models.predicate', [])
  .factory('predicateFactory', function () {

    function Predicate(data) {

      Object.assign(this, data);

    }

    Predicate.prototype.setDirection = function (direction) {
      this.direction = direction;
      return this;
    };

    Predicate.prototype.toString = function () {
      if (this.direction === 'in' && !this.symmetrical) {
        if (this.reverse) { // use reverse if present
          return this.reverse.replace(/_/g, ' ').toLowerCase();
        }
        else {
          var lookup = this.lookup.toUpperCase();
          if (lookup === 'CREATED' || lookup === 'CREATES')
            return 'created by';
          else if (lookup === 'INFLUENCES')
            return 'influenced by';
                else if (lookup === 'INSPIRES')
                  return 'inspired by';
                else if (lookup === 'ANTICIPATES')
                  return 'anticipated by';
                else if (lookup === 'DEVELOPS')
                  return 'developed by';
                else if (lookup === 'DEPICTS')
                  return 'depicted by';
                else if (lookup === 'TYPE_OF')
                  return 'type(s)';
                else
                    return '(' + this.lookup.replace(/_/g, ' ').toLowerCase() + ')';
        }
      }

       // if (!this.isDirectional || !this.direction || this.direction === "out") {
      return this.lookup.replace(/_/g, ' ').toLowerCase();


    };

    Predicate.prototype.flip = function () {

      if (!this.isDirectional) {
        return;
      }
      if (this.direction === 'in') {
        this.setDirection('out');
      }
      else {
        this.setDirection('in');
      }
      return this;

    };

    return {
      create:function (data) {
        return new Predicate(data);
      }
    };


  });




angular.module('neograph.neo.client', ['ngResource', 'neograph.settings'])
.factory('neoClient', ['$resource', 'settings', function ($resource, settings) {
    // return $resource('http://localhost:1337/node/match', {txt:'@txt',restrict:'@restrict'}, {
    //    matchNodes: {
    //        method: 'POST',
    //        isArray:true
    //    }
    // });

    // return $resource(null,null, {
    //    matchNodes: {
    //        url: 'http://localhost:1337/node/match',
    // //       params: {txt:'',restrict:''},
    //        method: 'POST',
    //        isArray: true
    //    }
    // });

  var root = settings.apiRoot;

  return {

    node:$resource(null, null, {
      search: {
        url: root + '/search',
        method: 'POST',
        isArray: true
      },
      get: {
        url: root + '/node/get/:id',
        method: 'GET',
      },
      getWithRels: {
        url: root + '/node/getWithRels/:id',
        method: 'GET',
      },
      save: {
        url: root + '/node/save',
        method: 'POST'
      },
      saveImage: {
        url: root + '/node/saveImage',
        method: 'POST'
      },
      saveProps: {
        url: root + '/node/saveProps',
        method: 'POST'
      },
      saveRels: {
        url: root + '/node/saveRels',
        method: 'POST'
      },
      saveWikipagename: {
        url: root + '/node/saveWikipagename',
        method:'POST'
      },
      saveMultiple: {
        url: root + '/node/saveMultiple',
        method: 'POST'
      },
      del: {
        url: root + '/node/delete',
        method: 'POST'
      },
      destroy: {
        url: root + '/node/destroy',
        method: 'POST'
      },
      restore: {
        url: root + '/node/restore',
        method: 'POST'
      }

    }),
    picture: $resource(null, null, {
      labelled: {
        url: root + '/pictures/labelled/:label',
        method: 'GET'
      },
      search: {
        url: root + '/pictures/search',
        method: 'POST'
      }
    }),
    edge: $resource(null, null, {
      save: {
        url: root + '/edge/save',
        method: 'POST'
      },
      del: {
        url: root + '/edge/delete',
        method: 'POST'

      }
    }),
    user:$resource(null, null, {
      saveFavourite: {
        url: root + '/user/saveFavourite',

        method: 'POST'

      },
      get: {
        url: root + '/user/:user',
        method: 'GET'
      }
    }),
     utils:$resource(null, null, {
      getDistinctLabels: {
        url: root + '/labels/distinct',
        method: 'POST'
      }
    }),
    graph: $resource(null, null, {
      get: {
        url: root + '/graph',
        method: 'POST'
      }
    }),
    type: $resource(null, null, {
      getAll: {
        url: root + '/type/getall',
        method: 'GET'
      }
    }),
    predicate: $resource(null, null, {
      getAll: {
        url: root + '/predicates',
        method: 'GET'
      }
    })
    ,
    graphql:$resource(null, null, {
      query: {
        url: root + '/graphql',
        method: 'POST'
      }
    }),
    relationship:$resource(null, null, {
      shortest: {
        url: root + '/relationship/shortest/:from/:to',
        method: 'GET'
      },
      allshortest: {
        url: root + '/relationship/allshortest/:from/:to',
        method: 'GET'
      },
      visual: {
        url: root + '/relationship/visual/:from/:to',
        method: 'GET',
        isArray:true
      },
    })

  };

}]);

angular.module('neograph.neo', ['neograph.utils', 'neograph.neo.client'])
.factory('neo', ['neoClient', 'utils', function (neoClient, utils) {

  var api = {
    graphql: function(q) {
      q = 'query { store { ' + q + ' } }';
      return neoClient.graphql.query({ query: q })
        .$promise.then(function (data) {
          var out = data.toJSON();
          return out.data.store;
        });
    },
    shortest: function(from, to) {
      var params = {from: from, to: to};
      return neoClient.relationship.shortest(params)
        .$promise.then(function (data) {
          return utils.getTypes().then(function(types) {
            Object.keys(data.nodes).forEach(function(key) {
              var n = data.nodes[key];
              n.type = types[n.class];
            });
          return data.toJSON();
         });
      });
    },
    allShortest: function(from, to) {
      var params = {from: from, to: to};
      return neoClient.relationship.allshortest(params)
        .$promise.then(function (data) {
          return utils.getTypes().then(function(types) {
            Object.keys(data.nodes).forEach(function(key) {
              var n = data.nodes[key];
              n.type = types[n.class];
            });
          return data.toJSON();
         });
      });
    },
    getGraph: function (q, returnArray) {
      return neoClient.graph.get({ q: q, returnArray: returnArray })
        .$promise.then(function (data) {
          var out = data.toJSON();
          return utils.getTypes().then(function(types) {
            if (returnArray) {
              out.nodes.map(function(n) {
                n.type = types[n.class];
              });
            } else {
              Object.keys(out.nodes).forEach(function(key) {
                var n = out.nodes[key];
                n.type = types[n.class];
              });
            }
            return out;
          });
        });
    },
    // returns all relationships between supplied nodes, which can be vis.Dataset or graph data object
    getAllRelationships: function (nodes) {
      var nodeIds = '';
      if (nodes.getIds) {
        // if vis.DataSet
        nodeIds = nodes.getIds({ returnType: 'Array' }).join(',');
      } else { 
        // otherwise data object
        for (var key in nodes) {
          if (nodeIds.length) {
            nodeIds += ',';
          }
          nodeIds += key;
        }
      }
      var q = 'MATCH a -[r]- b WHERE id(a) IN[' + nodeIds + '] and id(b) IN[' + nodeIds + '] and not (a-[:TYPE_OF]-b) return r';
      return api.getGraph(q);
    },
    getRelationships: function (id) {
      return neoClient.node.getRelationships({ id: id })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    getVisual: function (from, to) {
      return neoClient.relationship.visual({ from:from.lookup, to: to.lookup })
        .$promise.then(function (data) {
          
          return data;
        });
    },
    searchPictures : function(query, options) {
      return neoClient.picture.search({query: query, options: options})
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    getPictures: function (label) {
      return neoClient.picture.labelled({ label: label })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    saveMultiple: function (multiple) {
      return neoClient.node.saveMultiple({ multiple: multiple })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    saveImage: function (node) {
      return neoClient.node.saveImage({ node: node })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    // saves edge to neo (update/create)
    // TODO: according to certain rules labels will need to be maintained when relationships are created. (update not required as we always delete and recreate when changing start/end nodes)
    // tag a with label b where:
    // a=person and b=provenance (eg painter from france)
    // a=person and n=group, period (eg painter part of les fauves / roccocco)
    // a=picture and b=non-person (eg picture by corot / of tree) - although typically this will be managed through labels directly (which will then in turn has to keep relationships up to date)
    saveEdge: function (e) { // startNode and endNode provide the full node objects for the edge
      return neoClient.edge.save({ edge: e })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    saveFavourite: function (node, user) {
      return neoClient.user.saveFavourite({ user: user, node: node })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    deleteEdge: function (edge) {
      if (edge && edge.id) {
        return neoClient.edge.delete({ edge: edge })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      }
    },
    getUser: function (userLookup) {
      return neoClient.user.get({ user: userLookup })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    getOne: function (q) { // q must be a match return a single entity n
      return neoClient.node.getOne({ q: q })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    getImageRelationships: function (edge) { // loks up id/label first then call get by label
      return neoClient.edge.getImageRelationships({ edge: edge })
        .$promise.then(function (data) {
          return data.toJSON();
        });
    },
    // Alternatively i could query the actual labels and merge them into a distinct array
    getDistinctLabels: function (labels) {
      return neoClient.utils.getDistinctLabels({ labels: labels })
        .$promise.then(function(data) {
          return data.toJSON().labels;
        });
    },
    getDistinctLabelsQuery: function (q) {
      return neoClient.utils.getDistinctLabels({ q: q }).$promise;// returns array
    }
  };

  return api;

}]);

angular.module('neograph.session', ['neograph.neo'])
    .factory('session', ['neo', '$q', function (neo, $q) {

      var anonUser = {
        Lookup: 'Anonymous',
        roles: { 'Public': {} }
      };


      var session = {

        init: function () {

          neo.getUser('Julian').then(function (user) {

            session.user = user;
            session.signedIn = true;
          });

          return session;

        }
        ,
        signingIn: false
        ,
        signedIn: false
        ,
        user: anonUser
        ,
        signIn: function (username, password) {

          return neo.authenticate(username, password).then(function (user) {

            session.user = user;


            console.log(session.user);
             //   session.apps = service.getApps(session.user.roles);


            localStorage.username = session.user.username;


            session.signedIn = true;

            if (user.roles.PreReg) {
              $('body').addClass('prereg');
            }
            else {
              $('body').removeClass('prereg');
            }



          }, function (failMessage) {
            console.log(failMessage);
            return $q.reject(failMessage);
          });

        }
        ,
        signOut: function () {

          session.user = anonUser;
          localStorage.username = '';// = JSON.stringify(session.user);
          session.signedIn = false;
          //  session.apps = service.getApps(session.user.roles);

        }
      };



      if (localStorage.username) {
        session.user = neo.getUser(localStorage.username);
      }

      if (session.user.name != 'Anonymous') {
        session.signedIn = true;
      }

 //   session.apps = service.getApps(session.user.roles);

      return session.init();


    }]);

(function() {

  factory.$inject = ["neoClient", "$q"];
angular.module('neograph.utils', ['neograph.neo.client'])
  .factory('utils', factory);

  function factory(neoClient, $q) {

    Array.prototype.diff = function (a) {
      return this.filter(function (i) { return a.indexOf(i) < 0; });
    };
    Array.prototype.ids = function () {
      return this.map(function (e) { return e.id; });
    };
    Array.prototype.hasAny = function (a) {
      return this.filter(function (i) { return a.indexOf(i) > -1; }).length > 0;
    };
    Array.prototype.unique = function () {
      var a = [];
      for (i = 0; i < this.length; i++) {
        var current = this[i];
        if (a.indexOf(current) < 0) a.push(current);
      }
      return a;
    };

    var api = {
      isType: function (label) {
        return api.types[label] != undefined;
      },
      // returns type object from lookup
      getType: function(type) {
         return api.getTypes()
          .then(function(types) {
            return types[type];
          });
      },   
      getTypes: function () {
        if (api.types) {
          var deferred = $q.defer();
          deferred.resolve(api.types);
          return deferred.promise;
        } else {
          return api.refreshTypes();
        }
      },
      refreshTypes: function () {
        return neoClient.type.getAll()
          .$promise.then(function (types) {
            api.types = types.toJSON();
            return api.types;
          });
      },
      getPredicates: function() {
        if (api.predicates) {
          var deferred = $q.defer();
          deferred.resolve(api.predicates);
          return deferred.promise;
        } else {
          return api.refreshPredicates();
        }
      },
      refreshPredicates: function () { 
        return neoClient.predicate.getAll()
          .$promise.then(function (predicates) {
            api.predicates = predicates.toJSON();
            return api.predicates;
          });
      },
      isSystemInfo: function (label) {
        return label === 'Global' || 
          label === 'Type' || 
          label === 'Label' || 
          label === 'SystemInfo';
      },
      getLabelClass: function (node, label) {
        if (node && label === node.Type) {
          return 'label-warning';
        }
        if (api.isSystemInfo(label)) {
          return 'label-system';
        }
        if (api.isType(label)) {
          return 'label-inverse pointer';
        }
        return 'label-info';
      }
    };

    api.refreshPredicates();
    api.refreshTypes();
    return api;
  }

})();
(function() {
  'use strict';

  controller.$inject = ["$scope"];
  angular.module('neograph.node.controller', [
    ])
    .controller('NodeCtrl', controller);

  function controller($scope) {
    var vm = this;
    vm.node = {};
    vm.edit = edit;
    vm.delete = del;
    vm.destroy = destroyNode;
    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;
    vm.selectTab = selectTab;
    vm.closeTabs = closeTabs;
    vm.node = {};
    vm.tabs = ['Properties', 'Image', 'Relationships', 'Refs'];
    //vm.selectedTab = 'Properties';

    function selectTab(tab) {
      vm.selectedTab = tab;
    }

    function closeTabs() {
      vm.selectedTab = undefined;
    }

    $scope.$watch('vm.selectedTab',function(tab) {
      if (vm.onTabChanged) {
        vm.onTabChanged({tab: tab});
      }
    });

    function edit() {
      if (vm.onToggleEdit) {
        vm.onToggleEdit({editing:true});
        if (!vm.selectedTab) {
          vm.selectedTab = 'Properties';
        }
      } else {
        vm.editing = true;
      }
    }

    function del() {
      vm.node.delete();
    };

    function destroyNode() {
      vm.node.destroy()
        .then(function() {
          vm.node = undefined;
          //where to now ???
        });
    };

    function finishEditing(node) {
      if (vm.onToggleEdit) {
        vm.onToggleEdit({editing:false});
      } else {
        vm.editing = false;
      }
    }

    function cancel() {
      if (vm.node.id > -1) {
        vm.node.revert();
      }
      finishEditing();
    }

    function save() {
      vm.node.save()
        .then(finishEditing);
    };

    function restore() {
      vm.node.restore(vm.node)
        .then(finishEditing);
    }

  }

})();
(function() {
  'use strict';
  directive.$inject = ["$timeout"];
  angular.module('neograph.node.directive', [])
    .directive('node', directive);

    function directive($timeout) {
      return {
        scope: {
          node: '=',
          editing: '=',
          onToggleEdit: '&?',
          onTabChanged: '&?'
        },
        controller: 'NodeCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/node/node.html',
        restrict: 'E'
      };

   
  }

})();

(function() {
  'use strict';

  angular.module('neograph.node', [
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.properties',
    'neograph.node.relationships',
    'neograph.node.references',
    'neograph.node.service',
    'neograph.node.image',
    'neograph.node.directive',
    'neograph.node.controller',
    'neograph.models.predicate'
  ]);

})();
(function() {
  'use strict';

  service.$inject = ["neoClient", "utils", "$q", "predicateFactory"];
  angular.module('neograph.node.service',[])
    .factory('nodeService', service);

  function service(neoClient, utils, $q, predicateFactory) {

    function Node(data) {

      this.labels = [];
      this.id = -1;

      _.extend(this, data);

      for (var relKey in this.relationships) {
        var rel = this.relationships[relKey];
        rel.predicate = predicateFactory.create(rel.predicate);
      }
      if (!this.label && this.lookup) {
        this.label = this.lookup;
      }

      if (this.type) {
        this.customLabels = this.labels.filter(function(label) {
          return this.type.subtypes.indexOf(label) === -1 && label != this.type.lookup;
        }.bind(this));
      }
  
      this.original = angular.copy(this);
    }

    Node.prototype.revert = function() {
      var reverted = angular.copy(this.original);
      reverted.original = angular.copy(reverted);
      this.replace(reverted);
    }

    Node.prototype.save = function() {
      return neoClient.node.save({ node: this })
        .$promise.then(create)
        .then(this.replace);
    }

    Node.prototype.delete = function () {
      /*
      return neoClient.node.delete({ node: this })
        .$promise.then(create)
        .then(this.replace);
        */
    }

    Node.prototype.restore = function () {
      return neoClient.node.restore({ node: this })
        .$promise.then(create)
        .then(this.replace);
    }

     // deletes node and relationships forever
    Node.prototype.destroy = function () {
      //return neoClient.node.destroy({ node: this });
    }

    Node.prototype.replace = function(node) {
      for (var prop in this) { 
        if (this.hasOwnProperty(prop) && prop !== 'labels') { 
          delete this[prop]; 
        } 
      }
      _.extend(this, node);
    }

    Node.prototype.isDeleted = function () {
      return this.labels.indexOf('Deleted') > -1;
    };

    Node.prototype.hasType = function(type) {
      if (!this.type || this.class === 'Type') return false;
      return this.type.lookup === type || this.type.subtypes.indexOf(type) > -1;
    }
    
    Node.prototype.isPicture = function () {
      return this.hasType('Picture');
    };

    Node.prototype.isProvenance = function () {
      return this.hasType('Provenance');
    };

    Node.prototype.isPeriod = function () {
      return this.hasType('Period');
    };
 

    Node.prototype.isPerson = function () {
      return this.hasType('Person');
    };

    Node.prototype.isProperty = function () {
      return this.hasType('Property');
    };

    function create(nodeResponseData) {
      var node = nodeResponseData.toJSON();
      return utils.getType(node.type)
        .then(function(typeObject) {
          node.type = typeObject;
          return new Node(node);
        });
    }

    var api = {
      // id = label or internal id
      get: function (id) {
        return neoClient.node.getWithRels({ id: id })
          .$promise.then(create);
      },
      getList: function (q, limit) { // q = match (n) & where only (without return)
        return neoClient.node.getList({ q: q, limit: limit }).$promise;// returns array
      },
      getImages:function (node) {
        return neoClient.node.getImages({
          id: node.id,
          isPicture: node.isPicture(),
          isGroup: node.isGroup()
        }).$promise;// returns array
      },
      search: function (txt, restrict) { // restrict = labels to restrict matches to
        if (txt) {
          return neoClient.node.search({ txt: txt, restrict: restrict }).$promise;// returns array
        }
      },
      create: function(nodeAsJson) {
        return new Node(nodeAsJson);
      }
    };
    return api;

  }
})();
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

angular.module('neograph.query.presets', [])
.factory('queryPresets', () =>
   ({
     Schema: {
       q: 'match (n:Schema) optional match (n)-[r]-(m:Schema) return n,r,m'
     },
     AddedRecently: {
       q: `
      match (n:Global) where n.created is not null 
      return n order by n.created desc limit 100
      `
     },
     AddedRecentlyPictures: {
       q: `
      MATCH  (p:Label) -- (i:Picture) where p.created is not null 
      return p.created,collect(i)[0..5],count(*) as count  
      order by p.created desc limit 500
      `
     },
     Overview: {
       q: `
      match (n) - [r] - (m) where (n:Global and m:Global) 
      and (n.Status is null or n.Status > 6) 
      and (m.Status is null or m.Status > 6) 
      and not (n-[:INSTANCE_OF]-m) RETURN r
      `
     },
     OverViewDense: {
       q: `
      match (n) - [r] - (m) where (n:Global and m:Global) 
      and (n.Status is null or n.Status > 3) 
      and (m.Status is null or m.Status > 3) 
      and not (n-[:INSTANCE_OF]-m) RETURN r
      `
     },
     BritishInfluence: {
       q: `
      MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) 
      and not (c-[:INSTANCE_OF]-d) and not d.Lookup='English' 
      and not c.Lookup='English'  return c,d,r
      `
     },
     BritishOnly: {
       q: `
      MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) and  
      (d:English or d:Scottish) and not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='English' and not c.Lookup='English'  return c,d,r
      `,
       connectAll: true
     },
     FrenchOnly: {
       q: `
      MATCH (c:Global:French)-[r]-(d:Global:French) where  not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='French' and not c.Lookup='French'  return c,d,r
      `,
       connectAll: true
     },
     FrenchPainterInfluence: {
       q: `
      MATCH (c:Global:French:Painter)-[r]-(d:Painter) 
      where not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='French' and not c.Lookup='French'  
      return c,d,r
      `,
       connectAll: true
     },
     Cezanne3gen: {
       q: `
      MATCH (c {Lookup:'Cezanne'})-[r]-(d:Painter)  
      -[s]-(e:Painter)  -[t]-(f:Painter) return c,d,e,f,r,s,t
      `,
       connectAll: true
     },
     Cezanne3genOutbound: {
       q: `
      MATCH (c {Lookup:'Cezanne'})
      -[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) 
      return c,d,e,f,r,s,t
      `,
       connectAll: true
     },
     Cezanne3genInbound: {
       q: `
      MATCH (c {Lookup:'Cezanne'})
      <-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) 
      return c,d,e,f,r,s,t
      `,
       connectAll: true
     },
     FrenchEnglishPainters: {
       q: `
      MATCH (c:Global:French:Painter)-[r]-(d:Global:English:Painter) 
      where  not (c-[:INSTANCE_OF]-d) and 
      not d.Lookup='French' and not c.Lookup='French'  return c,d,r
      `,
       connectAll: true
     },
     German: {
       q: `
      MATCH (c:Global:German)-[r]-(d:Global) 
      where not (c-[:INSTANCE_OF]-d) and not 
      d.Lookup='German' and not c.Lookup='German'  return c,d,r
      `
     },
     NorthernEurope: {
       q: `
       MATCH (c:Global)-[r]-(d:Global) where 
        (c:NorthernEurope or c:German or c:Dutch or c:English or c:Scottish) 
        and  
        (d:NorthernEurope or d:German or d:Dutch or d:English or d:Scottish) 
        and not c:Provenance and not d:Provenance and not (c-[:INSTANCE_OF]-d) return c,d,r`
     },
     Italian: {
       q: `
      MATCH (c:Global:Italian)-[r]-(d:Global) where not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='Italian' and not c.Lookup='Italian'  return c,d,r
      `
     },
     Spanish: {
       q: `
      MATCH (c:Global:Spanish)-[r]-(d:Global) 
      where  not (c-[:INSTANCE_OF]-d) and not d.Lookup='Spanish' 
      and not c.Lookup='Spanish'  return c,d,r
      `
     },
     American: {
       q: `
      MATCH (c:Global:American)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='American' and not c.Lookup='American'  return c,d,r
      `
     },
     Pop: {
       q: `
      match (n {Lookup:'Pop'}) -[r]-(m:Global) -[s]-(p:Global) 
      where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) 
      and (m:Painter or m:Group) and (p:Painter or p:Group) 
      and not m:Provenance and not p:Provenance return n,r,m,s,p`
     },
     Impressionism: {
       q: `
      match (n {Lookup:'Impressionist'}) -[r]-(m:Global) -[s]-(p:Global) 
      where not (n-[:INSTANCE_OF]-m) and not (m-[:INSTANCE_OF]-p) 
      and (m:Painter or m:Group) and (p:Painter or p:Group) 
      and not m:Provenance and not p:Provenance return n,r,m,s,p
      `,
       connectAll: true
     },
     Landscape: {
       q: `
      MATCH (c:Global:Landscape)-[r]-(d:Global)  where not (c-[:INSTANCE_OF]-d) 
      and not d.Lookup='Landscape' and 
      (d:Landscape or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r`
     },
     Modern: {
       q: `
      MATCH (c:Global)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) 
      and c.YearTo > 1870  and d.YearTo > 1870 return c,d,r
      `
     },
     Rennaissance: {
       q: `
      MATCH (c:Global)-[r]-(d:Global) where  not (c-[:INSTANCE_OF]-d) 
      and c.YearTo > 1400 and c.YearTo<1700 and d.YearTo > 1400 
      and d.YearTo<1700 return c,d,r
      `
     }
   })
);

angular.module('neograph.queryInput',
['neograph.neo', 'neograph.query.presets', 'neograph.query.generator'])
.directive('queryinput', (neo, queryPresets) =>
  ({
    replace: true,
    restrict: 'E',
    templateUrl: 'app/query/queryInput.html',
    scope: {
      query: '=',
      editable: '=?',
      defaultpreset: '=?'
    },
    link: $scope => {
      $scope.$watch('preset', preset => {
        if (preset) {
          $scope.query.body = preset;
        }
      });

      if ($scope.defaultpreset) {
        $scope.preset = queryPresets[$scope.defaultpreset];
      }

      $scope.$watch('query.body', (body) => {
        if (body && body.q) {
          $scope.getData();
        }
      });

      $scope.generated = { q: '' };
      $scope.$watch('generated', (generated) => {
        if (generated) {
          $scope.query.body = generated;
        }
      });

      $scope.nodeChanged = (node) => {
        if (node) {
          $scope.query.name = node.Label || node.Lookup;
        }
      };

      $scope.connectAll = () => neo.getAllRelationships($scope.query.data.nodes)
                    .then(g => {
                      // Add to cached data
                      Object.assign($scope.query.data.edges, g.edges);
                      $scope.publish('dataUpdate', g);
                    });


      $scope.getData = () => {
        const body = $scope.query.body;
        if (body && body.q) {
        // If grid query then return results as array to preserve sort order
          const returnArray = $scope.query.type === 'Grid';
          neo.getGraph(body.q, returnArray).
            then(g => {
              if (body.connectAll) {
                neo.getAllRelationships(g.nodes).
                  then(g2 => Object.assign(g.edges, g2.edges));
              } else {
                $scope.query.data = g;
              }
            });
        }
      };
    }
  })
);

(function() {
  'use strict';
    
    controller.$inject = ["$scope"];
  angular.module('neograph.search.controller',['neograph.node.service', 'ui.router'])
    .controller('SearchCtrl', controller);

  function controller($scope) {
      var vm = this;
      vm.node = undefined;

      $scope.$watch('vm.node', function (node) {
        vm.onSelected({ node: node });
      });

    }
 
})();
(function() {
  'use strict';
  angular.module('neograph.search.directive', [])
    .directive('search', directive);

    function directive() {
      return {
        scope: {
          onSelected: '&'
        },
        transclude: true,
        controller: 'SearchCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/search/search.html',
        restrict: 'E',
        link: function(scope, element, attrs, vm) {

          scope.$watch('vm.node', function (node) {
            element.find('.btn-search').focus();
            element.addClass('unfocus');
          });

        }
      };
  }

})();

(function() {
  'use strict';

  angular.module('neograph.search', [
    'neograph.search.directive',
    'neograph.search.controller'
  ]);

})();
(function() {

    editController.$inject = ["neo", "utils", "$stateParams", "$scope"];
  angular.module('neograph.edge.edit.properties.controller', ['neograph.neo', 'neograph.utils', 'ui.router'])
    .controller('EditEdgeCtrl', editController);

    function editController(neo, utils, $stateParams, $scope) {
      var vm = this;
      vm.edge = {};
      vm.del = del;

      if ($stateParams.edge) {
        vm.edge = JSON.parse($stateParams.edge);
        vm.predicateType = utils.predicates[vm.edge.type];
      }

      $scope.$watch('predicateType', function (predicateType) {
        if (predicateType) {
          vm.edge.type = predicateType.lookup;
        }
      });

      function del() {
        neo.deleteEdge(vm.edge)
          .then(function () {
            vm.edge = {};
        //    $scope.publish('deleted', { selection: { edges: [e] } });
          });
      };

      function save() {
        neo.saveEdge(e)
          .then(function (saved) {
            /*
            $scope.publish('dataUpdate', saved);
            // update cache
            for (key in g.nodes) {
              $scope.activeView.data.nodes[key] = g.nodes[key];
            }
            for (key in g.edges) {
              $scope.activeView.data.edges[key] = g.edges[key];
              if ($scope.selection.selectedEdge && (key === $scope.selection.selectedEdge.id || !$scope.selection.selectedEdge.id)) {
                $scope.selection.selectedEdge = g.edges[key];
              }
            }
            */
          });
        }
    }

})();



(function() {
  'use strict';

  controller.$inject = ["neo", "modal"];
  angular.module('neograph.node.image.controller', [])
    .controller('NodeImageCtrl', controller);

  function controller(neo, modal) {

    var vm = this;
    var modalId = 'node.images';
    vm.active = false;
    vm.openModal = openModal;
    vm.isDirty = false;
    vm.save = save;
    vm.revert = revert;



    function onSelected(picture) {
      vm.node.image = picture.image;
    }

    function openModal() {
      var modalData = {
        node: vm.node,
        selectable: true
      };
      modal.open(modalId, modalData)
        .then(function (selectedPicture) {
          if (selectedPicture) {
            if (!vm.node.image ||
              (vm.node.image && selectedPicture.image.id !== vm.node.image.id)) {
              vm.node.image = selectedPicture.image;
              vm.isDirty = true;
            } else {
              vm.isDirty = false;
            }
          }
        });
    }

    function save() {
      neo.saveImage(vm.node).then(function(resp) {
        vm.isDirty = false;
      });
    }

    function revert() {
      vm.node.image = vm.original;
      vm.isDirty = false;
    }

  }
})();

(function() {
  'use strict';
  angular.module('neograph.node.image.directive', [])
    .directive('nodeImage', directive);

    function directive() {
      return {
        scope: {
          node: '='
        },
        controller: 'NodeImageCtrl as vm',
        bindToController: true,
        replace: 'true',
        templateUrl: 'app/node/image/node.image.html',
        restrict: 'E'
      };
   
  }

})();

(function() {
  'use strict';
    
  angular.module('neograph.node.image', [
    'neograph.node.image.controller',
    'neograph.node.images.modal.controller',
    'neograph.node.imageDisplay.directive',
    'neograph.node.image.directive'
  ]);
    

})();
(function() {
  'use strict';
  directive.$inject = ["$timeout"];
  angular.module('neograph.node.imageDisplay.directive', [])
    .directive('nodeImageDisplay', directive);

    function directive($timeout) {
      return {
        scope: {
          url: '='
        },
        replace: 'true',
        template: '<div class="image" style="position:relative"><div class="image-loader ion-ios-loop-strong spin"></div></div>',
        restrict: 'EA',
        link: link
      };

      function link(scope, element, attrs) {
        var url;
        var loader = element.find('.image-loader');

        var image = angular.element('<img/>')
          .on('load',function() {
            loader.removeClass('loading');
            var imageElement = angular.element('<div/>').addClass("image layer");
            imageElement.css({
              'background-image': 'url("' + scope.url +'")'
            });
            element.append(imageElement);
            $timeout(function() {
              imageElement.css({'opacity': 1});
            });

            $timeout(function() {
             // element.find('.complete').remove();
              element.find('.image.layer').addClass('complete');
            }, 1000);
          });

        scope.$watch('url',setImage);
        $timeout(setImage);

        function setImage() {
        
          if (scope.url) {
            loader.addClass('loading');
            image.attr('src', scope.url)
          } else {
            element.find('.image.layer').css({'opacity': 0});
          }
        }
      }
  }

})();

(function() {
  'use strict';

  controller.$inject = ["neo", "modal"];
  angular.module('neograph.node.images.modal.controller', [])
    .controller('NodeImagesModalCtrl', controller);

  function controller(neo, modal) {

    var vm = this;
    var modalId = 'node.images';
    vm.onSelected = onSelected;
    vm.selectConfirm = selectConfirm;
    vm.getMorePictures = getMorePictures;
    vm.filterChanged = filterChanged;
    vm.canGetMorePictures = false;
    vm.pictures = [];
    vm.more = [];
    vm.filters = [];
    vm.enabledFilters = [];

    vm.selectable = false;

    activate();

    var pageNum = 1;
    var pageSize = 20;
    var currentFilters = [];


    function activate() {
      vm.node = modal.getData(modalId).node;
      vm.selectable = modal.getData(modalId).selectable;
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

(function() {
    'use strict';
  angular.module('neograph.node.multiple', ['neograph.neo', 'neograph.utils'])
      .directive('multiple', ['neo', 'utils', function (neo, utils) {
        return {
          restrict: 'E',
          templateUrl: 'app/node/multiple/node.multiple.html',
          scope: {
            nodes: '='
          },
          link: function ($scope) {

            $scope.$watch('nodes', function (nodes) {

              if (nodes) {
                var allLabels = nodes.map(function (node) {
                  return node.labels;
                });

                $scope.labels = allLabels.shift().filter(function (v) {
                  return allLabels.every(function (a) {
                    return a.indexOf(v) !== -1;
                  });
                });

                $scope.originalLabels = angular.copy($scope.labels);// store for saving so we know what to change

              }

            });

            $scope.addLabel = function (item) {

              if ($scope.labels.indexOf(item.Label) === -1) {
                $scope.labels.push(item.Label);
              }
            };
            $scope.removeLabel = function (label) {

              var ind = $scope.labels.indexOf(label);
              if (ind > -1) {
                $scope.labels.splice(ind, 1);
              }

            };

            $scope.save = function () {
              neo.saveMultiple({
                nodes: $scope.nodes,
                labels: $scope.labels,
                originalLabels: $scope.originalLabels
              });
            };

            $scope.restore = function () {
              var restored = [];
              angular.forEach($scope.nodes, function (node) {
                neo.restoreNode(node).then(function () {
                  restored.push(node);
                  if (restored.length === $scope.nodes.length) {
                    $scope.publish('restored', { selection: { nodes: restored } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };

            $scope.delete = function () {
              var deleted = [];
              angular.forEach($scope.nodes, function (node) {
                neo.deleteNode(node).then(function () {
                  deleted.push(node);
                  if (deleted.length === $scope.nodes.length) {
                    $scope.publish('deleted', { selection: { nodes: deleted } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };

            $scope.destroy = function () {
              var deleted = [];
              angular.forEach($scope.nodes, function (node) {
                neo.destroyNode(node).then(function () {
                  deleted.push(node);
                  if (deleted.length === $scope.nodes.length) {
                    $scope.publish('deleted', { selection: { nodes: deleted } });
                    $scope.selection.multiple = undefined;
                    $scope.tabs = [];
                  }
                });
              });
            };


              // $scope.selection.multiple = new (function (nodes, labels) {
              //    var self = this;
              //    this.nodes = nodes;
              //    this.labels = labels;





              // })(params.selection.nodes, labels);

          }
        };
      }]);
})();

(function() {
  'use strict';

  controller.$inject = ["utils", "$scope"];
  angular.module('neograph.node.edit.properties.controller', [])
    .controller('EditPropertiesCtrl', controller);

  function controller(utils, $scope) {

    var vm = this;
    vm.node = {};

 

    vm.nodeTypes = [];
    // Can be called from clicking label,
    // in which case item is text value,
    // or from the typeahead in which case it is an object with Lookup property
    vm.setType = setType;

    // tie label value to lookup if empty or the same already
    $scope.$watch('vm.node.lookup', syncLabelWithLookupIfSame);
    $scope.$watchCollection('vm.node.labels', onNodeLabelsChanged);

    function syncLabelWithLookupIfSame(lookup, beforechange) {
      if (lookup) {
        if (vm.node.label != undefined && 
          vm.node.label.trim() == '' || vm.node.label == beforechange) {
          vm.node.label = lookup;
        }
      }
    }
  
    function onNodeLabelsChanged(labels) {
      if (labels) {
        var selectedTypes = [];
        angular.forEach(vm.node.labels, function (l) {
          if (utils.types[l]) {
            selectedTypes.push(utils.types[l]);
          }
        });
      }
    }

    function setType(type) {
      vm.node.type = type;
    };

  }
})();

(function() {
  'use strict';
  angular.module('neograph.node.properties.directive', [])
    .directive('nodeProperties', directive);

    function directive() {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditPropertiesCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-show="!vm.editing" tfade ng-include="\'app/node/properties/node.properties.html\'"></div>
          <div ng-show="vm.editing" tfade ng-include="\'app/node/properties/node.edit.properties.html\'"></div>
        </div>
        `,
        restrict: 'E'
      };
  }

})();

(function() {
  'use strict';

  angular.module('neograph.node.properties', [
    'neograph.node.edit.properties.controller',
    'neograph.node.properties.directive'
    ]);
})();

(function() {
  'use strict';

  controller.$inject = ["$scope"];
  angular.module('neograph.node.edit.references.controller', [])
    .controller('EditReferencesCtrl', controller);

  function controller($scope) {

    var vm = this;
    vm.node = {};

    /*
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });
    */

  }
})();

(function() {
  'use strict';
  directive.$inject = ["$timeout"];
  angular.module('neograph.node.references.directive', [])
    .directive('nodeReferences', directive);

    function directive($timeout) {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditReferencesCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-if="!vm.editing" ng-include="\'app/node/references/node.references.html\'"></div>
          <div ng-if="vm.editing" ng-include="\'app/node/references/node.edit.references.html\'"></div>
        </div>
        `,
        restrict: 'E',
        link: link
      };

      function link(scope, element, attrs, ctrl) {
      }
   
  }

})();

(function() {
  'use strict';

  angular.module('neograph.node.references', [
    'neograph.node.edit.references.controller',
    'neograph.node.references.directive'
    ]);
})();

(function() {
  'use strict';
    
  controller.$inject = ["$scope", "predicateFactory"];
  angular.module('neograph.node.edit.relationships.controller', [])
    .controller('EditRelationshipsCtrl', controller);

  function controller($scope, predicateFactory) {
    var vm = this;
    vm.node = {};

    vm.nodeTypes = [];

    $scope.$watch('newPredicate', function(predicate) {
      if (predicate) {
        addRelationship({ lookup: predicate.toUpperCase().replace(/ /g, '_') });
      }
    });

    function addRelationship(item) {
      var p = predicateFactory.create({ lookup: item.lookup, direction: 'out' });// currently no way to select 'in' relationships
      vm.node.relationships = vm.node.relationships || {};
      if (!vm.node.relationships[p.toString()]) {
        vm.node.relationships[p.toString()] = { predicate: p, items: [] };
      }
    }
  }

})();

(function() {
  'use strict';
  angular.module('neograph.node.relationships.directive', [])
    .directive('nodeRelationships', directive);

    function directive() {
      return {
        scope: {
          node: '=',
          editing: '='
        },
        controller: 'EditRelationshipsCtrl as vm',
        bindToController: true,
        replace: 'true',
        template: `
        <div>
          <div ng-if="!vm.editing" ng-include="\'app/node/relationships/node.relationships.html\'"></div>
          <div ng-if="vm.editing" ng-include="\'app/node/relationships/node.edit.relationships.html\'"></div>
        </div>
        `,
        restrict: 'E'
      };

  }

})();

(function() {
  'use strict';
    
  angular.module('neograph.node.relationships', [
    'neograph.node.edit.relationships.controller',
    'neograph.node.relationships.directive'
  ]);
    

})();
(function() {
  'use strict';
    
  angular.module('neograph.node.wikipedia', ['neograph.neo'])
      .factory('wikiservice', () => {
        const wikiTabs = (data, page) => {
          let tabs = [];
          if (data.parse) {
            const $wikiDOM = $(`<document>${data.parse.text['*']}</document>`);
            // Handle redirects
            if ($wikiDOM.find('ul.redirectText').length > 0) {
              tabs = { redirect: $wikiDOM.find('ul.redirectText li a').attr('title') };
            } else {
              const images = $('<div></div>');
              $wikiDOM.find('.image').each((i, e) => {
                $(e).
                  attr('href', $(e).attr('href').
                    replace('/wiki/', `https://en.wikipedia.org/wiki/${page.replace(' ', '_')}#/media/`)).
                  attr('target', '_blank').css({ 'padding-right': '5px', 'padding-bottom': '5px' });
              });
              $wikiDOM.find('.image').appendTo(images);
              $wikiDOM.find('p').css({ 'margin-bottom': '4px', 'clear': 'left' });
              $wikiDOM.find('p,.thumb,.thumbinner').css({ 'width': '100%' });
              $wikiDOM.find('h2,h3,h4').css({ 'margin-top': '4px', 'margin-bottom': '2px', 'float': 'left', 'clear': 'left', 'width': '100%', 'overflow': 'hidden' });
              $wikiDOM.find('#toc').remove();
              $wikiDOM.find('.editsection').remove();
              $wikiDOM.find('.magnify').remove();
              $wikiDOM.find('.reflist').remove();
              $wikiDOM.find('img').css({ 'display': 'block', 'float': 'left', 'margin-right': '3px', 'margin-bottom': '3px' });
              $wikiDOM.find('.thumb,.thumbinner').css({ 'float': 'left', 'margin-right': '3px', 'margin-bottom': '3px' });
              $wikiDOM.find('.thumbcaption').css({ 'font-size': '11px' });
              $wikiDOM.find('.plainlinks').remove();
              $wikiDOM.find('#navbox').remove();
              $wikiDOM.find('.rellink').remove();
              $wikiDOM.find('.references').remove();
              $wikiDOM.find('.IPA').remove();
              $wikiDOM.find('sup').remove();
              $wikiDOM.find('dd,blockquote').css({ 'margin': '0px', 'width': '', 'font-size': '11px', 'margin-bottom': '10px', 'margin-top': '7px' });
              $wikiDOM.find('blockquote p').css({ 'font-size': '11px' });
              // NB this has interesting stuff in it
              $wikiDOM.find('.navbox, .vertical-navbox').remove();
              $wikiDOM.find('#persondata').remove();
              $wikiDOM.find('#Footnotes').parent().remove();
              $wikiDOM.find('#References').parent().remove();
              $wikiDOM.find('#Bibliography').parent().remove();
              $wikiDOM.find('.refbegin').remove();
              $wikiDOM.find('.dablink').remove();
              // A bit too radical?
              $wikiDOM.find('small').remove();
              $wikiDOM.find("img[alt='Wikisource-logo.svg'], img[alt='About this sound'], img[alt='Listen']").remove();
              $wikiDOM.find('.mediaContainer').remove();
              // Remove links - (leave external links ?)
              $wikiDOM.find('a').each(() => { $(this).replaceWith($(this).html()); });
              $wikiDOM.find('.gallery').find('p').css({ 'width': '', 'font-size': '11px', 'float': 'left', 'clear': 'left' });
              $wikiDOM.find('.gallery').find('.thumb').css({ 'width': '' });
              $wikiDOM.find('.gallerybox').css('height', '220px');
              $wikiDOM.find('.gallerybox').css('float', 'left');
              $wikiDOM.find('table').css({ 'background': 'none', 'width': '', 'max-width': '', 'color': '' });
              $wikiDOM.find('.gallery').remove();
              $wikiDOM.find('#gallery').parent().remove();
              $wikiDOM.find('#notes').parent().remove();
              $wikiDOM.find('#sources').parent().remove();
              // Radical - remove all tables
              $wikiDOM.find('table').remove();
              $wikiDOM.find('h1,h2,h3,h4').next().css({ 'clear': 'left' });
              $wikiDOM.find('dl').remove();
              $wikiDOM.find('.thumb').remove();
              $wikiDOM.find('ul,.cquote').css({ 'float': 'left', 'clear': 'left' });
              $wikiDOM.find('.infobox, .vcard').remove();
              $wikiDOM.find('.thumbimage').css({ 'max-width': '150px', 'height': 'auto' });
              $wikiDOM.find('.mw-editsection').remove();
              $wikiDOM.html($wikiDOM.html().replace('()', ''));
              $wikiDOM.html($wikiDOM.html().replace('(; ', '('));
              $wikiDOM.find('h2').css({ 'cursor': 'pointer', 'color': 'rgba(0,85,128,1)', 'font-size': '20px' });
              $wikiDOM.find('h3').css({ 'font-size': '18px' });
              $wikiDOM.find('#Gallery').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#See_also').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Notes').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#External_links').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Selected_works').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Sources').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Other_reading').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Further_reading').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Resources').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Further_reading_and_sources').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#List_of_paintings').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Self-portraits').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Selected_paintings').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#References_and_sources').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Partial_list_of_works').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('#Notes_and_references').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('[id^=Selected_works]').parent().nextUntil('h2').andSelf().remove();
              $wikiDOM.find('[id^=Books]').parent().nextUntil('h2').andSelf().remove();

              const $introTab = $('<div></div>');
              $wikiDOM.find('p:first').nextUntil('h2').andSelf().appendTo($introTab);
              if ($introTab.text().indexOf('Redirect') === -1 && $introTab.text().indexOf('may refer to') === -1) {
                $introTab.find('ul').remove();
              }
              if ($introTab.html()) {
                tabs.push({
                  header: 'Summary',
                  content: $introTab.html().replace('/; /g', '')
                });
              }

              $wikiDOM.find('h2').each((i, e) => {
                const $tab = $('<div></div>');
                $(e).nextUntil('h2').appendTo($tab);
                if ($tab.html()) {
                  tabs.push({
                    header: $(e).text(),
                    content: $tab.html()
                  });
                }
              });

              if (images.html()) {
                images.find('img').css({ 'width': '250px', 'marginBottom': '5px' });
                tabs.push({
                  header: 'Images',
                  content: images.html()
                });
              }
            }
          }
          return tabs;
        };

        const getWiki = (page, callback) => {
          $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
            {
              page,
              prop: 'text',
              uselang: 'en'
            },
              data => {
                const tabs = wikiTabs(data, page);
                if (tabs.redirect) {
                  getWiki(tabs.redirect, callback);
                } else {
                  callback(tabs);
                }
              });
        };

        return {
          getPage: (page, callback) => getWiki(page, callback)
        };
      })
      .directive('wikipedia', (wikiservice, neo) => (
        {
          restrict: 'E',
          templateUrl: 'app/node/wikipedia/node.wikipedia.html',
          scope: {
            node: '=',
            window: '=',
            active: '='
          },
          link: ($scope, $element) => {
            $scope.tabs = [];

            $scope.setActiveTab = tab => {
              $scope.activeTab = tab;
            };

            let loaded = false;
            $scope.$watch('node', node => {
              if (node) {
                loaded = false;
                $scope.page = node.Wikipagename || node.Name || node.Title;
              }
            });

            $scope.savePage = () => {
              $scope.node.Wikipagename = $scope.page;
              neo.saveWikipagename($scope.node).then(node => $scope.page = node.Wikipagename);
            };

            const getPage = () => {
              wikiservice.getPage($scope.page, tabs => {
                $scope.tabs = tabs;
                $scope.activeTab = $scope.tabs[0];
                $scope.$digest();
                $($element).find('.wikidropdown').dropdown();
                loaded = true;
              }); };

            $scope.$watch('page', page => {
              if (page && $scope.active) {
                getPage();
              }
              else {
                $scope.tabs = [];
              }
            });

            $scope.$watch('active', active => {
              if ($scope.page && active && !loaded) {
                getPage();
              }
            });
          }
        })
  );
})();

angular.module('neograph.query.generator.favouritesFilter', ['neograph.neo'])
.directive('favouritesFilter', neo => ({
  restrict: 'E',
  templateUrl: 'app/query/generator/favouritesFilter.html',
  scope: {
    options: '=',
    generated: '='
  },
  link: ($scope, $element, $attrs) => {
    $scope.filters = [];
    $scope.node = {};
    let labels = [];
    $scope.$watch('options', function (options) {
      if (options) {
        $scope.node = options.user;
      }
    });

    $scope.$watch('node', function (user) {
      load();
    });

    const load = function () {
      if ($scope.node) {
        labels = [$scope.node.Lookup, 'Favourite'];
        getFilters();
        $scope.enabledFilters = [];
        $scope.process();
      }

    };

    const getFilters = function () {
      if (labels && labels.length) {
        const labelQuery = `match (a:${labels.join(':')}) - [] -> (b) return distinct(LABELS(b))`;
        neo.getDistinctLabelsQuery(labelQuery).
            then(l => {
                // remove filter for this node as it is duplicating
              angular.forEach(labels, function (lab) {
                l.splice($.inArray(lab, l), 1);
              });
              $scope.filters = l;
            });
      }
    };

    $scope.process = labs => {
      if ($scope.node) {
        labs = labs || [];
        let b = 'b';
        if (labs.length) {
          b += `:${labs.join(':')}`;
        }
        const q = `match (a:${labels.join(':')}) - [] -> (${b})`;
        $scope.generated = `${q} return b`;
        if (labs.length) {
          neo.getDistinctLabelsQuery(`${q}  return distinct(LABELS(b))`).
              then(l => { $scope.enabledFilters = l; });
        } else {
          $scope.enabledFilters = [];
        }
      }
    };
  }
})
);

angular.module('neograph.query.generator.nodeFilter', ['neograph.neo'])
    .directive('nodeFilter', neo => ({
      restrict: 'E',
      templateUrl: 'app/query/generator/nodeFilter.html',
      scope: {
        options: '=',
        generated: '=',
        nodechanged: '&?'
      },
      link: ($scope) => {
        $scope.filters = [];
        $scope.node = {};
        let labels = [];

        const getFilters = () => {
          if (labels && labels.length) {
            neo.getDistinctLabels(labels).
                then(l => {
                  // Remove filter for this node as it is duplicating
                  labels.forEach(lab => { l.splice(lab.indexOf(l), 1); });
                  $scope.filters = l;
                });
          }
        };

        const load = () => {
          if ($scope.node) {
            labels = [$scope.node.label, 'Picture'];
            getFilters();
            $scope.enabledFilters = [];
            $scope.process();
          }
        };

        $scope.$watch('options', options => {
          $scope.node = options.node;
        });

        $scope.$watch('node', node => {
          if ($scope.nodechanged) {
            $scope.nodechanged({ node });
          }
          load();
        });

        $scope.openNode = () => {
          if ($scope.node) {
            $scope.publish('selected', { selection:{ nodes:[$scope.node] } });
          }
        };

        $scope.process = labs => {
          if ($scope.node) {
            if (!labs || !labs.length) {
              labs = labels;
            } else {
              labs = labs.concat(labels);
            }
            $scope.generated = `
              match (a:${labs.join(':')}) return a 
              order by a.Status desc limit 500
              `;
            if (labs != labels) {
              neo.getDistinctLabels(labs).
                  then(l => { $scope.enabledFilters = l; });
            } else {
              $scope.enabledFilters = [];
            }
          }
        };
      }
    })
);

angular.module('neograph.query.generator.nodeGraph', ['neograph.neo'])
    .directive('nodeGraph', neo => ({
      restrict: 'E',
      templateUrl: 'app/query/generator/nodeGraph.html',
      scope: {
        options: '=',
        generated: '=',
        nodechanged: '&?'
      },
      link: ($scope) => {
        $scope.querys = [];
        $scope.selected = '';
        $scope.node = {};
        $scope.$watch('options', options => {
          $scope.node = options.node;
        });

        $scope.$watch('selected', sel => {
          if (sel && sel.q) {
            $scope.generated = sel.q;
          }
        });

        $scope.$watch('node', node => {
          if (node && node.id) {
            if ($scope.nodechanged) {
              $scope.nodechanged({ node });
            }
            neo.getNode(node.id, false).
              then(loaded => {
                getQuerys(loaded);
              });
          }
        });

        $scope.openNode = () => {
          if ($scope.node) {
            $scope.publish('selected', { selection: { nodes: [$scope.node] } });
          }
        };

        function getQuerys(node) {
          if (node) {
            const querys = [];
            const Lookup = node.Lookup;

            querys.push({
              name: 'All immediate relationships',
              q: `MATCH (c)-[r]-(d:Global) where ID(c) = ${node.id} return c,d,r`
            });

            querys.push({
              name: 'Self',
              q: `MATCH (c:${node.Label})-[r]-(d:${node.Label}) return c,d,r`
            });

            if (node.labels.indexOf('Provenance') > -1) {
              querys.push(
                {
                  name: 'Provenance',
                  q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' 
                  and not c.Lookup='${Lookup}'  return c,d,r
                  `
                });
            }

            if (node.labels.indexOf('Period') > -1) {
              querys.push({
                name: 'Period',
                q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' and not c.Lookup='${Lookup}'  return c,d,r
                  `
              });
            }

            if (node.labels.indexOf('Theme') > -1) {
              querys.push({
                name: 'Theme',
                q: `
                  MATCH (c:Global:${Lookup})-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) 
                  and not d.Lookup='${Lookup}' and not c.Lookup='${Lookup}'  return c,d,r
                  `
              });
            }

            if (node.labels.indexOf('Person') > -1) {
              querys.push({
                name: 'Outbound Influence',
                q: `
                  MATCH (c {Lookup:'${Lookup}'})-[r]->(d:Painter) 
                  with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e `,
                connectAll: true
              });
              querys.push({
                name: 'Inbound Influence',
                q: `
                  MATCH (c {Lookup:'${Lookup}'})<-[r]-(d:Painter) 
                  with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e 
                  `,
                connectAll: true
              });
            }

            if (node.labels.indexOf('Group') > -1) {
              querys.push({
                name: 'Group',
                q: `
                match (n {Lookup:'${Lookup}'}) -[r]-(m:Global) -[s]-(p:Global) 
                where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) 
                and (m:Painter or m:Group) and (p:Painter or p:Group) 
                and not m:Provenance and not p:Provenance return n,r,m,s,p
                `,
                connectAll: true
              });
            }

            if (node.labels.indexOf('Iconography') > -1) {
              querys.push({
                name: 'Iconography',
                q: `
                MATCH (c:Global:${Lookup})-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  
                and not d.Lookup='${Lookup}' and (d:${Lookup} or d:Provenance or d:Group 
                or d:Iconography or d:Place) return c,d,r
                `,
                connectAll: true
              });
            }

            if (node.YearFrom && node.YearTo) {
              querys.push({
                name: 'YearFromYearTo',
                q: `
                MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and 
                (
                  (c.YearTo >= ${node.YearFrom} and c.YearTo<= ${node.YearTo}) 
                  or (c.YearFrom >= ${node.YearFrom} and c.YearFrom<= ${node.YearTo})
                )
                and 
                (
                  (d.YearTo >= ${node.YearFrom} and d.YearTo<= ${node.YearTo}) 
                  or (d.YearFrom >= ${node.YearFrom} and d.YearFrom<= ${node.YearTo})
                )
                return c,d,r
               `,
                connectAll: true
              });
            }

            const prevselection = $scope.selected.name;

            $scope.querys = querys;
            $scope.querys.forEach(e => {
              if (e.name === prevselection) {
                $scope.selected = e;
              }
            });
          }
        }
      }
    })
);

angular.module('neograph.query.generator', [
  'neograph.query.generator.favouritesFilter',
  'neograph.query.generator.nodeFilter',
  'neograph.query.generator.nodeGraph',
]);
