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
    'neograph.map',
    'neograph.routes',
    'neograph.constant'
    ]);

})();

(function() {

  angular.module('neograph.routes', [])
    .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
      $stateProvider
          .state('admin', { 
            url:'/admin',
            views: {
              '@': {
                templateUrl:'app/partials/admin.html',
                controller: 'AdminCtrl as vm'
              }, 
              'search@admin':{
                templateUrl:'app/search/search.html',
                controller:'SearchCtrl as vm'
              }, 
              'map@admin':{
                templateUrl:'app/map/map.html',
                controller:'MapCtrl as vm'
              }
            }
          });

      $urlRouterProvider.otherwise('/admin');
    }])
    .controller('AdminCtrl', ["$scope", "$state", "nodeService", function($scope, $state, nodeService) {
      var vm = this;
      vm.panelVisible = true;
      vm.node = undefined;
      
      vm.togglePanel = function() {
        vm.panelVisible = !vm.panelVisible;
      }

      $scope.$on('nodeLoaded', onNodeLoaded);

      function onNodeLoaded(event) {
        var node = event.targetScope.node;
        vm.node = node;
      }

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

  angular.module('templates', []);

})();
(function() {
  'use strict';
  directive.$inject = ["$timeout"];
  angular.module('neograph.common.backImg', [])
    .directive('backImg', directive);

    function directive($timeout) {
      return {
        scope: {
          url: '='
        },
        replace: 'true',
        template: '<div class="image" style="position:relative"></div>',
        restrict: 'EA',
        link: link
      };

      function link(scope, element, attrs) {
        var url;
        var image = angular.element('<img/>')
          .on('load',function() {
            var imageElement = angular.element('<div/>').addClass("image layer");
            imageElement.css({
              'background-image': 'url(' + scope.url +')'
            });
            element.append(imageElement);
            $timeout(function() {
              imageElement.css({'opacity':1});
            });

            $timeout(function() {
              element.find('.complete').remove();
              element.find('.image.layer').addClass('complete');
            }, 1000);
          });

        scope.$watch('url',setImage);
        $timeout(setImage);

        function setImage() {
          if (scope.url) {
            image.attr('src', scope.url)
          }
        }
      }
  }

})();

angular.module('neograph.common', [
  'neograph.common.filter',
  'neograph.common.images',
  'neograph.common.labels',
  'neograph.common.network',
  'neograph.common.nodeArray',
  'neograph.common.typeahead',
  'neograph.common.typeaheadSimple',
  'neograph.common.backImg',
  'neograph.common.focusTo'
]);

(function() {
  'use strict';
  angular
    .module('neograph.constant', [])
    .constant('_', window._);
})();
angular.module('neograph.common.filter', [])
.directive('filter', function () {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'app/common/filter.html',
    scope: {

      init: '='// an array of labels
            ,
      enabled: '='
            ,
      process: '&'




    },
    link: function ($scope, $element, $attrs) {

      $scope.filters = {};

      $scope.$watch('init', function (labels) {

        var filters = {};
        angular.forEach(labels, function (f) {
          filters[f] = 0;
        });

        $scope.filters = filters;

      });

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

        }
        else if ($scope.filters[label] == 0) {
          $scope.filters[label] = 1;

        }
                else if ($scope.filters[label] == -1) {
                  for (var f in $scope.filters) {
                    $scope.filters[f] = 0;
                  }
                  $scope.filters[label] = 1;
                }

        var labels = [];
        for (var f in $scope.filters) {

          if ($scope.filters[f] === 1) {
            labels.push(f);
          }

        }


        $scope.process({ labels: labels });



      };


      $scope.$watch('enabled', function (labels) { // labels = selectable labels following filtering

        if (labels && labels.length) {
          for (var f in $scope.filters) {

            if ($.inArray(f, labels) == -1) { // disable filter if not in list
              $scope.filters[f] = -1;
            }
            else if ($scope.filters[f] == -1) { // enable filter if in list and previously disabled
              $scope.filters[f] = 0;
            }
          }
        }
        else {

          for (var f in $scope.filters) {
            $scope.filters[f] = 0;
          }
        }

      });




    }
  };
});

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

          items: '='// an array of string or  items with label property
            ,
          enabled: '='
            ,
          onselected: '&?'
            ,
          node: '=?'
            ,
          directbinding: '@?'// set this to false if passing in array of strings
            ,
          width: '@?'

        },
        link: function ($scope, $element, $attrs) {

          var directBinding = $attrs['directbinding'] == 'false' ? false : true;

          $scope.nodes = [];

          $scope.$watch('items', function (items) {

            if (items && items.length) {

              if (items[0] && (items[0].label || items[0].lookup)) {

                $scope.nodes = items;

              }
              else {
                directBinding = false;
                $scope.nodes = items.map(function (e) { return { label: e }; });


              }

            }
            else {
              if (directBinding) {
                $scope.nodes = items;
              }
              else {
                $scope.nodes = [];
              }

            }
          });

          $($element).on('click', function () {
            $($element).find('input').focus();
          });

          $scope.getClass = function (node) {
            return utils.getLabelClass($scope.node, node.label);
          };

          $scope.clickable = $attrs['onselected'] != undefined;

          $scope.nodeClicked = function (node) {

            if ($attrs['onselected']) {

              $scope.onselected({ item: node });

            }
          };

          var indexOf = function (node) {

            var ind = -1;

            $($scope.nodes).each(function (i, e) {

              if ((node.label && e.label === node.label) || node.lookup && e.lookup == node.lookup) {
                ind = i;
                return;
              }
            });

            return ind;

          };

          $scope.addNode = function (node) {

            if (indexOf(node) == -1) {

              $scope.nodes.push(node);

              if (!directBinding) {

                $scope.items.push(node.label);

              }

            }


                // else highlight the node momentarily


          };

          $scope.removeNode = function (node) {

            var ind = indexOf(node);

            if (ind > -1) {
              $scope.nodes.splice(ind, 1);

              if (!directBinding) {
                $scope.items.splice($scope.items.indexOf(node.label || node.lookup), 1);
              }

            }

          };


        }
      };
    }]);

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
          autosize:'@?'
        },
        template: '<input type="text" class="form-control" />',
        link: function ($scope, element, attrs) {

          var placeholderDefault = 'Node...';

          var $input = $(element);// .find('input');
          $input.attr('placeholder', attrs['placeholder'] || placeholderDefault);

          $scope.$watch('choice', function (n) {
            if (n) {
              $input.val(n.Label || n.label);
            }
          });

          if (!attrs['choice']) {
            $scope.$watch('watchvalue', function (n) {
              $input.val(n);
            });
          }

          if (attrs['autosize']) {

            $input.css({ width: '10px' });
            $input.attr('placeholder', '+');
            $input.on('focus', function () {
              $input.css({ width: '100px' });
              $input.attr('placeholder', attrs['placeholder'] || placeholderDefault);
              setTimeout(function () {
                $input.css({ width: '100px' });
                $input.attr('placeholder', attrs['placeholder'] || placeholderDefault);
              }, 100);

            });
            $input.on('blur', function () {
              $input.css({ width: '10px' });
              $input.attr('placeholder', '+');
              $input.val('');
            });

          }

          $input.typeahead({
            source: getSource(),
            matcher: function (obj) {
              var item = JSON.parse(obj);
              return ~item.label.toLowerCase().indexOf(this.query.toLowerCase());
            },
            sorter: function (items) {
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
            },
            highlighter: function (obj) {
              var item = JSON.parse(obj);
              var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
              var out;
              if (attrs['restrict'] === 'Predicate') {
                out = new utils.Predicate(item.label).ToString().replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                  return '<strong>' + match + '</strong>';
                });
              } else {
                out = item.label.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                  return '<strong>' + match + '</strong>';
                }) + " <div style='float:right;margin-left:8px;color:#ccc'>" + item.type + '</div>';
              }
              return out;
            },
            updater: function (obj) {

              itemSelected = true;

              var item = JSON.parse(obj);

              $scope.$apply(function () {

                if (attrs['choice']) {
                  $scope.choice = item;
                }

                if (attrs['onselected']) {
                  $scope.onselected({ item: item });
                }

              });

              if (!attrs['clearonselect']) {
                return item.label;
              }

            }
          });

          var itemSelected = false;

          $input.on('keydown', function (e) {
            itemSelected = false;
            if (e.keyCode == 13) { // enter

              setTimeout(function () {

                $scope.$apply(function () {
                  if (!itemSelected) {
                    $scope.text = $input.val();
                    $input.val('');
                  }
                });
              }, 100);
            }
          });

          function getSource() {
            if (attrs['restrict'] == 'Type') {
              // convert types object to array
              var source = [];
              for (var key in utils.types) {
                source.push(JSON.stringify(utils.types[key]));
              }
              return source;
            } else if (attrs['restrict'] == 'Predicate') {
              // convert predicates object to array
              var source = [];
              for (var key in utils.predicates) {
                source.push(JSON.stringify(utils.predicates[key]));
              }
              return source;
            } else { 
              return nodeSource;
            }
          }

            // Globals & users or one or the other depending on value of restrict
          var nodeSource = function (query, process) {

            if ($scope.restrict && $.isArray($scope.restrict) && $scope.restrict.length > 0) {

              if ($scope.restrict[0].label) {
                return $scope.restrict.map(function (d) { return JSON.stringify(d); });
              }
              else {
                return $scope.restrict.map(function (d) { return JSON.stringify({ label: d }); });
              }
            }
            else {
              nodeService.search(query, attrs['restrict']).then(function (nodes) {
                process(nodes.map(function (d) {
                  return JSON.stringify(d);
                }));
              });
            }

          };

          $scope.$watch('restrict', function () {
            $input.data('typeahead').source = getSource();
          }, true);
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

(function() {

  'use strict';

  directive.$inject = ["graphService", "$state", "$window", "$timeout"];
  angular.module('neograph.map.graph.directive', [])
    .directive('graph', directive);

  function directive(graphService, $state, $window, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="graphContainer"></div>',
      scope: {
        data: '=',
        onSelect: '&'
      },
      link: linkFn
    }

    function linkFn(scope, element) {
      var graph = {
        nodes: new vis.DataSet(),
        edges: new vis.DataSet()
      };
      scope.data = {
        nodes: {},
        edges: {}
      };
      var options = graphService.options;
      options.onConnect = onNetworkConnect;
      var network = new vis.Network(element[0], graph, options);
      $timeout(setGraphSize);
      $('.network-manipulationUI.connect').hide();
      scope.hoverNode = undefined;

      // Add event listeners
      scope.$watch('data', onDataChanged);
      scope.$on('$stateChangeSuccess', focusCurrentNode);
      angular.element($window).on('resize', setGraphSize);
      // Fit to screen on resize
      network.on('resize', onNetworkResize);
      graph.nodes.on('*', onNodeDatasetChanged);
      network.on('select', onNetworkSelect);
  //    scope.subscribe('deleted', onGlobalDeleted);
  //    scope.subscribe('focus', onGlobalFocus);
      element.on('mousemove', onContainerMouseMove);
    
    // Update existing data (not replace)
 //     scope.subscribe('dataUpdate', onGlobalDataUpdate);

      function onNetworkConnect(data, callback) {
        var newEdge = {
          start: scope.data.nodes[data.from],
          type: graphService.defaultEdgeType(
                  scope.data.nodes[data.from].Type,
                  scope.data.nodes[data.to].Type),
          end: scope.data.nodes[data.to],
          properties: { Weight: 3 }
        };
        scope.publish('newEdge', newEdge);
      }

      function getSelectedNodeId() {
        var selectedNodes = network.getSelectedNodes();
        if (selectedNodes.length === 1) {
          return selectedNodes[0];
        }
        return undefined;
      };

      function focusCurrentNode() {
        if ($state.params.node) {
          Object.keys(scope.data.nodes).forEach(function(key) {
            if (scope.data.nodes[key].label === $state.params.node) {
              if (scope.data.nodes[key].id !== getSelectedNodeId()) {
                network.selectNodes([key]);
                network.focusOnNode(key, {
                  scale: 1.5,
                  animation: {
                    duration: 1000,
                    easingFunction: 'easeOutCubic'
                  }
                });
              }
            }
          });
        }
      }

      function setGraphSize() { 
        network.setSize($window.innerWidth + 'px', $window.innerHeight + 'px'); 
      }

      function onNetworkResize() {
        if (getSelectedNodeId()) {
          network.focusOnNode(getSelectedNodeId(), {
            scale: 1,
            animation: {
              duration: 1000,
              easingFunction: 'easeOutCubic'
            }
          });
        } else {
          network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
        }
      }

      function onNodeDatasetChanged() {
        if (graph.nodes.length) {
          $('.network-manipulationUI.connect').css('display', 'inline-block');
        } else {
          $('.network-manipulationUI.connect').hide();
        }
      }

      function onNetworkSelect(params) {
        var selection = {};
        if (params.nodes.length === 1) {
          selection.node = scope.data.nodes[params.nodes[0]];
        } 
        if (params.edges.length) {
          selection.edges = [];
          params.edges.forEach(function(id) {
            var edge = scope.data.edges[id];
            var startNode = scope.data.nodes[edge.startNode];
            var endNode = scope.data.nodes[edge.endNode];
            selection.edges.push({
              id,
              start: startNode,
              end: endNode,
              type: edge.type,
              properties: edge.properties
            });
          })
        }
        scope.onSelect(selection);

      }

      function onGlobalDeleted(params) {
        if (params.selection.nodes && params.selection.nodes.length) {
          var nodeids = params.selection.nodes.map(n => n.id);
          graph.nodes.remove(nodeids);
        }
        if (params.selection.edges && params.selection.edges.length) {
          var edgeids = params.selection.edges.map(n => n.id);
          graph.edges.remove(edgeids);
        }
      }

      function onGlobalFocus(nodeid) {
        network.focusOnNode(nodeid, {
          scale: 1,
          animation: {
            duration: 1000,
            easingFunction: 'easeOutCubic'
          } });
      }

      function onContainerMouseMove(event) {
        var n = network._getNodeAt({
          x: event.pageX,
          y: event.pageY
        });
        scope.$apply(function() {
          if (n) {
            var dataNode = scope.data.nodes[n.id];
            scope.hoverNode = dataNode;
          //  scope.publish('hover', dataNode);
          } else {
           // scope.publish('hover', undefined);
            scope.hoverNode = undefined;
          }
        });
      }

      function onDataChanged()  {
        console.log('new data');
        graph.nodes.clear();
        graph.edges.clear();
        var gArr = graphService.toGraphData(scope.data);
        graph.nodes.add(gArr.nodes);
        graph.edges.add(gArr.edges);
      }

      function onGlobalDataUpdate(g) {
        if (scope.data) {
          Object.assign(scope.data.edges, g.edges);
          Object.assign(scope.data.nodes, g.nodes);
          var gArr = graphService.toGraphData(g);
          graph.edges.update(gArr.edges);
          graph.nodes.update(gArr.nodes);
        }
      }
    }


  }
  

})();

angular.module('neograph.map.graph', [
  'neograph.map.graph.service',
  'neograph.map.graph.directive'
]);
(function() {

  'use strict';

  factory.$inject = ["nodeFactory"];
  angular.module('neograph.map.graph.service', [])
  .factory('graphService', factory);

  function factory(nodeFactory) {
    
    function graphNodeFromNeoNode(neoNode) {
      neoNode = nodeFactory.create(neoNode);
      var type = neoNode.class;
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
      var node = {
        id: neoNode.id,
        label: neoNode.label || neoNode.lookup,
        size: neoNode.status / 10,
        group: neoNode.class,
        mass: type === 'Group' ? 0.5 : 1,
        radius: neoNode.isPerson() ? neoNode.status : 1,
        // for hiearchichal layout,
        level,
        borderWidth: 0
      };

      var image;// = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

      if (image) {
        node.image = image;
        node.shape = 'image';
      } else if (type === 'Provenance') {
        node.fontSize = 50;
        node.fontColor = 'lightgray';
        node.color = 'transparent';
      } else if (type === 'Iconography' || type === 'Place') {
        node.shape = 'ellipse';
      } else if (type === 'Quotation') {
        node.shape = 'box';
        node.color = 'transparent';
        node.label = neoNode.text;
      } else if (type === 'User') {
        node.shape = 'star';
        node.size = 20;
      } else if (type === 'Link') {
        node.label = neoNode.name;
        node.shape = 'box';
        node.color = 'transparent';
      } else if (neoNode.isPerson()) {
        node.shape = 'dot';
      } else if (neoNode.isProperty()) {
        node.shape = 'circle';
      } else {
        node.shape = 'box';
      }

      node.color = { background: node.color || '#97C2FC', border: 'transparent' };
      if (neoNode.isProperty()) {
        node.color.background = 'lightgreen';
      }
      return node;
    };

    function graphEdgeFromNeoEdge(neoEdge) {
      var type = neoEdge.type;
      var symmetrical = type === 'ASSOCIATED_WITH';
      var hideEdgeLabel =
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

      var colour;
      switch (type) {
        case 'FROM':
          colour = '#EEE';
          break;
        case 'INFLUENCES':
          colour = 'pink';
          break;
        case 'TEACHES':
        case 'TEACHES_AT':
        case 'PROPERTY':
          colour = 'green';
          break;
        default:
          colour = '#3e82bd';
      }

      var hideEdge = type === 'FROM';
      var edge = {
        id: neoEdge.id,
        from: neoEdge.startNode,
        to: neoEdge.endNode,
        label: (
          type !== 'EXTENDS' &&
          type !== 'PROPERTY' &&
          type !== 'INFLUENCES' &&
          type !== 'ASSOCIATED_WITH'
          ) ? type.toLowerCase().replace(/_/g,'') : null,
        fontColor: '#3e82bd',
        color: colour,
        opacity: hideEdge ? 0 : 1, // type === "INFLUENCES" ? 1 : 0.7,
        style: symmetrical ? 'dash-line' : 'arrow', // arrow-center' ,
        type: ['curved'],
        labelAlignment: 'line-center'
      };
      return edge;
    };


    return {
      defaultEdgeType: function(fromType, toType) {
        if (toType === 'Provenance') {
          return 'FROM';
        } else if (toType === 'Painter') {
          return 'INFLUENCES';
        }
        return 'ASSOCIATED_WITH';
      },
      options: {
        edges: { widthSelectionMultiplier: 4 },
        hierarchicalLayout: {
          enabled: false,
          levelSeparation: 10, // make this inversely proportional to number of nodes
          nodeSpacing: 200,
          direction: 'UD', //LR
                  //    layout: "hubsize"
        },
        dataManipulation: {
          enabled: true,
          initiallyVisible: true
        },
              // stabilize: true,
              // stabilizationIterations: 1000,
        physics: {
          barnesHut: {
            enabled: true,
            gravitationalvarant: -6000,
            centralGravity: 1,
            springLength: 20,
            springvarant: 0.04,
            damping: 0.09
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
          }
        },
        onDelete: function(data, callback) {
        }
      },
      // Transforms neo graph data object into object
      // containing array of nodes and array of edges renderable by vis network
      toGraphData: function(g) {
        return {
          nodes: Object.keys(g.nodes).map(function(key) { return graphNodeFromNeoNode(g.nodes[key]); }),
          edges: Object.keys(g.edges).map(function(key) { return graphEdgeFromNeoEdge(g.edges[key]); })
        };
      }
    };
  }

})();
(function() {
  'use strict';
    
  controller.$inject = ["$scope", "$rootScope", "$state", "neo", "nodeService", "mapService"];
  angular.module('neograph.map.controller',['neograph.node.service', 'ui.router'])
    .controller('MapCtrl', controller);

  function controller($scope, $rootScope, $state, neo, nodeService, mapService) {

    var vm = this;
    vm.data = [];
    vm.onGraphSelect = onGraphSelect;
    vm.node = {};
    vm.maps = [];
    vm.selectedMap = {};
    vm.selectedNode = undefined;
    vm.selectedEdges = [];
    vm.goToSelected = goToSelected;

    activate();

    function activate() {
      console.log('map controller activate');
      $rootScope.$on('nodeLoaded', onNodeLoaded);
      function onNodeLoaded(event) {
        console.log('map on node loaded');
        vm.selectedNode = undefined;
        vm.selectedEdges = [];
        vm.node = event.targetScope.node;
        vm.maps = mapService.getQueries(vm.node);
        if (vm.maps && vm.maps.length) {
          vm.selectedMap = vm.maps[0];
        }
      }
    }

    $scope.$watch('vm.selectedMap', function(map) {
      if (map) {
        getData(map).then(function(data) {
          vm.data = data;
        });
      }
    });

    function goToSelected() {
      $state.go('admin.node', {node: vm.selectedNode.label});
    }

    function connectAll (data) {
      return neo.getAllRelationships(data.nodes)
        .then(function(allRelationships)  {
          Object.assign(data.edges, allRelationships.edges);
          return data;
        });
    }

    function getData(query) {
      return neo.getGraph(query.q, false)
        .then(function(data) {
          if (query.connectAll) {
            return connectAll(data);
          } else {
            return data;
          }
        });
    }

    function onGraphSelect(node, edges) {
 
      vm.selectedEdges = edges;
      if (node) {
        if (node === vm.selectedNode) {
           $state.go('admin.node', { node: node.label });
        } else {
           vm.selectedNode = node;
        }
      } else {
        vm.selectedNode = undefined;
      }
    }
  }
 
})();
angular.module('neograph.map', [
  'neograph.map.service',
  'neograph.map.controller',
  'neograph.map.graph',
  'neograph.models.node',
  'ui.router'
]);

(function() {

  'use strict';

  angular.module('neograph.map.service',[])
    .factory('mapService', factory);

  function factory() {

    return {
      getQueries: getQueries
    };

    function getQueries(node) {

      if (!node) return [];

      var queries = [];
      var label = node.label;
      var labels = node.labels;

      if (!labels || !label) return [];

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
          name: 'Outbound Influence',
          q: `
            MATCH (c {Label:'${label}'})-[r]->(d:Painter) 
            with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e `,
          connectAll: true
        });
        queries.push({
          name: 'Inbound Influence',
          q: `
            MATCH (c {Label:'${label}'})<-[r]-(d:Painter) 
            with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e 
            `,
          connectAll: true
        });
      }

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
        q: `MATCH (c)-[r]-(d:Label) where ID(c) = ${node.id} return c,d,r`
      });

      queries.push({
        name: 'Self',
        q: `MATCH (c:${label})-[r]-(d:${label}) return c,d,r`
      });

      return queries;
    }
  }

})();
  angular.module('neograph.models.node', ['neograph.models.predicate'])
  .factory('nodeFactory', ["predicateFactory", function (predicateFactory) {

    function Node(data) {
      this.labels = [];
      this.id = -1;
      Object.assign(this, data);
        // instead i think i should call the service to get the reverse
      for (var relKey in this.relationships) {
        var rel = this.relationships[relKey];
        rel.predicate = predicateFactory.create(rel.predicate);
      }
      if (!this.label && this.lookup) {
        this.label = this.lookup;
      }

      this.isDeleted = this.labels.indexOf('Deleted') > -1;

    }

    Node.prototype.isPicture = function () {
      return this.labels.indexOf('Picture') > -1;
    };

    Node.prototype.isPerson = function () {
      return this.labels.indexOf('Person') > -1;
    };

    Node.prototype.isProperty = function () {
      return this.labels.indexOf('Property') > -1;
    };

   

    Node.prototype.isCustomField = function (key) {
      return key != 'lookup'
            && key != 'class'
            && key != 'label'
            && key != 'description'
            && key != 'text' &&
            key != 'name' &&
            key != 'systemInfo' &&
            key != 'labels' &&
            key != 'id' &&
            key != 'created' &&
            key != 'image' &&
            key != 'relationships' &&
            key != 'labelled';
    };


    return {
      create:function (data) {
        return new Node(data);
      }
    };
  }]);

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
      }
            ,
      get: {
        url: root + '/node/get/:id',
        method: 'GET',
      }
            ,
      getWithRels: {
        url: root + '/node/getWithRels/:id',
        method: 'GET',
      }
                   ,
      getRelationships: {
        url: root + '/node/relationships/:id',
        method: 'GET',
      }
            ,
      getOne: {
        url: root + '/node/single',
        method: 'POST',
      }
            ,
      getList: {
        url: root + '/node/list',
        method: 'POST',
        isArray:true
      }
            ,
      save: {
        url: root + '/node/save',

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
      }
            ,
      saveMultiple: {
        url: root + '/node/saveMultiple',

        method: 'POST'
      }
            ,
      del: {
        url: root + '/node/delete',

        method: 'POST'
      }
            ,
      destroy: {
        url: root + '/node/destroy',

        method: 'POST'
      },
      restore: {
        url: root + '/node/restore',

        method: 'POST'
      }
            ,
      getProps: {
        url: root + '/node/getProps',

        method: 'POST'

      }
               ,
      getImages: {
        url: root + '/node/getImages',
        isArray:true,
        method: 'POST'

      }



    }),
    edge: $resource(null, null, {
      save: {
        url: root + '/edge/save',
        method: 'POST'
      }
            ,
      del: {
        url: root + '/edge/delete',
        method: 'POST'

      }
            ,
      getImageRelationships: {
        url: root + '/edge/imagerelationships',
        method: 'POST'
      }
    })
        ,
    user:$resource(null, null, {
      saveFavourite: {
        url: root + '/user/saveFavourite',

        method: 'POST'

      },
      get: {
        url: root + '/user/:user',
        method: 'GET'
      }
    })
        ,
    graph: $resource(null, null, {
      get: {
        url: root + '/graph',

        method: 'POST'
      }
    })
            ,
    type: $resource(null, null, {
      getAll: {
        url: root + '/types',
        method: 'GET'
      }
    })
        ,
    predicate: $resource(null, null, {
      getAll: {
        url: root + '/predicates',
        method: 'GET'
      }
    })
        ,
    utils:$resource(null, null, {
      getDistinctLabels: {
        url: root + '/utils/distinctLabels',
        isArray:true,
        method: 'POST'
      }
    })

  };

}]);

angular.module('neograph.neo', ['neograph.utils', 'neograph.neo.client'])
.factory('neo', ['neoClient', 'utils', function (neoClient, utils) {

  var api = {
    getGraph: function (q, returnArray) {
      return neoClient.graph.get({ q: q, returnArray: returnArray })
        .$promise.then(function (data) {
          var out = data.toJSON();
          return out;
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
    getImages: function (label) {
      return neoClient.node.getImages({ label: label })
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
      return neoClient.utils.getDistinctLabels({ labels: labels }).$promise;// returns array
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

angular.module('neograph.utils', ['neograph.neo.client', 'neograph.query.presets'])
    .factory('utils', ['neoClient', 'queryPresets', function (neoClient, presets) {


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








      var utils = {

        init: function () {

          utils.refreshTypes();
          utils.refreshPredicates();
          return utils;


        }
        ,
        types: {}

        ,
        predicates: {}
        ,
        isType: function (label) {
          return utils.types[label] != undefined;
        }
        ,
        refreshTypes: function () {

          return neoClient.type.getAll().$promise.then(function (types) {
            utils.types = types;
            return types;
          });
        }
    ,
        refreshPredicates: function () { // consider creating lookup nodes for relationship types so that i can store properties for them

          return neoClient.predicate.getAll().$promise.then(function (predicates) {
            utils.predicates = predicates.toJSON();
               // console.log(utils.predicates);
            return utils.predicates;
          });




        }
     ,
        isSystemInfo: function (label) {

          return label == 'Global' || label == 'Type' || label == 'Label' || label == 'SystemInfo';

        },
        getLabelClass: function (node, label) {





          if (node && label === node.Type) {
            return 'label-warning';
          }

          if (utils.isSystemInfo(label)) {
            return 'label-system';
          }

          if (utils.isType(label)) {
            return 'label-inverse pointer';
          }


          return 'label-info';

        }

        ,
        personTypes: ['Painter',
                'Illustrator',
                'Philosopher',
                'Poet',
                'FilmMaker',
               'Sculptor',
                'Writer',
               'Patron',
                 'Leader',
                 'Explorer',
                 'Composer',
                'Scientist',
                'Caricaturist',
                 'Mathematician']
        ,
        pictureTypes: ['Painting', 'Illustration', 'Drawing', 'Print']
        ,
        isPerson: function (type) {

          return type == 'Painter' ||
                type == 'Illustrator' ||
                type == 'Philosopher' ||
                type == 'Poet' ||
                type == 'FilmMaker' ||
                type == 'Sculptor' ||
                type == 'Writer' ||
                type == 'Patron' ||
                type == 'Leader' ||
                type == 'Explorer' ||
                type == 'Composer' ||
                type == 'Scientist' ||
                type == 'Caricaturist' ||
                type == 'Mathematician';

        }


            // mopve to 'state' object
            ,
        tabSettings: {}
            ,
        selectedTab:'Properties'




      };
      return utils.init();

    }]);

(function() {
  'use strict';

  controller.$inject = ["$scope", "$state", "$stateParams", "nodeService"];
  childController.$inject = ["$scope", "$stateParams", "nodeService"];
  angular.module('neograph.node.controller', [
    'neograph.node.create.controller',
    'neograph.node.header.controller',
    'neograph.node.edit.header.controller',
    'neograph.node.create.header.controller'
    ])
    .controller('NodeCtrl', controller)
    .controller('ChildNodeCtrl', childController);

  function controller($scope, $state, $stateParams, nodeService) {
    var vm = this;
    vm.node = undefined;
    vm.tabs = ['Properties', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    activate();
    function activate() {
      nodeService.get($stateParams.node, true).then(function (node) {
        //set node property on scope - propagates to child controllers
        vm.node = node;
        $scope.node = vm.node;
        $scope.$emit('nodeLoaded', vm.node);
      });
    }
  }

  function childController($scope, $stateParams, nodeService) {
    var vm = this;
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });
  }

})();
(function() {
  'use strict';

  controller.$inject = ["$scope", "$state", "$stateParams", "nodeService", "nodeFactory"];
  angular.module('neograph.node.create.controller', [])
    .controller('NodeCreateCtrl', controller);

  function controller($scope, $state, $stateParams, nodeService, nodeFactory) {
    var vm = this;
    vm.node = nodeFactory.create();
    console.log(vm.node);
    $scope.node = vm.node;
    vm.tabs = ['Properties', 'Relationships', 'References'];
    vm.selectedTab = 'Properties';
    vm.selectTab = function (tab) {
      vm.selectedTab = tab;
    };

    $scope.$emit('nodeLoaded', vm.node);

  }

})();
(function() {
  'use strict';

  controller.$inject = ["$scope", "$state", "nodeService"];
  angular.module('neograph.node.create.header.controller', [])
    .controller('NodeCreateHeaderCtrl', controller);

  function controller($scope, $state, nodeService) {
    var vm = this;
    vm.node = $scope.node;
    vm.cancel = cancel;
    vm.save = save;

    function cancel() {
      //where to ?
    }

    function save() {
      nodeService.save(vm.node)
        .then(function(saved) {
          $state.go('admin.node', { node: saved.label });
        });
    };

  }

})();
(function() {
  'use strict';

  controller.$inject = ["$scope", "$state", "nodeService"];
  angular.module('neograph.node.edit.header.controller', [])
    .controller('NodeEditHeaderCtrl', controller);

  function controller($scope, $state, nodeService) {
    var vm = this;
    vm.node = undefined;
    vm.cancel = cancel;
    vm.save = save;
    vm.restore = restore;

    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function cancel() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function save() {
      nodeService.save(vm.node)
        .then(function(saved) {
          $state.go('admin.node', { node: saved.label });
        });
    };

    function restore() {
      nodeService.restore(vm.node)
        .then(function(restored) {
          $state.go('admin.node', { node: restored.label });
      });
    };
  }

})();
(function() {
  'use strict';

  controller.$inject = ["$scope", "$state"];
  angular.module('neograph.node.header.controller', [])
    .controller('NodeHeaderCtrl', controller);

  function controller($scope, $state) {
    var vm = this;
    vm.node = undefined;
    vm.edit = edit;
    vm.del = del;
    vm.destroy = destroy;
    
    activate();
    function activate() {
      //set node when loaded by parent controller
      $scope.$watch('node', function(node) {
        vm.node = node;
      });
    }

    function reload() {
      $state.go('admin.node', { node: vm.node.label });
    }

    function edit() {
      $state.go('admin.node.edit');
    }

    function del() {
      nodeService.delete(vm.node)
        .then(function(deleted) {
          vm.node = deleted;
          $scope.node = vm.node;
          //$scope.publish('deleted', { selection: { nodes: [n] } });
        });
    };

    function destroy() {
      nodeService.destroy(vm.node)
        .then(function() {
          vm.node = undefined;
          //where to now ???
        });
    };


  }

})();
(function() {
  'use strict';

  angular.module('neograph.node', [
    'neograph.node.wikipedia',
    'neograph.node.multiple',
    'neograph.node.images',
    'neograph.node.properties',
    'neograph.node.relationships',
    'neograph.node.service',
    'neograph.node.routes',
    'neograph.node.controller',
    'ui.router'
  ]);

})();
(function() {
  'use strict';
  
  angular.module('neograph.node.routes',[])
    .config(["$stateProvider", function ($stateProvider) {
        $stateProvider
        .state('admin.createNode', {
          url:'/create/node',
          views:{
            'panel@admin': {
              templateUrl: 'app/node/node.html',
              controller: 'NodeCreateCtrl as vm'
            },
            'header@admin.createNode': {
              templateUrl: 'app/node/node.create.header.html',
              controller:'NodeCreateHeaderCtrl as vm'
            },
            'properties@admin.createNode':{
              templateUrl:'app/node/properties/node.edit.properties.html',
              controller:'EditPropertiesCtrl as vm'
            },
            'relationships@admin.createNode':{
              templateUrl:'app/node/relationships/node.edit.relationships.html',
              controller:'EditRelationshipsCtrl as vm'
            },
            'references@admin.createNode':{
              templateUrl:'app/node/references/node.edit.references.html',
              controller:'EditReferencesCtrl as vm'
            }
          }
        })
        .state('admin.node', {
          url:'/node/:node',
          views: {
            'panel@admin': {
              templateUrl: 'app/node/node.html',
              controller: 'NodeCtrl as vm'
            },
            'header@admin.node': {
              templateUrl: 'app/node/node.header.html',
              controller: 'NodeHeaderCtrl as vm'
            },
            'properties@admin.node': {
              templateUrl: 'app/node/properties/node.properties.html',
              controller: 'ChildNodeCtrl as vm'
            },
            'relationships@admin.node':{
              templateUrl:'app/node/relationships/node.relationships.html',
              controller: 'ChildNodeCtrl as vm'
            },
            'references@admin.node':{
              templateUrl:'app/node/references/node.references.html',
              controller:'ChildNodeCtrl as vm'
            },
            'images@admin.node': {
              templateUrl:'app/node/images/node.images.html',
              controller:'NodeImagesCtrl as vm'
            }
          }
        })
        .state('admin.node.edit', {
          url:'/edit',
          views:{
            'header@admin.node': {
              templateUrl: 'app/node/node.edit.header.html',
              controller:'NodeEditHeaderCtrl as vm'
            },
            'properties@admin.node':{
              templateUrl:'app/node/properties/node.edit.properties.html',
              controller:'EditPropertiesCtrl as vm'
            },
            'relationships@admin.node':{
              templateUrl:'app/node/relationships/node.edit.relationships.html',
              controller:'EditRelationshipsCtrl as vm'
            },
            'references@admin.node':{
              templateUrl:'app/node/references/node.edit.references.html',
              controller:'EditReferencesCtrl as vm'
            }
          }
        });
    }]);
})();

(function() {
  'use strict';

  service.$inject = ["neoClient", "utils", "$q", "nodeFactory"];
  angular.module('neograph.node.service',[])
    .factory('nodeService', service);

  function service(neoClient, utils, $q, nodeFactory) {

    var lastLoadedNode = {};

    var api = {
      setPropsAndTabsFromLabels: function (node) {
        return neoClient.node.setPropsAndTabs({ node:node }).$promise.then(function (data) {
          return data.toJSON();
        });
      },
      get: function (label, addrelprops) {
        if (addrelprops) {
          if (lastLoadedNode && (label === lastLoadedNode.label || label === lastLoadedNode.id)) {
            return $q.when(lastLoadedNode);
          }
          else {
            return neoClient.node.getWithRels({ id: label }).$promise.then(function (node) {
              lastLoadedNode = nodeFactory.create(node.toJSON());
              return lastLoadedNode;
            });
          }
        }
        else {
          return neoClient.node.get({ id: label }).$promise.then(function (node) {
            return node.toJSON();
          });
        }
      },
      getList: function (q, limit) { // q = match (n) & where only (without return)
        return neoClient.node.getList({ q: q, limit: limit }).$promise;// returns array
      },
      // short version for freebase prop saving
      saveWikipagename: function (n) {
        return neoClient.node.saveWikipagename({
          id: n.id,
          name: n.Wikipagename
        })
        .$promise.then(function (data) {
          return data.toJSON();
        });
      },
      getImages:function (node) {
        return neoClient.node.getImages({
          id: node.id,
          isPicture: node.temp.isPicture,
          isGroup: node.temp.isGroup
        }).$promise;// returns array
      },
      saveProps: function (n) {// short version for freebase prop saving
        return neoClient.node.saveProps({ node: n, user: user })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      },
      getProps: function (labels) {
        return neoClient.node.getProps({ labels: labels })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      },
      save: function (n, user) {
        if (n.temp.trimmed) {
          throw ('Node is trimmed - cannot save');
        }
        return neoClient.node.save({ node: n, user: user })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      },
      saveRels: function (n) {
        return neoClient.node.saveRels({ node: n })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      },
      // deletes node and relationships forever
      destroy: function (node) {
        return neoClient.node.destroy({ node: node })
          .$promise.then(function (data) {
            return data.toJSON();
          });
      },
      // only supports 1 node at the mo
      delete: function (node) {
        var deferred = $q.deferred();
        if (node && node.id) {
          return neoClient.node.delete({ node: node })
            .$promise.then(function (data) {
              deferred.resolve(data.toJSON());
            });
        } else {
          deferred.resolve({});
        }
      },
      // only supports 1 node at the mo
      restore: function (node) {
        var deferred = $q.deferred();
        if (node && node.id) {
          neoClient.node.restore({ node: node })
            .$promise.then(function (data) {
              deferred.resolve(data.toJSON());
            });
        } else {
          deferred.resolve({});
        }
        return deferred.promise;
      },
      search: function (txt, restrict) { // restrict = labels to restrict matches to
        if (txt) {
          return neoClient.node.search({ txt: txt, restrict: restrict }).$promise;// returns array
        }
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
    
    controller.$inject = ["$scope", "$state", "nodeService"];
  angular.module('neograph.search',['neograph.node.service', 'ui.router'])
    .controller('SearchCtrl', controller);

  function controller($scope, $state, nodeService) {
      var vm = this;
      vm.node = undefined;
      $scope.$watch('vm.node', function (n) {
        if (n && n.label) {
          $state.go('admin.node', { node: n.label });
        }
      });

      vm.newNode = newNode;
      vm.addNodeToGraph = addNodeToGraph;

      function addNodeToGraph(node) {
      
        if (!$scope.views.Graph.data.nodes[node.id]) {
          neo.getRelationships(node.id).then(function (g) {

            var newData = {
              edges: g.edges,
              nodes: {}
            };
            newData.nodes[node.id] = node;

            $scope.publish('dataUpdate', newData);

            if (node.id === $scope.selection.selectedNode.id) {
              $scope.publish('selected', { selection: { nodes: [node.id] } });
              $scope.publish('focus', node.id);
            }

          });
          $scope.activeView = graphView;
        }
      };

      function newNode() {

        var newNode = {
          id: -1,
          labels: [],
          Type: '',
          temp: {
            tabs: ['Properties']
          }
        };

        if (vm.nodeLookupText && (!vm.selection.selectedNode || vm.nodeLookupText != vm.selection.selectedNode.Lookup)) {
          newNode.lookup = vm.nodeLookupText;
        }
        vm.selection.selectedNode = newNode;
        vm.tabs = $scope.selection.selectedNode.temp.tabs;
        vm.selectedTab = 'Properties';
      }
    }
 
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

  controller.$inject = ["$scope", "$stateParams", "neo", "nodeService"];
  angular.module('neograph.node.images', ['neograph.neo', 'ui.router'])
    .controller('NodeImagesCtrl', controller);

  function controller($scope, $stateParams, neo, nodeService) {
    var vm = this;
    vm.images = [];
    if ($stateParams.node) {
      neo.getImages($stateParams.node).then(function (images) {
        vm.images = images;
        loaded = true;
      });
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
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

    vm.nodeTypes = [];
    // Can be called from clicking label,
    // in which case item is text value,
    // or from the typeahead in which case it is an object with Lookup property
    vm.setType = setType;

    // tie label value to lookup if empty or the same already
    $scope.$watch('vm.node.lookup', onNodeLookupChanged);
    $scope.$watchCollection('vm.node.labels', onNodeLabelsChanged);

    function onNodeLookupChanged(lookup, beforechange) {
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
            selectedTypes.push({ lookup: l, class: 'Type' });
          }
        });
        vm.nodeTypes = selectedTypes;
        if (!vm.node.class && vm.nodeTypes.length === 1) {
          vm.node.class = vm.nodeTypes[0].lookup; // for types the lookup will always be the label
        }
      }
    }

    function setType(item) {
      if (utils.isType(item.label)) {
        $scope.node.class = item.label;
      }
    };

  }
})();

(function() {
  'use strict';

  angular.module('neograph.node.properties', [
    'neograph.node.edit.properties.controller'
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
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

  }
})();

(function() {
  'use strict';

  angular.module('neograph.node.references', [
    'neograph.node.edit.references.controller'
    ]);
})();

(function() {
  'use strict';
    
  controller.$inject = ["$scope", "predicateFactory"];
  angular.module('neograph.node.relationships.edit.controller', [])
    .controller('EditRelationshipsCtrl', controller);

  function controller($scope, predicateFactory) {
    var vm = this;
    vm.node = {};
    //set node when loaded by parent controller
    $scope.$watch('node', function(node) {
      vm.node = node;
    });

    vm.nodeTypes = [];

    $scope.$watch('vm.node', function(node) {
      if (node) {
        node.labelled = node.labelled || [];
        $('.labelEdit input').val('');
        vm.deleted = node.labels.indexOf('Deleted') > -1;
      }
    });

    $scope.$watch('newPredicate', function(v) {
      if (v) {
        addRelationship({ lookup: v.toUpperCase().replace(/ /g, '_') });
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
    
  angular.module('neograph.node.relationships', [
    'neograph.node.relationships.edit.controller',
    'neograph.node.service', 
    'neograph.session', 
    'neograph.utils', 
    'neograph.models.predicate', 
    'ui.router'
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
