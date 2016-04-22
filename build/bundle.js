"use strict";

angular.module("templates", []);
var app = angular.module("Neograph", ["templates", 'publishSubscribe', 'ui.router', 'ngSanitize', 'neograph.common', 'neograph.edge', 'neograph.graph', 'neograph.interaction', 'neograph.layout', 'neograph.neo', 'neograph.node', 'neograph.query', 'neograph.controller.mob']).config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {

    $stateProvider.state('admin', {
        url: '/admin',
        templateUrl: 'app/partials/admin.html'
    }).state('admin.main', {
        url: '/main?querypreset',
        views: {
            'nodeSearch@admin': {
                controller: 'NodeSearchCtrl',
                templateUrl: 'app/node/node.search.html'
            },

            'query@admin': {
                controller: 'QueryCtrl',
                templateUrl: 'app/query/query.html'
            },

            'queryResults@admin': {
                controller: 'QueryResultsCtrl',
                templateUrl: 'app/query/queryResults.html'
            }

        }

    });

    $urlRouterProvider.otherwise("/admin/main");
}]).controller("AdminController", ['$scope', 'neo', 'queryPresets', 'utils', 'session', function ($scope, neo, presets, utils, session) {

    //SWAP ADMIRES FOR INSPIRES
    //MATCH (n)-[r:ADMIRES]->(m) CREATE (m)-[r2:INSPIRES]->(n) SET r2 = r WITH r DELETE r

    $scope.subscribe("hover", function (node) {

        $scope.selection.hoverNode = node;
    });

    //= function () {

    //    var view = newView($scope.selection.selectedNode.Lookup, "Grid");
    //    view.queryGenerators.nodeFilter.options = { node: $scope.selection.selectedNode };
    //    view.queryGenerator = view.queryGenerators.nodeFilter;
    //    $scope.activeViewKey = view.key;

    //}

    function shouldEnabledAddToGraph() {

        $scope.enableAddToGraph = $scope.selection.selectedNode && $scope.selection.selectedNode.id && $scope.activeView.type == "Graph" && !$scope.activeView.data.nodes[$scope.selection.selectedNode.id];
    }

    $scope.$watch('selection.selectedEdge', function (edge) {

        if (edge) {
            $scope.selection.selectedNode = undefined;
            $scope.selection.multiple = undefined;
            $scope.selection.images = [];
        }
    });

    $scope.subscribe("favourite", function (node) {

        neo.saveFavourite(node, session.user);
    });

    ////published by graph ondelete
    //$scope.subscribe("deleting", function () {

    //    if (confirm("Delete Confirm ? ")) {
    //        //TODO: WHY DOES THIS FIRE 3 TIMES ??
    //        if ($scope.selection.selectedNode) {

    //            $scope.deleteNode($scope.selection.selectedNode);

    //        }
    //        else if ($scope.selection.selectedEdge) {

    //            $scope.deleteEdge($scope.selection.selectedEdge);
    //        }
    //    }

    //})

    //published by graph onconnecting
    //the new edge shows in the properties window and must then be saved
    $scope.subscribe("newEdge", function (newEdge) {

        $scope.$apply(function () {

            $scope.selection.selectedEdge = newEdge;
            $scope.tabs = ["Properties"];
            $scope.selectedTab = "Properties";
        });
    });

    /*
        $scope.defaultpreset = presets["British Only"];
      
       
        setTimeout(function(){
            var initNode = {id:78550};
            
             $scope.nodeLookup=initNode;
            $scope.publish("selected", 
            {
                selection:{nodes:[initNode]}
            }
            );
            
            $scope.selectedTab = "Images";
            
        },1000);
    */
}]).run(["$rootScope", "PubSubService", function ($rootScope, PubSubService) {
    PubSubService.Initialize($rootScope);
}]);
'use strict';

document.addEventListener('DOMContentLoaded', function () {

    $('#btn').click(function () {

        chrome.tabs.executeScript(null, { file: "angular.min.js" });
        chrome.tabs.executeScript(null, { file: "jquery.js" });
        chrome.tabs.executeScript(null, { file: "scraper/controller.js" });
        chrome.tabs.executeScript(null, { file: "scraper/scraper.js" });
    });

    var addDependencies = function addDependencies() {

        chrome.tabs.insertCSS(null, { file: "ext/lib/bootstrap-button.css" });
        chrome.tabs.insertCSS(null, { file: "ext/lib/bootstrap-dropdown.css" });
        chrome.tabs.insertCSS(null, { file: "ext/style.css" });
        chrome.tabs.executeScript(null, { file: "ext/lib/jquery.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/bootstrap.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular.min.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular-resource.min.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular-sanitize.min.js" });
        chrome.tabs.executeScript(null, { file: "modules.js" });
        chrome.tabs.executeScript(null, { file: "filters/filters.js" });
        chrome.tabs.executeScript(null, { file: "factories/neoHelper.js" });
        chrome.tabs.executeScript(null, { file: "factories/utils.js" });
        chrome.tabs.executeScript(null, { file: "factories/neo.js" });
        chrome.tabs.executeScript(null, { file: "directives/typeahead.js" });
    };

    $('#google').click(function () {
        addDependencies();
        chrome.tabs.executeScript(null, { file: "ext/google.js" });
    });

    $('#tate').click(function () {
        addDependencies();
        chrome.tabs.executeScript(null, { file: "ext/tate.js" });
    });
});
'use strict';

angular.module("publishSubscribe", []).service('PubSubService', function () {

    return { Initialize: Initialize };

    function Initialize(scope) {
        //Keep a dictionary to store the events and its subscriptions
        var publishEventMap = {};

        //Register publish events
        scope.constructor.prototype.publish = scope.constructor.prototype.publish || function () {
            var _thisScope = this,
                handlers,
                args,
                evnt;
            //Get event and rest of the data
            args = [].slice.call(arguments);
            evnt = args.splice(0, 1);
            //Loop though each handlerMap and invoke the handler
            angular.forEach(publishEventMap[evnt] || [], function (handlerMap) {
                handlerMap.handler.apply(_thisScope, args);
            });
        };

        //Register Subscribe events
        scope.constructor.prototype.subscribe = scope.constructor.prototype.subscribe || function (evnt, handler) {
            var _thisScope = this,
                handlers = publishEventMap[evnt] = publishEventMap[evnt] || [];

            //Just keep the scopeid for reference later for cleanup
            handlers.push({ $id: _thisScope.$id, handler: handler });
            //When scope is destroy remove the handlers that it has subscribed. 
            _thisScope.$on('$destroy', function () {
                for (var i = 0, l = handlers.length; i < l; i++) {
                    if (handlers[i].$id === _thisScope.$id) {
                        handlers.splice(i, 1);
                        break;
                    }
                }
            });
        };
    }
});
'use strict';

angular.module('neograph.settings', []).factory("settings", function () {

    return {
        apiRoot: 'http://localhost:1337'
    };
});
'use strict';

angular.module('neograph.common', ['neograph.common.filter', 'neograph.common.filters', 'neograph.common.images', 'neograph.common.labels', 'neograph.common.nodeArray', 'neograph.common.typeahead', 'neograph.common.typeaheadSimple']);
'use strict';

angular.module('neograph.common.filter', []).directive('filter', function () {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/common/filter.html',
        scope: {

            init: '=' //an array of labels

            , enabled: '=',

            process: '&'

        },
        link: function link($scope, $element, $attrs) {

            $scope.filters = {};

            $scope.$watch('init', function (labels) {

                var filters = {};
                angular.forEach(labels, function (f) {
                    filters[f] = 0;
                });

                $scope.filters = filters;
            });

            $scope.getFilterClass = function (value) {

                if (value === 1) return 'label-success';else if (value === 0) return 'label-info';else return '';
            };

            $scope.toggleFilter = function (label) {
                if ($scope.filters[label] == 1) {
                    $scope.filters[label] = 0;
                } else if ($scope.filters[label] == 0) {
                    $scope.filters[label] = 1;
                } else if ($scope.filters[label] == -1) {
                    for (var f in $scope.filters) {
                        $scope.filters[f] = 0;
                    };
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

            $scope.$watch("enabled", function (labels) {
                //labels = selectable labels following filtering

                if (labels && labels.length) {
                    for (var f in $scope.filters) {

                        if ($.inArray(f, labels) == -1) {
                            //disable filter if not in list
                            $scope.filters[f] = -1;
                        } else if ($scope.filters[f] == -1) {
                            //enable filter if in list and previously disabled
                            $scope.filters[f] = 0;
                        }
                    }
                } else {

                    for (var f in $scope.filters) {
                        $scope.filters[f] = 0;
                    }
                }
            });
        }
    };
});
'use strict';

angular.module('neograph.common.filters', []).filter('checkmark', function () {
    return function (input) {
        return input ? '✓' : '✘';
    };
}).filter('predicate', function () {
    return function (input) {
        return input ? '✓' : '✘';
    };
});
'use strict';

angular.module('neograph.common.images', ['neograph.neo', 'neograph.session']).directive('images', ['neo', 'session', function (neo) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/common/images.html',
        scope: {
            editing: '=',
            nodes: '=' //must be an array to preserve sort order
            , active: '=',
            updatemasonry: '=' //required to update masonry on resize

        },
        link: function link($scope, $element, $attrs) {

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

            var applyMasonry = function applyMasonry() {

                //    if ($scope.updatemasonry) {

                setTimeout(function () {

                    if ($ul.hasClass('masonry')) {
                        $ul.masonry('reload');
                    } else {
                        $ul.masonry({
                            nodeselector: 'li'
                            //,
                            //columnWidth: 1,
                            //"isFitWidth": true
                        });
                    }

                    $ul.addClass('masonryLoaded');
                }, 100);
                //   }
                //     else {
                //   $ul.addClass('masonryLoaded');
                ///     }
            };

            $scope.navigate = function (label) {
                $scope.publish("query", {
                    name: label,
                    view: label,
                    type: "Grid",
                    queryGenerator: { id: "nodeFilter", options: { node: { Label: label } } }
                });
            };

            $scope.selectAll = function () {

                if ($ul.find("li.ui-selected").length < $ul.find("li").length) {
                    $ul.find("li").addClass("ui-selected");
                    $scope.selected = $scope.nodes.map(function (e, i) {
                        return i;
                    });
                } else {
                    $ul.find("li").removeClass("ui-selected");
                    $scope.selected = [];
                }
            };

            //this assumes that we are looking at a view of not deleted items
            $scope.subscribe("deleted", function (params) {

                // alternatively i could have a deep watch on nodearray and update that
                removeItems(params.selection.nodes);
            });

            //this assumes that we are looking at a view of deleted items
            $scope.subscribe("restored", function (params) {

                // alternatively i could have a deep watch on nodearray and update that
                removeItems(params.selection.nodes);
            });

            var removeItems = function removeItems(items) {

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

                if (value === 1) return 'label-success';else if (value === 0) return 'label-info';else return '';
            };

            $scope.toggleFilter = function (label) {
                if ($scope.filters[label] == 1) {
                    $scope.filters[label] = 0;
                    refreshContent();
                } else if ($scope.filters[label] == 0) {
                    $scope.filters[label] = 1;
                    refreshContent();
                } else if ($scope.filters[label] == -1) {
                    for (var f in $scope.filters) {
                        $scope.filters[f] = 0;
                    };

                    $scope.filters[label] = 1;
                    refreshContent();
                }
            };

            //triggered by selecting a filter
            $scope.$watch('filterBy', function (label) {
                if (label) {
                    $scope.filters[label] = 1;
                    $scope.filterBy = undefined;
                    refreshContent();
                }
            });

            //triggered by selecting one or more images
            $scope.$watch('selected', function (selected) {
                // NB selected is now an array of node indexes

                if (selected && selected.length) {

                    var selectedNodes = selected.map(function (i) {
                        return $scope.nodes[i];
                    });

                    //NB if there are multiple instances of the images directive (as typically) it wont be possible ot know which one the event was sent from
                    //but mainly we need to know that it wasnt sent from the graph or controller, as images currently doesnt substribe to selected event
                    $scope.publish("selected", { sender: "Images", selection: { nodes: selectedNodes } });
                }
            });

            $scope.makeFavourite = function (node) {
                console.log(node);
                $scope.publish("favourite", node);
            };
        }
    };
}]);
'use strict';

angular.module('neograph.common.labels', ['neograph.neo', 'neograph.utils']).directive('labels', ['neo', 'utils', function (neo, utils) {
    return {
        restrict: 'E',
        templateUrl: 'app/common/labels.html',
        scope: {
            node: '=?',

            labels: '=?',

            items: '=?',

            navpath: '@',

            highlight: '@?'
        },
        link: function link($scope, $element, $attrs) {

            $scope.$watch('node', function (node) {
                if (node) {
                    $scope.labels = $scope.node.labels;
                }
            });

            $scope.$watch('items', function (items) {
                if (items) {
                    $scope.labels = $scope.items.map(function (x) {
                        return x.label;
                    });
                }
            });

            $scope.getClass = function (label) {
                if (label === $attrs['highlight']) {
                    return 'label-warning';
                } else return utils.getLabelClass($scope.node, label);
            };
        }
    };
}]);
'use strict';

angular.module('neograph.common.nodeArray', ['neograph.utils']).directive('nodeArray', ['utils', function (utils) {
            return {
                        replace: true,
                        restrict: 'EA',
                        templateUrl: 'app/common/nodeArray.html',
                        scope: {

                                    items: '=' //an array of string or  items with label property

                                    , enabled: '=',

                                    onselected: '&?',

                                    node: '=?',

                                    directbinding: '@?' //set this to false if passing in array of strings

                                    , width: '@?'

                        },
                        link: function link($scope, $element, $attrs) {

                                    var directBinding = $attrs["directbinding"] == "false" ? false : true;

                                    $scope.nodes = [];

                                    $scope.$watch('items', function (items) {

                                                if (items && items.length) {
                                                            console.log(items);

                                                            if (items[0] && (items[0].label || items[0].lookup)) {

                                                                        $scope.nodes = items;
                                                            } else {
                                                                        directBinding = false;
                                                                        $scope.nodes = items.map(function (e) {
                                                                                    return { label: e };
                                                                        });
                                                            }

                                                            console.log($scope.nodes);
                                                } else {
                                                            if (directBinding) {
                                                                        $scope.nodes = items;
                                                            } else {
                                                                        $scope.nodes = [];
                                                            }
                                                }
                                    });

                                    $($element).on('click', function () {
                                                $($element).find('input').focus();
                                    });

                                    ////update items array (needed as items can be array of text items not nodes)
                                    //$scope.$watch('nodes', function (nodes) {
                                    //    if (!directBinding) {
                                    //        mappingNodesToItems = true;
                                    //        $scope.items = nodes.map(function (n) { return n.Label; })
                                    //        mappingNodesToItems = false;
                                    //    }

                                    //}, true)

                                    //$scope.getWidth = function () {
                                    //    if ($scope.nodes) {
                                    //        return $attrs["width"] ? $attrs["width"] : $scope.nodes.length > 5 ? '495px' : '230px'
                                    //    }
                                    //    else {
                                    //        return null;
                                    //    }
                                    //}

                                    $scope.getClass = function (node) {
                                                return utils.getLabelClass($scope.node, node.label);
                                    };

                                    $scope.clickable = $attrs["onselected"] != undefined;

                                    $scope.nodeClicked = function (node) {

                                                if ($attrs["onselected"]) {

                                                            $scope.onselected({ item: node });
                                                }
                                    };

                                    var indexOf = function indexOf(node) {

                                                var ind = -1;

                                                $($scope.nodes).each(function (i, e) {

                                                            if (node.label && e.label === node.label || node.lookup && e.lookup == node.lookup) {
                                                                        ind = i;
                                                                        return;
                                                            }
                                                });

                                                return ind;
                                    };

                                    $scope.addNode = function (node) {
                                                console.log(node);
                                                console.log(directBinding);
                                                if (indexOf(node) == -1) {
                                                            console.log('node adding');
                                                            $scope.nodes.push(node);

                                                            if (!directBinding) {
                                                                        console.log('item adding');
                                                                        $scope.items.push(node.label);
                                                            }
                                                }

                                                //else highlight the node momentarily
                                    };

                                    $scope.removeNode = function (node) {
                                                console.log(node);
                                                var ind = indexOf(node);
                                                console.log(ind);
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
'use strict';

angular.module('neograph.common.typeahead', ['neograph.utils', 'neograph.node.service']).directive('typeahead', ['utils', 'nodeService', function (utils, nodeService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            choice: '=?', //the choice should be an object for 2 way binding with lookup property
            watchvalue: '=?', //watchvalue should be a text string  -just for updating the textbox value when the value changes, not fed back
            text: '=?', //to feed back the text value when it changes (when no item has been selected)
            restrict: '=?', //options to retrict the items that can be selected = Type,Predicate,User,custom object array with lookup property
            onselected: '&?',
            autosize: '@?'

        },
        template: '<input type="text" class="form-control" />',
        link: function link($scope, element, attrs) {

            var placeholderDefault = "Node...";

            var $input = $(element); //.find('input');
            $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);

            $scope.$watch('choice', function (n) {
                if (n) {
                    $input.val(n.Label || n.lookup);
                }
            });

            if (!attrs["choice"]) {
                $scope.$watch('watchvalue', function (n) {
                    $input.val(n);
                });
            }

            if (attrs["autosize"]) {

                $input.css({ width: '10px' });
                $input.attr("placeholder", "+");
                $input.on("focus", function () {
                    $input.css({ width: '100px' });
                    $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);
                    setTimeout(function () {
                        $input.css({ width: '100px' });
                        $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);
                    }, 100);
                });
                $input.on("blur", function () {
                    $input.css({ width: '10px' });
                    $input.attr("placeholder", "+");
                    $input.val('');
                });
            }

            $input.typeahead({
                source: getSource(),

                matcher: function matcher(obj) {

                    var item = JSON.parse(obj);

                    return ~item.lookup.toLowerCase().indexOf(this.query.toLowerCase());
                },

                sorter: function sorter(items) {
                    var beginswith = [],
                        caseSensitive = [],
                        caseInsensitive = [],
                        aItem,
                        item;
                    while (aItem = items.shift()) {
                        var item = JSON.parse(aItem);
                        if (!item.lookup.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(JSON.stringify(item));else if (~item.lookup.indexOf(this.query)) caseSensitive.push(JSON.stringify(item));else caseInsensitive.push(JSON.stringify(item));
                    }

                    return beginswith.concat(caseSensitive, caseInsensitive);
                },
                highlighter: function highlighter(obj) {
                    var item = JSON.parse(obj);
                    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                    var out;

                    if (attrs["restrict"] == "Predicate") {
                        out = new utils.Predicate(item.lookup).ToString().replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                            return '<strong>' + match + '</strong>';
                        });
                    } else {

                        out = item.lookup.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                            return '<strong>' + match + '</strong>';
                        }) + " <div style='float:right;margin-left:8px;color:#ccc'>" + item.class + "</div>";
                    }

                    return out;
                },
                updater: function updater(obj) {

                    itemSelected = true;

                    var item = JSON.parse(obj);

                    $scope.$apply(function () {

                        if (attrs["choice"]) {
                            $scope.choice = item;
                            //if (attrs["clearonselect"]) {
                            //    $scope.choice = undefined;
                            //    $scope.text = "";
                            //}
                        }

                        if (attrs["onselected"]) {
                            $scope.onselected({ item: item });
                        }
                    });

                    if (!attrs["clearonselect"]) {

                        return item.lookup;
                    }
                }
            });

            var itemSelected = false;

            $input.on('keydown', function (e) {
                itemSelected = false;
                if (e.keyCode == 13) {
                    //enter

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

                if (attrs["restrict"] == "Type") {
                    //convert types object to array
                    var source = [];
                    for (var key in utils.types) {
                        source.push(JSON.stringify(utils.types[key]));
                    }
                    return source;
                } else if (attrs["restrict"] == "Predicate") {
                    //convert predicates object to array
                    var source = [];
                    for (var key in utils.predicates) {
                        source.push(JSON.stringify(utils.predicates[key]));
                    }

                    return source;
                } else return nodeSource;
            }

            //Globals & users or one or the other depending on value of restrict
            var nodeSource = function nodeSource(query, process) {

                if ($scope.restrict && $.isArray($scope.restrict) && $scope.restrict.lenth > 0) {

                    if ($scope.restrict[0].lookup) {
                        return $scope.restrict.map(function (d) {
                            return JSON.stringify(d);
                        });
                    } else {
                        return $scope.restrict.map(function (d) {
                            return JSON.stringify({ lookup: d });
                        });
                    }
                } else {
                    nodeService.search(query, attrs["restrict"]).then(function (nodes) {

                        console.log(nodes);
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
'use strict';

angular.module('neograph.common.typeaheadSimple', []).directive('typeaheadSimple', [function () {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            ngModel: '=?', //the choice should be an object for 2 way binding with Lookup property
            source: '='
        },
        template: '<input type="text" />',
        link: function link($scope, element, attrs) {

            var placeholderDefault = "";

            var $input = $(element); //.find('input');
            $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);

            $input.typeahead({
                source: $scope.source,
                updater: function updater(item) {

                    $scope.$apply(function () {

                        $scope.ngModel = item;
                    });

                    return item;
                }
            });
        }
    };
}]);
'use strict';

angular.module('neograph.controller.mob', ['neograph.neo', 'neograph.utils', 'neograph.session']).controller("MobController", ['$scope', '$window', '$document', 'neo', 'utils', 'session', '$routeParams', '$location', function ($scope, $window, $document, neo, utils, session, routeParams, $location) {

    $scope.window = {
        tabsWidth: 0,
        topBarHeight: 150
    };

    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    };

    $scope.tabs = [];

    $scope.selectTab = function (tab) {
        $scope.selectedTab = tab;
        utils.selectedTab = tab;
    };

    if (routeParams.label) {

        //load full node including labels and relationships
        neo.getNodeByLabel(routeParams.label, true).then(function (node) {
            $scope.selection.selectedNode = node;
            $scope.tabs = $scope.selection.selectedNode.temp.tabs;
            setTab();
        });
    }

    if (routeParams.pictureid) {

        // utils.selectedTab = "Images";

        //load full node including labels and relationships
        neo.getNode(routeParams.pictureid, true).then(function (node) {
            $scope.selection.selectedNode = node;
            $scope.tabs = $scope.selection.selectedNode.temp.tabs;
            setTab();
        });
    }

    $scope.$watch('nodeLookup', function (n) {

        if (n && n.id) {

            $location.path('/label/' + n.Label);

            ////load full node including labels and relationships
            //neo.getNode(n.id, true)
            //.then(function (node) {
            //    $scope.selection.selectedNode = node;
            //    $scope.tabs = $scope.selection.selectedNode.temp.tabs;
            //    setTab();
            //});
        }
    });

    var setTab = function setTab() {

        if ($scope.tabs.indexOf(utils.selectedTab) > -1) {
            $scope.selectTab(utils.selectedTab);
        } else {
            $scope.selectTab($scope.tabs[0]);
        }
    };

    $scope.tabSettings = utils.tabSettings;

    $scope.$watch('tabs', function (tabs) {
        $(tabs).each(function (i, tab) {

            if (utils.tabSettings[tab] === undefined) {
                utils.tabSettings[tab] = {
                    'editable': false
                };
            }
        });
    });

    $scope.toggleEditSelectedTab = function () {

        utils.tabSettings[$scope.selectedTab].editable = !$scope.tabSettings[$scope.selectedTab].editable;
    };

    //update tabs & properties if labels change
    var settingPropsAndTabs = false;

    //how can i stop this firing for newly loaded nodes ?
    $scope.$watchCollection('selection.selectedNode.labels', function (labels) {

        if (labels && labels.length && !settingPropsAndTabs) {

            settingPropsAndTabs = true;

            neo.getProps(labels).then(function (out) {

                $scope.selection.selectedNode = $.extend(null, out.properties, $scope.selection.selectedNode);
                $scope.selection.selectedNode.temp.tabs = out.tabs;
                $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                if (session.user.favourites[$scope.selection.selectedNode.id]) {
                    $scope.tabs.push("Favourite");
                }
                settingPropsAndTabs = false;
            });
        }
    });

    $scope.newNode = function () {

        var newNode = {
            id: -1,
            labels: [],
            Type: "",
            temp: {
                tabs: ["Properties"]
            }
        };

        if ($scope.nodeLookupText && (!$scope.selection.selectedNode || $scope.nodeLookupText != $scope.selection.selectedNode.Lookup)) {
            newNode.Lookup = $scope.nodeLookupText;
        }

        $scope.selection.selectedNode = newNode;
        $scope.tabs = $scope.selection.selectedNode.temp.tabs;

        $scope.selectedTab = 'Properties';
    };
}]);
'use strict';

angular.module('neograph.controller.mob', ['neograph.neo', 'neograph.utils', 'neograph.session']).controller("UtilsController", ['$scope', '$window', 'Neo', 'GraphPresets', 'Metadata', function ($scope, $window, neo, presets, metadata) {

    var getPersonData = function getPersonData(node, callback) {

        metadata.getFreebasePersonData(node.FreebaseID, function (data) {

            //    console.dir(data);

            $.extend(node, data);

            if (node.FB_date_of_birth && !node.YearFrom) {

                node.YearFrom = parseInt(node.FB_date_of_birth.split('-')[0]);
            }
            if (node.FB_date_of_death && !node.YearTo) {

                node.YearTo = parseInt(node.FB_date_of_death.split('-')[0]);
            }

            callback(node);
        });
    };

    var getBlurb = function getBlurb(node, callback) {

        metadata.getFreebaseText(node, function (blurb) {

            $scope.$apply(function () {
                $.extend(node, blurb);
            });

            callback(node);
        });
    };

    var getData = function getData(node, blurbOnly) {

        getBlurb(node, function (updated) {

            if ($.inArray("Person", updated.labels) > -1 && !blurbOnly) {

                getPersonData(updated, function (updatedPerson) {

                    console.log(updatedPerson);
                    neo.saveProps(updatedPerson).then(function (nid) {
                        console.log(nid + " saved");
                    });
                });
            } else {

                console.log(updated);

                neo.saveProps(updated).then(function (nid) {

                    console.log(nid + " saved");
                });
            }
        });
    };

    $scope.fixNames = function () {

        neo.getNodeList(" match (n:Person) where n.Name =~ '(?i).*,.*'").then(function (nodes) {
            console.log(nodes);
            angular.forEach(nodes, function (node) {

                var names = node.Name.split(",");

                if (names.length == 2) {

                    var newName = names[1].trim() + " " + names[0].trim();
                    console.log("old name: " + node.Name + ", new name: " + newName);
                    node.Name = newName;

                    neo.saveProps(node).then(function (nid) {

                        console.log(nid + " saved");
                    });
                } else {
                    console.log("ODD NAME: " + node.Name);
                }
            });
        });
    };

    $scope.importQuery = "match(n:Period) ";

    $scope.reselect = function (node, mid, name) {

        node.FreebaseID = mid;
        node.FB_name = name;
        getData(node);
    };

    $scope.clear = function (node) {

        node.FreebaseID = null;
        node.FB_name = null;
        node["FB_blurb"] = null;
        node["FB_blurb_full"] = null;

        neo.saveProps(node).then(function (nid) {
            console.log(nid + " saved");
        });
    };

    //TODO: REMOVE ALL FB ASSOCIATIONS FOR THE FOLLOWING QUERY
    //match(n:Global)  where n.Status is null
    //THEY ARE UNSAFE
    //DICTIONARY WOULD BE A BETTER SOURCE FOR THOSE

    $scope.importFreebaseData = function () {

        console.log('importing...');
        // -persons - quotes, dates, nationality, fbid
        neo.getNodeList($scope.importQuery).then(function (nodes) {
            $scope.nodes = nodes;

            console.log(nodes);

            angular.forEach(nodes, function (node) {

                //if (node.FreebaseID) {
                //    console.log('already have freebase id for ' + node.Name + ':' + node.FreebaseID)
                //    getData(node);
                //}
                //else {
                metadata.getFreebaseId(node, function (result) {
                    $scope.$apply(function () {

                        node.disambiguation = result.response;

                        var nochange = false;

                        if (node.FreebaseID) {
                            console.log('already have freebase id for ' + node.Name + ':' + node.FreebaseID);
                        } else if (result.mid && !node.FreebaseID) {
                            nochange = result.mid == node.FreebaseID;
                            node.FreebaseID = result.mid;
                            console.log('got freebase id:' + result.mid + ' for ' + node.Name);
                        } else {
                            console.log('couldnt get freebase id for ' + node.Name);
                            console.dir(result.response);
                        }

                        if (node.FreebaseID) {
                            //&& !nochange
                            //set freebasename
                            angular.forEach(node.disambiguation, function (n) {
                                if (n.mid === node.FreebaseID) {
                                    node.FB_name = n.name;
                                }
                            });
                            getData(node, true); //true = blurb only
                        }
                    });
                });

                //  }
            });
        });

        //
        //neo.getNodeList("match(n:Global)", 10);
    };

    $scope.quotesToNodes = function () {

        neo.getNodeList("match (n) where n.FB_quotations is not null").then(function (nodes) {
            angular.forEach(nodes, function (node) {
                //   console.log(node);
                angular.forEach(node.FB_quotations, function (quote) {
                    //console.log(quote);
                    var qnode = { id: 0, properties: { Type: 'Quotation', Text: quote, Creator: node.Lookup }, labels: [node.Lookup] };

                    neo.saveNode(qnode).then(function (n) {

                        console.log(n);

                        var edge = { startNode: n.id, endNode: node.id, type: 'BY' };
                        neo.saveEdge(edge, n, node).then(function (e) {
                            console.log(e);
                        });
                    });
                });
            });
        });
    };
}]);
'use strict';

angular.module('neograph.edge', ['neograph.neo', 'neograph.utils', 'ui.router']).config(["$stateProvider", function ($stateProvider) {
    $stateProvider.state('neograph.admin.edge', {
        url: 'edge/:edge',
        views: {
            'edge@': {
                controller: 'controller.edge',
                templateUrl: 'app/edge/edge.html'
            },

            'edgeHeader@': {
                controller: 'controller.edgeHeader',
                templateUrl: 'app/edge/edgeHeader.html'
            }
        }

    });
}]).controller('controller.edgeHeader', ["$scope", "$stateParams", function ($scope, $stateParams) {

    if ($stateParams.edge) {
        $scope.edge = JSON.parse($stateParams.edge);
    }
}]).controller('controller.edge', ["neo", "utils", "$stateParams", "$scope", function (neo, utils, $stateParams, $scope) {

    if ($stateParams.edge) {
        $scope.edge = JSON.parse($stateParams.edge);
        $scope.predicateType = utils.predicates[$scope.edge.type];
    }

    $scope.$watch("predicateType", function (predicateType) {
        if (predicateType) {
            $scope.edge.type = predicateType.Lookup;
        }
    });

    $scope.deleteEdge = function (e) {

        neo.deleteEdge(e, $scope.activeView.data.nodes[e.startNode], $scope.activeView.data.nodes[e.endNode]).then(function () {

            //let view handle its own data ?
            delete $scope.activeView.data.edges[e.id];
            if ($scope.selection.selectedEdge && $scope.selection.selectedEdge.id === e.id) {
                $scope.selection.selectedEdge = null;
            }

            $scope.publish("deleted", { selection: { edges: [e] } });
        });
    };

    $scope.saveEdge = function (e) {

        neo.saveEdge(e).then(function (g) {

            $scope.publish("dataUpdate", g);

            //update cache
            for (key in g.nodes) {
                $scope.activeView.data.nodes[key] = g.nodes[key];
            }

            for (key in g.edges) {
                $scope.activeView.data.edges[key] = g.edges[key];

                if ($scope.selection.selectedEdge && (key === $scope.selection.selectedEdge.id || !$scope.selection.selectedEdge.id)) {
                    $scope.selection.selectedEdge = g.edges[key];
                }
            }
        });
    };
}]);
'use strict';

angular.module('neograph.graph', ['neograph.utils', 'ui.router']).directive('graph', ['utils', '$state', function (utils, $state) {
    return {
        restrict: 'E',
        templateUrl: 'app/graph/graph.html',
        scope: {
            data: '=',
            active: '=',
            network: '='
        },
        link: function link($scope, $element, $attrs) {

            var graphWidth = 1300;
            var graphHeight = 1300;
            var topBarHeight = 150;

            var options = utils.graphOptions;
            options.onConnect = function (data, callback) {

                var newEdge = {
                    start: $scope.data.nodes[data.from],
                    type: utils.defaultEdgeType($scope.data.nodes[data.from].Type, $scope.data.nodes[data.to].Type),
                    end: $scope.data.nodes[data.to],
                    properties: { Weight: 3 }
                };
                $scope.publish("newEdge", newEdge);
            };

            $scope.data = {
                nodes: {},
                edges: {}
            };

            var graph = {
                nodes: new vis.DataSet(),
                edges: new vis.DataSet()
            };

            var network = new vis.Network($element.find('.graphContainer')[0], graph, options);

            //network.on('startStabilization', function () {//should be network.on('NewData')
            //    $window.setTimeout( function () {  network.zoomExtent();},2000);

            //});

            //set size to window size
            $scope.$watch('window', function (w) {
                network.setSize(graphWidth + "px", graphHeight + "px");
            });

            //fit to screen on resize
            network.on('resize', function (params) {
                if (getSelectedNodeId()) {
                    network.focusOnNode(getSelectedNodeId(), { scale: 1, animation: { duration: 1000, easingFunction: 'easeOutCubic' } });
                } else {
                    network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });

            graph.nodes.on('*', function (event, properties, senderId) {
                //  console.log('event:', event, 'properties:', properties, 'senderId:', senderId);
                if (graph.nodes.length) {
                    $(".network-manipulationUI.connect").css("display", "inline-block");
                } else {
                    $(".network-manipulationUI.connect").hide();
                }
            });

            var suppressSelected = false;

            $scope.subscribe("selected", function (params) {

                if (params.sender != "Graph" && $scope.active && params.selection.nodes && params.selection.nodes.length && params.selection.nodes[0] != getSelectedNodeId() && graph.nodes.get(params.selection.nodes[0])) {
                    suppressSelected = true;

                    var nodeids = params.selection.nodes.map(function (n) {
                        return n.id;
                    });
                    network.selectNodes(nodeids);
                    suppressSelected = false;
                }
            });

            // add event listeners
            network.on('select', function (params) {
                if (!suppressSelected) {

                    if (params.nodes.length === 1) {
                        $state.go('admin.main.node.view', { node: $scope.data.nodes[params.nodes[0]].Label });
                    } else if (params.edges.length === 1) {

                        var id = params.edges[0];
                        var startNode = $scope.data.nodes[$scope.data.edges[id].startNode];
                        var endNode = $scope.data.nodes[$scope.data.edges[id].endNode];
                        var edge = {
                            id: id,
                            start: { Lookup: startNode.Lookup },
                            end: { Lookup: endNode.Lookup },
                            type: $scope.data.edges[id].type,
                            properties: $scope.data.edges[id].properties
                        };

                        $state.go('admin.main.edge.view', { edge: JSON.stringify(edge) });
                    }

                    /*
                                        var nodes = [];
                                        var edges = [];
                    
                                        angular.forEach(params.nodes, function (id) {
                                            nodes.push($scope.data.nodes[id]);
                                        });
                    
                    
                                        angular.forEach(params.edges, function (id) {
                    
                                            edges.push({
                                                id: id,
                                                start: $scope.data.nodes[$scope.data.edges[id].startNode],
                                                end: $scope.data.nodes[$scope.data.edges[id].endNode],
                                                type: $scope.data.edges[id].type,
                                                properties: $scope.data.edges[id].properties
                                            });
                    
                                        });
                                        
                                        */

                    /*
                                        var params = { sender: "Graph", selection: { nodes: nodes, edges: edges } };
                    
                                        console.log(params);
                                        $scope.$apply(function () {
                                            $scope.publish("selected", params);
                                        })
                                        */
                }
            });

            $scope.subscribe("deleted", function (params) {
                console.log(params);
                if (params.selection.nodes && params.selection.nodes.length) {
                    var nodeids = params.selection.nodes.map(function (n) {
                        return n.id;
                    });
                    graph.nodes.remove(nodeids);
                }
                if (params.selection.edges && params.selection.edges.length) {
                    var edgeids = params.selection.edges.map(function (n) {
                        return n.id;
                    });
                    graph.edges.remove(edgeids);
                }
            });

            $scope.subscribe("focus", function (nodeid) {

                network.focusOnNode(nodeid, { scale: 1, animation: { duration: 1000, easingFunction: 'easeOutCubic' } });
            });

            var getSelectedNodeId = function getSelectedNodeId() {

                var selectedNodes = network.getSelectedNodes();
                if (selectedNodes.length == 1) {
                    return selectedNodes[0];
                } else return undefined;
            };

            $(".network-manipulationUI.connect").hide();

            //capture hover node
            $scope.hoverNode = undefined;
            $('.graphContainer').on('mousemove', function (event) {
                var n = network._getNodeAt({ x: event.pageX, y: event.pageY - topBarHeight - 55 });
                $scope.$apply(function () {
                    if (n) {
                        var dataNode = $scope.data.nodes[n.id];
                        $scope.hoverNode = dataNode;
                        $scope.publish("hover", dataNode);
                    } else {
                        $scope.publish("hover", undefined);
                        $scope.hoverNode = undefined;
                    }
                });
            });

            //freeze simulation if not active
            $scope.$watch('active', function (active) {
                if (active != undefined) {
                    network.freezeSimulation(!active);
                }
            });

            $scope.$watch('data', function () {
                console.log('new change');
                if ($scope.active) {
                    console.log('drawing new graph');
                    graph.nodes.clear();
                    graph.edges.clear();
                    var gArr = utils.toGraphData($scope.data);
                    graph.nodes.add(gArr.nodes);
                    graph.edges.add(gArr.edges);
                }
            });

            //updates existing data (not replace)
            $scope.subscribe("dataUpdate", function (g) {
                console.log('graph: dataUpdate');
                if ($scope.active && $scope.data) {
                    console.log('updating graph');
                    $.extend($scope.data.edges, g.edges);
                    $.extend($scope.data.nodes, g.nodes);
                    var gArr = utils.toGraphData(g);
                    graph.edges.update(gArr.edges);
                    graph.nodes.update(gArr.nodes);
                }
            });
        }

    };
}]);
'use strict';

angular.module('neograph.interaction.draggable', []).directive('draggable', function () {
    return {

        link: function link($scope, element, attrs) {

            var initLeft = $(element).position().left;

            $(element).draggable({
                axis: "x",
                drag: function drag() {

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
'use strict';

angular.module('neograph.interaction', ['neograph.interaction.draggable', 'neograph.interaction.resizable', 'neograph.interaction.selectable']);
'use strict';

angular.module('neograph.interaction.resizable', []).directive('resizable', ["$window", function ($window) {
    return {
        scope: {
            window: '='
        },
        controller: ["$scope", "$element", function controller($scope, $element) {

            var w = angular.element($window);
            var getWindowDimensions = function getWindowDimensions() {
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

            //w.bind("debouncedresize", function (event) {
            //    $scope.$apply();

            //});
        }]
    };
}]);
'use strict';

angular.module('neograph.interaction.selectable', []).directive('selectable', function () {
    return {
        scope: {
            selected: '='

        },
        link: function link($scope, element, attrs) {

            $scope.$watch($(element).find("li.ui-selected").length, function (i) {

                $(element).selectable({
                    filter: "li",
                    stop: function stop(event, ui) {

                        var selected = [];

                        $(element).find("li.ui-selected").each(function (i, e) {
                            selected.push(parseInt($(e).attr("nodeindex")));
                        });

                        $scope.$apply(function () {

                            $scope.selected = selected;
                        });
                    },

                    cancel: '.badge, .label'

                });
            });
        }
    };
});
'use strict';

angular.module('neograph.layout', []).directive('tabs', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            tabs: '=', //required to remove panes no longer available
            selected: '=?'
        },
        controller: ["$scope", function controller($scope) {
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
                //console.log('remove')
                //console.log(pane);
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

            $scope.$watch('selected', function (key) {
                //the title of the selected pane

                if (key) {
                    angular.forEach(panes, function (pane) {

                        pane.selected = pane.key === key;
                    });
                }
            });

            //remove tabs not in list (child pane only adds them)
            $scope.$watch('tabs', function (tabs) {
                //the title of the selected pane

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
}).directive('tabPane', function () {
    return {
        require: '^tabs',
        restrict: 'E',
        transclude: true,
        scope: {
            key: '@',
            title: '=',
            visible: '=',
            active: '=?',
            window: '='
        },
        link: function link($scope, element, attrs, tabsCtrl) {

            tabsCtrl.add($scope);

            //$scope.$watch('visible', function (visible) {

            //    if (visible) {
            //        tabsCtrl.addPane($scope);
            //    }
            //    else {
            //        tabsCtrl.removePane($scope);

            //    }

            //});

            $scope.$watch('active', function (active) {
                //the title of the selected pane

                $scope.selected = active;
            });
        },
        templateUrl: 'app/layout/tabPane.html'
    };
}).directive('noBubble', function () {
    return {

        link: function link($scope, element, attrs, tabsCtrl) {

            $(element).on('keydown', function (event) {

                event.stopPropagation();
            });
        },
        templateUrl: 'app/layout/tabPane.html'
    };
});
"use strict";

angular.module("neograph.models.node", ["neograph.models.predicate"]).factory("nodeFactory", ["predicateFactory", function (predicateFactory) {

    function Node(data) {

        this.labels = [];

        Object.assign(this, data);

        //instead i think i should call the service to get the reverse
        for (var relKey in this.relationships) {
            var rel = this.relationships[relKey];
            rel.predicate = predicateFactory.create(rel.predicate);
        }
    }

    Node.prototype.isPicture = function () {

        return this.labels.indexOf("Picture") > -1;
    };

    Node.prototype.isCustomField = function (key) {

        return key != 'lookup' && key != 'class' && key != 'label' && key != 'description' && key != 'text' && key != 'name' && key != 'systemInfo' && key != 'labels' && key != 'id' && key != 'created' && key != 'image' && key != 'relationships' && key != 'labelled';
    };

    return {
        create: function create(data) {
            return new Node(data);
        }
    };
}]);
"use strict";

angular.module("neograph.models.predicate", []).factory("predicateFactory", function () {

    function Predicate(data) {

        Object.assign(this, data);
    }

    Predicate.prototype.setDirection = function (direction) {
        this.direction = direction;
        return this;
    };

    Predicate.prototype.toString = function () {
        if (this.direction === "in" && !this.symmetrical) {
            if (this.reverse) {
                //use reverse if present
                return this.reverse.replace(/_/g, ' ').toLowerCase();
            } else {
                var lookup = this.lookup.toUpperCase();
                if (lookup === "CREATED" || lookup === "CREATES") return "created by";else if (lookup === "INFLUENCES") return "influenced by";else if (lookup === "INSPIRES") return "inspired by";else if (lookup === "ANTICIPATES") return "anticipated by";else if (lookup === "DEVELOPS") return "developed by";else if (lookup === "DEPICTS") return "depicted by";else if (lookup === "TYPE_OF") return "type(s)";else return "(" + this.lookup.replace(/_/g, ' ').toLowerCase() + ")";
            }
        }

        // if (!this.isDirectional || !this.direction || this.direction === "out") {
        return this.lookup.replace(/_/g, ' ').toLowerCase();
    };

    Predicate.prototype.flip = function () {

        if (!this.isDirectional) {
            return;
        }
        if (this.direction === "in") {
            this.setDirection("out");
        } else {
            this.setDirection("in");
        }
        return this;
    };

    return {
        create: function create(data) {
            return new Predicate(data);
        }
    };
});
'use strict';

angular.module('neograph.neo.client', ['ngResource', 'neograph.settings']).factory("neoClient", ['$resource', 'settings', function ($resource, settings) {
    //return $resource('http://localhost:1337/node/match', {txt:'@txt',restrict:'@restrict'}, {
    //    matchNodes: {
    //        method: 'POST',
    //        isArray:true
    //    }
    //});

    //return $resource(null,null, {
    //    matchNodes: {
    //        url: 'http://localhost:1337/node/match',
    // //       params: {txt:'',restrict:''},
    //        method: 'POST',
    //        isArray: true
    //    }
    //});

    var root = settings.apiRoot;

    return {

        node: $resource(null, null, {
            search: {
                url: root + '/search',

                method: 'POST',
                isArray: true
            },

            get: {
                url: root + '/node/get/:id',
                method: 'GET'
            },

            getWithRels: {
                url: root + '/node/getWithRels/:id',
                method: 'GET'
            },

            getRelationships: {
                url: root + '/node/relationships/:id',
                method: 'GET'
            },

            getOne: {
                url: root + '/node/single',
                method: 'POST'
            },

            getList: {
                url: root + '/node/list',
                method: 'POST',
                isArray: true
            },

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

                method: 'POST'
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
            },

            getProps: {
                url: root + '/node/getProps',

                method: 'POST'

            },

            getImages: {
                url: root + '/node/getImages',
                isArray: true,
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

            },

            getImageRelationships: {
                url: root + '/edge/imagerelationships',
                method: 'POST'
            }
        }),

        user: $resource(null, null, {
            saveFavourite: {
                url: root + '/user/saveFavourite',

                method: 'POST'

            },
            get: {
                url: root + '/user/:user',
                method: 'GET'
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
                url: root + '/types',
                method: 'GET'
            }
        }),

        predicate: $resource(null, null, {
            getAll: {
                url: root + '/predicates',
                method: 'GET'
            }
        }),

        utils: $resource(null, null, {
            getDistinctLabels: {
                url: root + '/utils/distinctLabels',
                isArray: true,
                method: 'POST'
            }
        })

    };
}]);
"use strict";

angular.module("neograph.neo", ["neograph.utils", "neograph.neo.client"]).factory("neo", ["neoClient", "utils", function (neoClient, utils) {

    var that = {

        getGraph: function getGraph(q, returnArray) {

            return neoClient.graph.get({ q: q, returnArray: returnArray }).$promise.then(function (data) {

                var out = data.toJSON();
                console.dir(out);
                return out;
            });
        },

        //returns all relationships between supplied nodes, which can be vis.Dataset or graph data object
        getAllRelationships: function getAllRelationships(nodes) {
            var nodeIds = "";

            if (nodes.getIds) //if vis.DataSet
                {
                    nodeIds = nodes.getIds({ returnType: 'Array' }).join(",");
                } else {
                //otherwise data object

                for (var key in nodes) {
                    if (nodeIds.length) {
                        nodeIds += ",";
                    }
                    nodeIds += key;
                }
            }

            var q = "MATCH a -[r]- b WHERE id(a) IN[" + nodeIds + "] and id(b) IN[" + nodeIds + "] and not (a-[:TYPE_OF]-b) return r";

            return that.getGraph(q);
        },

        getRelationships: function getRelationships(id) {

            return neoClient.node.getRelationships({ id: id }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        saveMultiple: function saveMultiple(multiple) {

            return neoClient.node.saveMultiple({ multiple: multiple }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        //saves edge to neo (update/create)
        //TODO: according to certain rules labels will need to be maintained when relationships are created. (update not required as we always delete and recreate when changing start/end nodes)
        //tag a with label b where:
        // a=person and b=provenance (eg painter from france)
        // a=person and n=group, period (eg painter part of les fauves / roccocco)
        // a=picture and b=non-person (eg picture by corot / of tree) - although typically this will be managed through labels directly (which will then in turn has to keep relationships up to date)
        saveEdge: function saveEdge(e) {
            //startNode and endNode provide the full node objects for the edge

            return neoClient.edge.save({ edge: e }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        saveFavourite: function saveFavourite(node, user) {

            return neoClient.user.saveFavourite({ user: user, node: node }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        deleteEdge: function deleteEdge(edge) {

            if (edge && edge.id) {

                return neoClient.edge.delete({ edge: edge }).$promise.then(function (data) {
                    return data.toJSON();
                });
            }
        },

        getUser: function getUser(userLookup) {

            return neoClient.user.get({ user: userLookup }).$promise.then(function (data) {

                return data.toJSON();
            });
        },

        getOne: function getOne(q) {
            //q must be a match return a single entity n

            return neoClient.node.getOne({ q: q }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        getImageRelationships: function getImageRelationships(edge) {
            //loks up id/label first then call get by label

            return neoClient.edge.getImageRelationships({ edge: edge }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        //Alternatively i could query the actual labels and merge them into a distinct array
        getDistinctLabels: function getDistinctLabels(labels) {

            return neoClient.utils.getDistinctLabels({ labels: labels }).$promise; //returns array
        },

        getDistinctLabelsQuery: function getDistinctLabelsQuery(q) {

            return neoClient.utils.getDistinctLabels({ q: q }).$promise; //returns array
        }

    };

    return that;
}]);
'use strict';

angular.module('neograph.session', ['neograph.neo']).factory('session', ['neo', '$q', function (neo, $q) {

    var anonUser = {
        Lookup: 'Anonymous',
        roles: { "Public": {} }
    };

    var session = {

        init: function init() {

            neo.getUser("Julian").then(function (user) {

                session.user = user;
                session.signedIn = true;
            });

            return session;
        },

        signingIn: false,

        signedIn: false,

        user: anonUser,

        signIn: function signIn(username, password) {

            return neo.authenticate(username, password).then(function (user) {

                session.user = user;

                console.log(session.user);
                //   session.apps = service.getApps(session.user.roles);

                localStorage.username = session.user.username;

                session.signedIn = true;

                if (user.roles.PreReg) {
                    $('body').addClass('prereg');
                } else {
                    $('body').removeClass('prereg');
                }
            }, function (failMessage) {
                console.log(failMessage);
                return $q.reject(failMessage);
            });
        },

        signOut: function signOut() {

            session.user = anonUser;
            localStorage.username = ""; // = JSON.stringify(session.user);
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
"use strict";

angular.module("neograph.utils", ["neograph.neo.client", "neograph.query.presets"]).factory("utils", ["neoClient", "queryPresets", function (neoClient, presets) {

    Array.prototype.diff = function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) < 0;
        });
    };

    Array.prototype.ids = function () {
        return this.map(function (e) {
            return e.id;
        });
    };

    Array.prototype.hasAny = function (a) {
        return this.filter(function (i) {
            return a.indexOf(i) > -1;
        }).length > 0;
    };

    Array.prototype.unique = function () {
        var a = [];
        for (i = 0; i < this.length; i++) {
            var current = this[i];
            if (a.indexOf(current) < 0) a.push(current);
        }
        return a;
    };

    var Predicate = function Predicate(lookup, direction) {
        this.Lookup = lookup;

        this.IsDirectional = this.Lookup != "ASSOCIATED_WITH";

        this.Direction = direction;

        this.Type = 'Predicate';

        this.Key = function () {

            if (!this.IsDirectional || !this.Direction) {
                return this.Lookup;
            } else if (this.Direction == "out") {
                return this.Lookup + " ->";
            } else {
                return this.Lookup + " <-";
            }
        };

        this.ToString = function () {

            if (!this.IsDirectional || !this.Direction || this.Direction == "out") {
                return this.Lookup.replace(/_/g, ' ').toLowerCase();
            } else {

                if (this.Lookup == "CREATED") return "created by";else if (this.Lookup == "INFLUENCES") return "influenced by";else if (this.Lookup == "INSPIRES") return "inspired by";else if (this.Lookup == "ANTICIPATES") return "anticipated by";else if (this.Lookup == "DEVELOPS") return "developed by";else if (this.Lookup == "DEPICTS") return "depicted by";else if (this.Lookup == "TYPE_OF") return "type(s)";else return "(" + this.Lookup.replace(/_/g, ' ').toLowerCase() + ")";
            }
        };

        this.Reverse = function () {

            if (!this.IsDirectional) {
                return;
            }

            if (this.Direction === "in") {
                this.Direction = "out";
            } else {
                this.Direction = "in";
            }
        };
    };

    var View = function View(key, type) {

        this.key = key;
        this.name = key;
        this.type = type;

        this.data = {
            nodes: {},
            edges: {}
        };

        if (type == "Graph") {
            this.queryPresets = presets;
            this.queryGenerators = {};
            this.queryGenerators.nodeGraph = {
                type: "nodeGraph",
                options: {}
            };
        }

        if (type == "Grid") {
            this.queryPresets = presets;
            this.queryGenerators = {};

            this.queryGenerators.nodeFilter = {
                type: "nodeFilter",
                options: {}
            };

            this.queryGenerators.favouritesFilter = {
                type: "favouritesFilter",
                options: {}
            };
        }
    };

    var graphNodeFromNeoNode = function graphNodeFromNeoNode(neoNode) {

        var type = neoNode.Type;
        var yf = parseInt(neoNode.YearFrom);
        var yt = parseInt(neoNode.YearTo);

        var y = yt;

        if (yf && yt) {
            y = yt - (yt - yf) / 2;
        }

        var level = 0;

        var startYear = 1400;
        var endYear = 2000;
        var step = 5;
        var cnt = 1;
        for (var i = startYear; i < endYear; i += step) {
            if (y >= i && y < i + step) {
                level = cnt;
            }

            cnt += 1;
        }

        if (y > endYear) {
            level = cnt;
        }

        var person = utils.isPerson(type);

        var node = {
            id: neoNode.id,
            label: neoNode.Lookup,
            size: neoNode.Status / 10,
            group: neoNode.Type,
            // color: ==='Group' ? 'orange': 'pink',
            mass: type == 'Group' ? 0.5 : 1,
            radius: person ? neoNode.Status : 1,
            //    title: neoNode.FB_blurb,//neoNode.Lookup + " - " + type + " - " + neoNode.Status,
            level: level //for hiearchichal layout
        };

        var image = type === 'Painting' || type === 'Picture' ? neoNode.temp.thumbUrl : null;

        if (image) {
            node.image = image;
            node.shape = 'image';
        } else if (type == "Provenance") {
            node.fontSize = 50;
            node.fontColor = 'lightgray';
            node.color = 'transparent';
        } else if (type == "Iconography" || type == "Place") {
            node.shape = 'ellipse';
        } else if (type == "Quotation") {

            node.shape = 'box';
            node.color = 'transparent';
            node.label = neoNode.Text;
        } else if (type == "User") {
            node.shape = 'star';
            node.size = 20;
        } else if (type == "Link") {
            node.label = neoNode.Name;
            node.shape = 'box';
            node.color = 'transparent';
        } else {
            node.shape = person ? 'dot' : 'box';
        }

        return node;
    };

    var graphEdgeFromNeoEdge = function graphEdgeFromNeoEdge(neoEdge) {
        //id, from, to, type, properties

        var type = neoEdge.type;

        var directional = type == "INFLUENCES" || type == "INSPIRES" || type == "ANTICIPATES" || type == "DISCOVERS" || type == "TEACHES" || type == "ADMIRES" || type == "ENCOURAGES" || type == "PRECURSOR_OF" || type == "INVENTS";

        var hideEdgeLabel = type == "BY" || "INFLUENCES" || type == "INSPIRES" || type == "DEALS_WITH" || type == "PART_OF" || type == "MEMBER_OF" || type == "ASSOCIATED_WITH" || type == "ACTIVE_DURING" || type == "FROM" || type == "DEVELOPS" || type == "LEADS" || type == "FOUNDS" || type == "DEPICTS" || type == "WORKS_IN" || type == "STUDIES" || type == "STUDIES_AT" || type == "TEACHES" || type == "TEACHES_AT"; //displayed in light green

        var hideEdge = type == "FROM";

        var edge = {
            id: neoEdge.id,
            from: neoEdge.startNode,
            to: neoEdge.endNode,
            label: hideEdgeLabel ? null : type.toLowerCase(),
            fontColor: 'lightblue',
            //  width: neoEdge.Weight/2 ,
            color: type == "FROM" ? "#EEEEEE" : type == "INFLUENCES" ? 'pink' : type == "TEACHES" || type == "TEACHES_AT" ? 'lightgreen' : 'lightblue',
            opacity: hideEdge ? 0 : 1, //type == "INFLUENCES" ? 1 : 0.7,
            style: directional ? 'arrow-center' : 'dash-line',
            type: ['curved'],
            labelAlignment: 'line-center'

        };

        return edge;
    };

    var utils = {

        init: function init() {

            utils.refreshTypes();
            utils.refreshPredicates();
            return utils;
        },

        newView: function newView(key, type) {
            var view = new View(key, type);
            return view;
        },

        types: {},

        Predicate: Predicate,

        predicates: {},

        isType: function isType(label) {
            return utils.types[label] != undefined;
        },

        refreshTypes: function refreshTypes() {

            return neoClient.type.getAll().$promise.then(function (types) {
                utils.types = types;
                return types;
            });
        },

        refreshPredicates: function refreshPredicates() {
            //consider creating lookup nodes for relationship types so that i can store properties for them

            return neoClient.predicate.getAll().$promise.then(function (predicates) {
                utils.predicates = predicates.toJSON();
                // console.log(utils.predicates);
                return utils.predicates;
            });
        },

        defaultEdgeType: function defaultEdgeType(fromType, toType) {
            if (toType == "Provenance") {
                return "FROM";
            } else if (toType == "Painter") {
                return "INFLUENCES";
            }

            return "ASSOCIATED_WITH";
        },

        isSystemInfo: function isSystemInfo(label) {

            return label == "Global" || label == "Type" || label == "Label" || label == "SystemInfo";
        },
        getLabelClass: function getLabelClass(node, label) {

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
        },

        personTypes: ['Painter', 'Illustrator', 'Philosopher', 'Poet', 'FilmMaker', 'Sculptor', 'Writer', 'Patron', 'Leader', 'Explorer', 'Composer', 'Scientist', 'Caricaturist', 'Mathematician'],

        pictureTypes: ['Painting', 'Illustration', 'Drawing', 'Print'],

        isPerson: function isPerson(type) {

            return type == 'Painter' || type == 'Illustrator' || type == 'Philosopher' || type == 'Poet' || type == 'FilmMaker' || type == 'Sculptor' || type == 'Writer' || type == 'Patron' || type == 'Leader' || type == 'Explorer' || type == 'Composer' || type == 'Scientist' || type == 'Caricaturist' || type == 'Mathematician';
        },

        graphOptions: {
            //  configurePhysics:true,
            edges: { widthSelectionMultiplier: 4 },

            hierarchicalLayout: {
                enabled: false,
                levelSeparation: 10, //make this inversely proportional to number of nodes
                nodeSpacing: 200,
                direction: "UD" },

            //LR
            //    layout: "hubsize"
            dataManipulation: {
                enabled: true,
                initiallyVisible: true
            },

            //stabilize: true,
            //stabilizationIterations: 1000,
            physics: {
                barnesHut: {
                    enabled: true,
                    gravitationalConstant: -6000,
                    centralGravity: 1,
                    springLength: 20,
                    springConstant: 0.04,
                    damping: 0.09
                },
                repulsion: {
                    centralGravity: 0.1,
                    springLength: 0.5,
                    springConstant: 0.05,
                    nodeDistance: 100,
                    damping: 0.09
                },

                hierarchicalRepulsion: {
                    enabled: false,
                    centralGravity: 0,
                    springLength: 270,
                    springConstant: 0.01,
                    nodeDistance: 300,
                    damping: 0.09
                }
            },

            onDelete: function onDelete(data, callback) {
                //   $scope.publish("deleting");
            }
        },

        //transforms neo graph data object into object containing array of nodes and array of edges renderable by vis network
        toGraphData: function toGraphData(g) {
            var graphData = {
                nodes: [],
                edges: []
            };
            for (var n in g.nodes) {
                var node = graphNodeFromNeoNode(g.nodes[n]);
                graphData.nodes.push(node);
            }

            for (var r in g.edges) {
                var edge = graphEdgeFromNeoEdge(g.edges[r]);
                graphData.edges.push(edge);
            }
            return graphData;
        }
        //mopve to 'state' object

        , tabSettings: {},

        selectedTab: "Properties"

    };
    return utils.init();
}]);
'use strict';

angular.module('neograph.node', ['neograph.node.graphpanel', 'neograph.node.favourites', 'neograph.node.freebase', 'neograph.node.graphpanel', 'neograph.node.images', 'neograph.node.wikipedia', 'neograph.node.multiple', 'neograph.node.service', 'neograph.node.properties', 'neograph.node.relationships', 'ui.router']).config(["$stateProvider", function ($stateProvider) {
    $stateProvider.state('admin.main.node', {
        url: '/node/:node',
        //abstract:true,
        views: {
            'nodeHeader@admin': {
                controller: 'NodeHeaderCtrl',
                templateUrl: 'app/node/node.header.html'
            },

            'node@admin': {
                controller: 'NodeCtrl',
                templateUrl: 'app/node/node.html'
            }

        }

    }).state('admin.main.node.view', {
        url: '/view',
        views: {
            'properties@admin.main.node': {
                templateUrl: 'app/node/properties/node.properties.html',
                controller: ["$scope", "$stateParams", "nodeService", function controller($scope, $stateParams, nodeService) {
                    if ($stateParams.node) {
                        nodeService.get($stateParams.node, true).then(function (node) {
                            $scope.node = node;
                        });
                    }
                }]
            },

            'relationships@admin.main.node': {
                templateUrl: 'app/node/relationships/node.relationships.html',
                controller: ["$scope", "$stateParams", "nodeService", function controller($scope, $stateParams, nodeService) {
                    if ($stateParams.node) {
                        nodeService.get($stateParams.node, true).then(function (node) {
                            $scope.node = node;
                            console.log(node);
                        });
                    }
                }]
            }
        }

    }).state('admin.main.node.edit', {
        url: '/edit',
        views: {

            'editproperties@admin.main.node': {
                templateUrl: 'app/node/properties/node.properties.edit.html',
                controller: 'EditPropertiesCtrl'
            },
            'editrelationships@admin.main.node': {
                templateUrl: 'app/node/relationships/node.relationships.edit.html',
                controller: 'EditRelationshipsCtrl'
            }

        }

    });
}]).controller('NodeSearchCtrl', ["$scope", "$state", "nodeService", function ($scope, $state, nodeService) {

    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    };

    $scope.$watch('nodeLookup', function (n) {

        if (n && n.id) {
            nodeService.get(n.label, true).then(function (node) {
                $scope.selection.selectedNode = node;
                $state.go('admin.main.node.view', { node: n.label });
            });
        }
    });

    $scope.newNode = function () {

        var newNode = {
            id: -1,
            labels: [],
            Type: "",
            temp: {
                tabs: ["Properties"]
            }
        };

        if ($scope.nodeLookupText && (!$scope.selection.selectedNode || $scope.nodeLookupText != $scope.selection.selectedNode.Lookup)) {
            newNode.Lookup = $scope.nodeLookupText;
        }

        $scope.selection.selectedNode = newNode;
        $scope.tabs = $scope.selection.selectedNode.temp.tabs;

        $scope.selectedTab = 'Properties';
    };

    $scope.addNodeToGraph = function (node) {
        console.log('add node to graph');
        //check node is not already in graph
        if (!$scope.views.Graph.data.nodes[node.id]) {
            console.log('get relationships');
            //pull in relationships
            neo.getRelationships(node.id).then(function (g) {
                console.log('got relationships');
                console.dir(g);

                var newData = {
                    edges: g.edges,
                    nodes: {}
                };
                newData.nodes[node.id] = node;

                $scope.publish("dataUpdate", newData);

                if (node.id === $scope.selection.selectedNode.id) {
                    $scope.publish("selected", { selection: { nodes: [node.id] } });
                    $scope.publish("focus", node.id);
                }
            });

            $scope.activeView = graphView;
        }
    };
}]).controller('NodeHeaderCtrl', ["$scope", "$stateParams", "nodeService", function ($scope, $stateParams, nodeService) {

    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    };

    if ($stateParams.node) {

        nodeService.get($stateParams.node, true).then(function (node) {
            $scope.selection.selectedNode = node;
        });
    }
}]).controller('NodeCtrl', ["$scope", "$stateParams", "nodeService", function ($scope, $stateParams, nodeService) {

    $scope.selection = {
        selectedNode: null,
        selectedEdge: null,
        hoverNode: null
    };

    if ($stateParams.node) {

        nodeService.get($stateParams.node, true).then(function (node) {
            $scope.selection.selectedNode = node;
        });
    }

    /*
        //respond to published event from other component
         $scope.subscribe("selected", function (params) {//params is object containing array of nodes and array of edges
    
    
            //avoid feedback loop by checking that sender is not self
            if (params.sender != "Controller") {
    
                if (params.selection.nodes.length == 1) {
    
                    if (params.selection.nodes[0].id) {
    
                     
                        neo.getNode(params.selection.nodes[0].id, true)
                       .then(function (loadedNode) {
                     
                           $scope.selection.selectedNode = loadedNode;
                           $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                        
    
                       
                       });
                    }
                    else if (params.selection.nodes[0].Label) {
    
                        neo.getNodeByLabel(params.selection.nodes[0].Label, true)
                       .then(function (loadedNode) {
                          
                           $scope.selection.selectedNode = loadedNode;
                           $scope.tabs = $scope.selection.selectedNode.temp.tabs;
                           
                       });
                    }
    
                }
                else if (params.selection.nodes.length > 1)//multiple node selection
                {
                    $scope.selection.multiple = params.selection.nodes;
                    $scope.selection.selectedNode = undefined;
                    $scope.selection.selectedEdge = undefined;
                    $scope.tabs = ["Properties"];
                    $scope.selectedTab = $scope.tabs[0];
    
                }
                else if (params.selection.edges.length == 1) {
                    $scope.selection.selectedNode = undefined;
                    $scope.selection.selectedEdge = params.selection.edges[0];
                    $scope.tabs = ["Properties", "Images"];
                    $scope.selectedTab = $scope.tabs[0];
    
                }
            }
        });
        */

    $scope.tabs = ["Properties", "Relationships"];
    $scope.selectedTab = "Properties";
    $scope.selectTab = function (tab) {
        $scope.selectedTab = tab;
    };
}]);
'use strict';

angular.module('neograph.node.service', ['neograph.utils', 'neograph.neo.client', 'neograph.models.node']).factory('nodeService', ['neoClient', 'utils', '$q', 'nodeFactory', function (neoClient, utils, $q, nodeFactory) {

    var lastLoadedNode = {};

    var that = {
        setPropsAndTabsFromLabels: function setPropsAndTabsFromLabels(node) {
            return neoClient.node.setPropsAndTabs({ node: node }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        get: function get(label, addrelprops) {

            if (addrelprops) {

                if (lastLoadedNode && (label === lastLoadedNode.Label || label === lastLoadedNode.id)) {
                    return $q.when(lastLoadedNode);
                } else {

                    return neoClient.node.getWithRels({ id: label }).$promise.then(function (node) {

                        lastLoadedNode = nodeFactory.create(node.toJSON());
                        console.log(lastLoadedNode);
                        return lastLoadedNode;
                    });
                }
            } else {
                return neoClient.node.get({ id: label }).$promise.then(function (node) {
                    return node.toJSON();
                });
            }
        },

        getList: function getList(q, limit) {
            //q = match (n) & where only (without return)

            return neoClient.node.getList({ q: q, limit: limit }).$promise; //returns array
        },

        saveWikipagename: function saveWikipagename(n) //short version for freebase prop saving
        {
            return neoClient.node.saveWikipagename({
                id: n.id,
                name: n.Wikipagename
            }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        getImages: function getImages(node) {

            return neoClient.node.getImages({
                id: node.id,
                isPicture: node.temp.isPicture,
                isGroup: node.temp.isGroup
            }).$promise; //returns array
        },

        saveProps: function saveProps(n) //short version for freebase prop saving
        {
            return neoClient.node.saveProps({ node: n, user: user }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        getProps: function getProps(labels) {

            return neoClient.node.getProps({ labels: labels }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        save: function save(n, user) {
            if (n.temp.trimmed) {
                throw 'Node is trimmed - cannot save';
            }
            return neoClient.node.save({ node: n, user: user }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        saveRels: function saveRels(n) {
            return neoClient.node.saveRels({ node: n }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        //deletes node and relationships forever
        destroy: function destroy(node) {

            return neoClient.node.destroy({ node: node }).$promise.then(function (data) {
                return data.toJSON();
            });
        },

        //only supports 1 node at the mo
        delete: function _delete(node) {

            var deferred = $q.deferred();

            if (node && node.id) {

                return neoClient.node.delete({ node: node }).$promise.then(function (data) {
                    deferred.resolve(data.toJSON());
                });
            } else {
                deferred.resolve({});
            }
        },

        //only supports 1 node at the mo
        restore: function restore(node) {

            var deferred = $q.deferred();

            if (node && node.id) {
                neoClient.node.restore({ node: node }).$promise.then(function (data) {
                    deferred.resolve(data.toJSON());
                });
            } else {
                deferred.resolve({});
            }

            return deferred.promise;
        },

        search: function search(txt, restrict) {
            //restrict = labels to restrict matches to

            console.log(txt);
            if (txt) {
                return neoClient.node.search({ txt: txt, restrict: restrict }).$promise; //returns array
            }
        }

    };

    return that;
}]);
'use strict';

angular.module('neograph.query', ['neograph.utils', 'neograph.queryDirective']).factory('viewService', ["utils", function (utils) {

    var views = {};

    var newView = function newView(key, type) {
        var view = utils.newView(key, type);
        view.key = key;
        views[key] = view;
        return view;
    };

    var graphView = newView('Graph', 'Graph');
    var defaultImageView = newView('Grid', 'Grid');

    var activeView = defaultImageView;

    var cloneView = function cloneView() {
        views[$scope.views[activeView].queryGenerators.nodeFilter.options.node.Lookup] = angular.copy(views[activeView]);
    };

    var listeners = [];

    function publishViewChange() {

        for (var i = 0; i < listeners.length; i++) {
            listeners[i](activeView);
        }
    }

    return {
        views: views,
        activeView: activeView,
        updateView: function updateView(key) {
            activeView = views[key];
            publishViewChange();
        },

        subscribe: function subscribe(callback) {
            listeners.push(callback);
        }
    };
}]).controller('QueryCtrl', ["$scope", "viewService", "$stateParams", function ($scope, viewService, $stateParams) {

    console.log($stateParams);

    //todo - should be per view
    if ($stateParams.querypreset) {
        $scope.defaultpreset = $stateParams.querypreset;
    }

    viewService.subscribe(function (activeView) {
        $scope.activeView = activeView;
    });

    $scope.views = viewService.views;
    $scope.activeView = viewService.activeView;
}]).controller('QueryResultsCtrl', ["$scope", "viewService", function ($scope, viewService) {

    viewService.subscribe(function (activeView) {
        $scope.activeView = activeView;
    });

    $scope.views = viewService.views;
    $scope.activeView = viewService.activeView;

    $scope.selectedTab = $scope.activeView.key;

    $scope.$watch('selectedTab', function (key) {
        viewService.updateView(key);
    });

    /*
            $scope.$watch('activeView', function (view) {
                $scope.activeViewKey = view.key;
           //     shouldEnabledAddToGraph();
            });
    
            $scope.$watch('activeViewKey', function (key) {
                $scope.activeView = $scope.views[key];
            });
            
            */
    /*
    $scope.subscribe("query", function (query) {
          if (query && (query.q || query.queryGenerator)) {
              if (!query.view) {
                query.view = query.type;
            }
              var view = $scope.views[query.view];
              if (view) {
                //reset name incase it changed due to node filter
                view.name = query.view;
            }
            else {
                  view = newView(query.view, query.type);//view = view key, type = "Graph" or "Grid"
            }
              if (query.queryGenerator) {
                var qg = view.queryGenerators[query.queryGenerator.id];
                qg.options = query.queryGenerator.options;
                view.queryGenerator = qg;
              }
            else {
                view.query = query;
            }
              $scope.activeView = view;
          }
      });
    */
}]);
"use strict";

angular.module('neograph.query.presets', []).factory("queryPresets", function () {

    return {
        "AddedRecently": {

            q: "match (n:Global) where n.created is not null return n order by n.created desc limit 100"

        }, "AddedRecentlyPictures": {
            //MATCH (p:Label) - [:ASSOCIATED_WITH|:PART_OF|:FOUNDS|:LEADS|:MEMBER_OF|:REPRESENTS] - (g:Group), (p) -- (i:Picture) where ID(g) = " + n.id + " return p.Name,collect(i)[0..5],count(*) as count order by p.Name
            q: "MATCH  (p:Label) -- (i:Picture) where p.created is not null return p.created,collect(i)[0..5],count(*) as count  order by p.created desc limit 500"

        },
        "Overview": {
            q: "match (n) - [r] - (m) where (n:Global and m:Global) and (n.Status is null or n.Status > 6) and (m.Status is null or m.Status > 6) and not (n-[:TYPE_OF]-m) RETURN r"
        },

        "OverViewDense": {
            q: "match (n) - [r] - (m) where (n:Global and m:Global) and (n.Status is null or n.Status > 3) and (m.Status is null or m.Status > 3) and not (n-[:TYPE_OF]-m) RETURN r"
        },

        "British Influence": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) and not (c-[:TYPE_OF]-d) and not d.Lookup='English' and not c.Lookup='English'  return c,d,r"
        },
        "British Only": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:English or c:Scottish) and  (d:English or d:Scottish) and not (c-[:TYPE_OF]-d) and not d.Lookup='English' and not c.Lookup='English'  return c,d,r",

            connectAll: true
        },

        "French Only": {
            q: "MATCH (c:Global:French)-[r]-(d:Global:French) where  not (c-[:TYPE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r",

            connectAll: true
        },

        "French Painter influence": {
            q: "MATCH (c:Global:French:Painter)-[r]-(d:Painter) where not (c-[:TYPE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r",

            connectAll: true
        },

        "Cezanne 3 gen": {
            q: "MATCH (c {Lookup:'Cezanne'})-[r]-(d:Painter)  -[s]-(e:Painter)  -[t]-(f:Painter) return c,d,e,f,r,s,t",

            connectAll: true
        },

        "Cezanne 3 gen outbound": {
            q: "MATCH (c {Lookup:'Cezanne'})-[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) return c,d,e,f,r,s,t",

            connectAll: true
        },

        "Cezanne 3 gen inbound": {
            q: "MATCH (c {Lookup:'Cezanne'})<-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) return c,d,e,f,r,s,t",

            connectAll: true
        },

        "French-English Painters": {
            q: "MATCH (c:Global:French:Painter)-[r]-(d:Global:English:Painter) where  not (c-[:TYPE_OF]-d) and not d.Lookup='French' and not c.Lookup='French'  return c,d,r",

            connectAll: true
        },

        "German": {
            q: "MATCH (c:Global:German)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='German' and not c.Lookup='German'  return c,d,r"
        },

        "NorthernEurope": {
            q: "MATCH (c:Global)-[r]-(d:Global) where (c:NorthernEurope or c:German or c:Dutch or c:English or c:Scottish) and  (d:NorthernEurope or d:German or d:Dutch or d:English or d:Scottish) and not c:Provenance and not d:Provenance and not (c-[:TYPE_OF]-d)   return c,d,r"
        },

        "Italian": {
            q: "MATCH (c:Global:Italian)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='Italian' and not c.Lookup='Italian'  return c,d,r"
        },

        "Spanish": {
            q: "MATCH (c:Global:Spanish)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='Spanish' and not c.Lookup='Spanish'  return c,d,r"
        },

        "American": {
            q: "MATCH (c:Global:American)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='American' and not c.Lookup='American'  return c,d,r"
        },

        "Pop": {
            q: "match (n {Lookup:'Pop'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p"
        },

        "Impressionism": {
            q: "match (n {Lookup:'Impressionist'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p",

            connectAll: true
        },

        "Landscape": {
            q: "MATCH (c:Global:Landscape)-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  and not d.Lookup='Landscape' and (d:Landscape or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r"
        },

        "Modern": {
            q: "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and c.YearTo > 1870  and d.YearTo > 1870 return c,d,r"
        },

        "Rennaissance": {
            q: "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and c.YearTo > 1400 and c.YearTo<1700 and d.YearTo > 1400 and d.YearTo<1700 return c,d,r"
        }

        // $scope.query =;

        // $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global) and (n:Greatest or n:Group or n:Theme or n:School or n:Iconography or n:Provenance) and (m:Greatest or m:Group  or m:Theme or m:School or m:Iconography or m:Provenance) RETURN r";//"match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF] - (m) where (n:Greatest or n:Group) and (m:Greatest or m:Group) RETURN r";

        //BRITSH
        // $scope.query = ;

        //IMPRESSIONISM
        // MATCH (c:Global:Impressionist)-[r]-(d:Global:Impressionist) where  not (c-[:TYPE_OF]-d)   return c,d,r
        //need to use connect all:
        //  match (n {Lookup:'Impressionism'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) return n,r,m,s,p
        //match (n {Lookup:'Impressionism'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p
        //only follow links to next gen for above given weight ?

        //LANDSCAPE
        //"MATCH (c:Global:Landscape)-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  and not d.Lookup='Landscape' and (d:Landscape or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r"

        //DATE FILTER
        //   $scope.query =

        //  var initQueryText = "match (n:Greatest) - [r:INFLUENCES] - (m:Greatest) RETURN r";//"match (n:Painter) return n.Name"

        //   $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global and n.YearTo is not null and m.YearTo is not null) and (n:Great or n:Group or n:School  or n:Period) and (m:Great or m:Group  or m:School or m:Period) RETURN r";

        // $scope.query = "match (n) - [r:INFLUENCES|:PART_OF|:MEMBER_OF|:ASSOCIATED_WITH|:INSPIRES|:ADMIRES|:FROM|:DEVELOPS|:ANTICIPATES|:FOUNDS|:LEADS|:WORKS_IN] - (m) where (n:Global and m:Global and n.YearTo is not null and m.YearTo is not null) and (n:Greatest or n:Group or n:Theme or n:School or n:Iconography or n:Provenance) and (m:Greatest or m:Group  or m:Theme or m:School or m:Iconography or m:Provenance) RETURN r";

    };
});
'use strict';

angular.module('neograph.queryDirective', ['neograph.neo', 'neograph.query.presets', 'neograph.query.generator']).directive('query', ['neo', 'queryPresets', function (neo, presets) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/query/queryDirective.html',
        scope: {
            view: '=',
            editable: '=?',
            defaultpreset: '=?'

        },
        link: function link($scope, $element, $attrs) {

            $scope.$watch('preset', function (preset) {
                console.log('p');
                if (preset) {
                    console.log('preset change');
                    $scope.view.query = preset;
                }
            });

            if ($scope.defaultpreset) {
                $scope.preset = presets[$scope.defaultpreset];
            }

            $scope.$watch('view.query', function (query) {
                if (query && query.q) {
                    console.log('query Change');
                    $scope.getData();
                }
            });

            $scope.generatedQuery = {};
            $scope.$watch('generatedQuery.q', function (q) {

                if (q) {
                    $scope.view.query = { q: q };
                }
            });

            $scope.nodeChanged = function (node) {
                if (node) {

                    $scope.view.name = node.Label || node.Lookup;
                }
            };

            $scope.connectAll = function () {
                neo.getAllRelationships($scope.view.data.nodes).then(function (g) {
                    $.extend($scope.view.data.edges, g.edges); //add to cached data
                    $scope.publish("dataUpdate", g);
                });
            };

            $scope.getData = function () {

                var query = $scope.view.query;

                if (query && query.q) {
                    console.log('get data');

                    //if grid query then return results as array to preserve sort order
                    var returnArray = $scope.view.type === 'Grid' ? true : false;

                    neo.getGraph(query.q, returnArray).then(function (g) {

                        if (query.connectAll) {

                            neo.getAllRelationships(g.nodes).then(function (g2) {

                                $.extend(g.edges, g2.edges);
                                $scope.view.data = g;
                            });
                        } else {
                            $scope.view.data = g;
                            console.log(g);
                        }
                    });
                }
            };
        }
    };
}]);
'use strict';

angular.module('neograph.node.favourites', []).directive('favourites', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/node/favourites/node.favourites.html',
        scope: {
            node: '=',
            query: '='
        },

        link: function link($scope) {

            $scope.$watch('node', function (node) {

                var querys = [];

                if (node) {

                    querys.push({
                        name: "Pictures",
                        view: node.Lookup + " favourites",
                        type: "Grid",
                        queryGenerator: { id: "favouritesFilter", options: { user: node } }
                    });

                    querys.push({
                        name: "People",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n:Person)    return n", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });

                    querys.push({
                        name: "People + 1",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n:Person) -[]-(m:Person)   return n,m", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });

                    querys.push({
                        name: "People and groups",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n) where (n:Person or n:Period or n:Group or n:Provenance)   return n", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });

                    querys.push({
                        name: "People and groups + 1 ",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n) - [] - (m) where (n:Person or n:Period or n:Group or n:Provenance) and  (m:Person or m:Period or m:Group or m:Provenance)  return n,m", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });

                    querys.push({
                        name: "Everything",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n:Global)  return n", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });

                    querys.push({
                        name: "Everything + 1",
                        q: "MATCH (c:" + node.Lookup + ":Favourite)-[]->(d) - [] - (n:Global) - [] - (m:Global)   return n,m", // or MATCH (a:User {Lookup:'Julian'}) - [r:FAVOURITE] -> (f) - [] -> (d)  return d
                        connectAll: true,
                        view: "Graph"
                    });
                }

                console.log(querys);

                $scope.querys = querys;
            });
        }

    };
});
'use strict';

angular.module('neograph.node.freebase', ['neograph.neo']).factory('freebase.service', function () {

    var creationQueries = [];

    //creationQueries.push({
    //    name: "Description",
    //    propname: "description",
    //    query: {
    //        "type": "/common/topic",
    //        "description": [{ "mid": null, "name": null }]
    //    }
    //});
    //creationQueries.push({
    //    name: "Image",
    //    propname: "image",
    //    query: {
    //        "type": "/common/topic",
    //        "image": [{ "mid": null, "name": null }]
    //    }
    //});
    creationQueries.push({
        name: "About",
        propname: ["type", "art_genre", "", "art_subject", "period_or_movement", "locations", "date_begun", "date_completed"],
        query: {
            "type": "/visual_art/artwork",
            "art_genre": [{ "mid": null, "name": null }],
            "art_subject": [{ "mid": null, "name": null }],
            "period_or_movement": [{ "mid": null, "name": null }],
            "locations": [{ "mid": null, "name": null }],
            "date_begun": null,
            "date_completed": null
        }
    });

    //creationQueries.push({
    //    name: "About",
    //    propname: ["type","art_genre","","art_subject","period_or_movement","locations","date_begun","date_completed"],
    //    query: {
    //        "type": "/visual_art/artwork",
    //        "art_genre": [{ "mid": null, "name": null }],
    //        "art_subject": [{ "mid": null, "name": null }],
    //        "period_or_movement": [{ "mid": null, "name": null }],
    //        "locations": [{ "mid": null, "name": null }],
    //        "date_begun": null,
    //        "date_completed":null
    //    }
    //});

    ///visual_art/artwork/art_genre
    ///visual_art/artwork/art_subject
    ///visual_art/artwork/period_or_movement
    ///visual_art/artwork/dimensions_meters
    ///visual_art/artwork/locations
    //visual_art/artwork/date_begun
    //visual_art/artwork/date_completed

    //queries that return lists
    var queries = [];

    //queries.push({
    //    name: "Description",
    //    propname: "description",
    //    query: {
    //        "type": "/common/topic/description",
    //        "description": [{ "mid": null, "name": null }]
    //    }
    //});
    //queries.push({
    //    name: "Image",
    //    propname: "image",
    //    query: {
    //        "type": "/common/topic/image",
    //        "image": [{ "mid": null, "name": null }]
    //    }
    //});

    queries.push({
        name: "Artworks",
        propname: "artworks",
        query: {
            "type": "/visual_art/visual_artist",
            "artworks": [{ "mid": null, "name": null }]
        }
    });

    queries.push({
        name: "Quotations",
        propname: "quotations",
        query: {
            "type": "/people/person",
            "quotations": [{ "mid": null, "name": null }]
        }
    });

    queries.push({
        name: "Influence",
        propname: "influenced",
        query: {
            "type": "/influence/influence_node",
            "influenced": [{ "mid": null, "name": null }]
        }
    });

    queries.push({
        name: "Influenced by",
        propname: "influenced_by",
        query: {
            "type": "/influence/influence_node",
            "influenced_by": [{ "mid": null, "name": null }]
        }
    });
    queries.push({
        name: "Periods or Movements",
        propname: "associated_periods_or_movements",
        query: {
            "type": "/visual_art/visual_artist",
            "associated_periods_or_movements": [{ "mid": null, "name": null }]
        }
    });
    queries.push({
        name: "Peers",
        propname: "peers",
        query: {
            "type": "/influence/influence_node",
            "peers": [{ "mid": null, "name": null }]
        }
    });

    //queries for single-value results
    queries.push({
        name: "Date of Birth",
        propname: "date_of_birth",
        query: {
            "type": "/people/person",
            "date_of_birth": null
        }
    });

    queries.push({
        name: "Date of Death",
        propname: "date_of_death",
        query: {
            "type": "/people/deceased_person",
            "date_of_death": null
        }
    });

    var _getTopic = function _getTopic(freebaseId, filter, callback) {

        var service_url = 'https://www.googleapis.com/freebase/v1/topic';
        var params = {
            'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE',
            'filter': filter
            //  , 'filter': 'suggest'
        };

        $.getJSON(service_url + freebaseId + '?callback=?', params, function (response) {

            callback(response);
        });
    };

    var runQuery = function runQuery(q, callback) {

        var API_KEY = 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE';
        var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';

        var params = {
            'key': API_KEY,
            'query': JSON.stringify(q)
        };
        // console.log(params);

        $.getJSON(service_url + '?callback=?', params, function (response) {

            //var out = { results: [], error: undefined };
            //if (response.result && response.result[q.propname]) {
            //    out.result = response.result[q.propname];
            //}

            callback(response.result);
        });
    };

    var _getPersonData = function _getPersonData(freebaseId, callback) {

        var filters = [];

        filters.push({
            filter: "/visual_art/visual_artist",
            props: ["associated_periods_or_movements"]
        });

        filters.push({
            filter: "/influence/influence_node",
            props: ["influenced", "peers,/influence/peer_relationship/peers", "influenced_by"]

        });

        filters.push({
            filter: "/people/person",
            props: ["date_of_birth", "gender", "nationality",
            //   "parents",
            "place_of_birth", "places_lived,/people/place_lived/location",
            //    "profession",
            //   "religion",
            //   "sibling_s,/people/sibling_relationship/sibling",
            "quotations"]

        });

        filters.push({
            filter: "/people/deceased_person",
            props: ["date_of_death", "place_of_death"]

        });

        var results = {};
        var cnt = 0;

        var out = {};

        angular.forEach(filters, function (f) {

            _getTopic(freebaseId, f.filter, function (result) {

                angular.forEach(f.props, function (p) {

                    arr = p.split(',');

                    var propname = f.filter + "/" + arr[0];

                    if (!result || !result.property || !result.property[propname]) {
                        console.log('property not available: ' + propname);
                    } else {
                        var val = result.property[propname];

                        if (val.valuetype == "compound") {
                            vals = [];
                            angular.forEach(val.values, function (v) {
                                vals.push(v.property[arr[1]].values[0].text);
                            });

                            out["FB_" + arr[0]] = vals;
                        } else {

                            vals = [];
                            angular.forEach(val.values, function (v) {
                                vals.push(v.text);
                            });
                            out["FB_" + arr[0]] = vals;
                        }

                        if (arr[0] == "date_of_death" || arr[0] == "place_of_death" || arr[0] == "place_of_birth" || arr[0] == "date_of_birth" || arr[0] == "gender" || arr[0] == "nationality") {
                            out["FB_" + arr[0]] = out["FB_" + arr[0]][0];
                        }
                    }
                });

                cnt += 1;

                if (cnt == filters.length) {

                    callback(out);
                }
            });
        });
    };

    return {

        getImage: function getImage(freebaseId, width, height, callback) {

            //first get image ids

            _getTopic(freebaseId, "/common/topic/image", function (prop) {
                console.log(prop);
                var imageId = prop.values[0].id;

                var service_url = "https://usercontent.googleapis.com/freebase/v1/image";

                var params = {
                    'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE'
                    //maxwidth=225&maxheight=225&mode=fillcropmid
                };
                width = width || 225;
                height = height || 400;

                callback(service_url + imageId + "?mode=fillcropmid&maxwidth=" + width + "&maxheight=" + height);

                //$.getJSON(service_url + imageId + '?callback=?', params, function (response) {

                //    console.log(response);
                //    callback(response);
                //});
            });
        },

        getText: function getText(node, callback) {

            var prop = '/common/topic/description';

            var service_url = 'https://www.googleapis.com/freebase/v1/topic';
            var params = {
                'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE',
                'filter': prop
                //  , 'filter': 'suggest'
            };

            $.getJSON(service_url + node.FB_ID + '?callback=?', params, function (response) {
                //var out = { results: [], error: undefined };
                //if (response.result && response.result[q.propname]) {
                //    out.result = response.result[q.propname];
                //}
                // console.log(response);

                if (!response["property"]) {
                    console.log('no blurb found for ' + node.Name);
                    callback({});
                } else {

                    console.log(response);

                    var blurb = response["property"][prop].values[0].value;

                    var allowedLength = 20;

                    var indIs = blurb.indexOf(' is ');
                    var indWas = blurb.indexOf(' was ');
                    if (indIs > -1 && (indIs < indWas || indWas == -1)) {
                        indWas = indIs;
                    }
                    if (indWas === -1) {
                        indWas = 0;
                    };

                    if ($.inArray("Person", node.labels) == -1) {
                        indWas = 0;
                    }

                    var stopSpc = blurb.substring(allowedLength + indWas, blurb.length).indexOf('. ') + 1;
                    var stopCr = blurb.substring(allowedLength + indWas, blurb.length).indexOf('.\n') + 1;

                    var stop = stopCr > 0 && stopCr < stopSpc ? stopCr : stopSpc;

                    //console.log(blurb);
                    //console.log(indIs);
                    //console.log(indWas);
                    //console.log(stop);

                    var until = stop > 0 ? allowedLength + indWas + stop : blurb.length;

                    var shortname = node.Lookup;

                    if (shortname.replace(/ /g, '').toLowerCase() == node.Name.toLowerCase()) {
                        shortname = node.name;
                    } else {
                        shortname = shortname.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
                            return str.toUpperCase();
                        });
                    }

                    var short = (indWas > 0 ? shortname : "") + blurb.substring(indWas, until);
                    var full = blurb.substring(until, blurb.length);

                    if (short != full) {
                        callback({
                            "FB_blurb": short.trim(),
                            "FB_blurb_full": full.trim()

                        });
                    } else {
                        callback({
                            "FB_blurb": short.trim(),
                            "FB_blurb_full": null
                        });
                    }
                }
            });
        },

        getTopic: function getTopic(freebaseId, callback) {

            _getTopic(freebaseId, callback);
        },

        getPersonData: function getPersonData(freebaseId, callback) {

            _getPersonData(freebaseId, callback);
        },

        getCreationData: function getCreationData(freebaseId, callback) {

            getData(freebaseId, creationQueries, callback);
        },

        getId: function getId(node, callback) {

            var API_KEY = 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE';
            var service_url = 'https://www.googleapis.com/freebase/v1/search';

            var ispicture = $.inArray('Picture', node.labels);

            var params = {
                'key': API_KEY,
                'query': ispicture ? node.Title || node.Name : node.Lookup,

                'limit': 100
            };

            if ($.inArray("Person", node.labels) > -1) {
                params.filter = "(any type:/people/person type:/people/deceased_person type:/book/author type:/visual_art/visual_artist )";

                //if ($.inArray("Painter", node.labels) > -1) {
                //    params.domain = "/visual_art";
                //}
            } else if ($.inArray("Group", node.labels) > -1 || $.inArray("Period", node.labels) > -1) {

                    params.filter = "(any type:/visual_art/art_period_movement type:/architecture/architectural_style  type:/time/event   type:/book/book_subject)";
                } else if ($.inArray("Provenance", node.labels) > -1) {

                    params.filter = "(any type:/people/ethnicity type:/location/country )";
                    //  params.query = node.Name + " people";
                } else if (ispicture) {
                        params.domain = "/visual_art";
                    }

            var out = { id: undefined, error: undefined };

            $.getJSON(service_url + '?callback=?', params, function (response) {

                $(response.result).each(function (i, e) {

                    if (e.name === node.Name || e.name == node.Wikipagename || e.name.indexOf(node.Name) > -1 || e.name.indexOf(node.Lookup) > -1) {
                        out = e;
                        return false;
                    }
                    //if (e.notable && (e.notable.name === type || e.notable.name.indexOf('Art') > -1)) {
                    //    out = e.mid;
                    //    return false;
                    //}
                });

                out.response = response.result;

                callback(out);
            });
        }
    };
}).directive('freebase', ['freebase.service', 'neo', function (service, neo) {
    return {
        restrict: 'E',
        templateUrl: 'app/node/freebase/node.freebase.html',
        scope: {
            node: '=',
            active: '='
        },
        link: function link($scope) {

            var getPersonData = function getPersonData(node, callback) {

                service.getPersonData(node.FB_ID, function (data) {

                    $.extend(node, data);
                    if (node.FB_date_of_birth && !node.YearFrom) {
                        node.YearFrom = parseInt(node.FB_date_of_birth.split('-')[0]);
                    }
                    if (node.FB_date_of_death && !node.YearTo) {
                        node.YearTo = parseInt(node.FB_date_of_death.split('-')[0]);
                    }
                    callback(node);
                });
            };

            var getBlurb = function getBlurb(node, callback) {

                service.getText(node, function (blurb) {

                    $scope.$apply(function () {
                        $.extend(node, blurb);
                        if (node.FB_blurb && !node.Description) {
                            node.Description = node.FB_blurb;
                        }
                        if (node.FB_blurb_full && !node.Text) {
                            node.Text = node.FB_blurb_full;
                        }
                    });

                    callback(node);
                });
            };

            var getData = function getData(node, blurbOnly) {

                getBlurb(node, function (updated) {

                    if ($.inArray("Person", updated.labels) > -1 && !blurbOnly) {

                        getPersonData(updated, function (updatedPerson) {

                            console.dir(updatedPerson);
                            neo.saveProps(updatedPerson).then(function (nid) {
                                console.log(nid + " saved");
                            });
                        });
                    } else {

                        neo.saveProps(updated).then(function (nid) {
                            console.log(nid + " saved");
                        });
                    }
                });
            };

            $scope.reselect = function (node, mid, name) {

                $scope.clear(node);

                node.FB_ID = mid;
                node.FB_name = name;
                getData(node);
            };

            $scope.clear = function (node) {

                node.FB_ID = null;

                if (node.Text === node.FB_blurb_full) {
                    delete node.Text;
                }

                if (node.Description === node.FB_blurb) {
                    delete node.Description;
                }

                if (node.FB_date_of_birth && node.YearFrom == parseInt(node.FB_date_of_birth.split('-')[0])) {
                    delete node.YearFrom;
                }

                if (node.FB_date_of_death && node.YearTo == parseInt(node.FB_date_of_death.split('-')[0])) {
                    delete node.YearTo;
                }

                for (var prop in node) {
                    if (prop.indexOf('FB_') == 0) {
                        delete node[prop];
                    }
                }

                neo.saveProps(node).then(function (nid) {
                    console.log(nid + " saved");
                });
            };

            var loaded = false;

            var getFreebase = function getFreebase() {

                service.getId($scope.node, function (result) {

                    $scope.$apply(function () {
                        $scope.disambiguation = result.response;
                        loaded = true;
                    });
                });
            };

            $scope.$watch('node', function (node) {

                if (node) {

                    loaded = false;

                    if ($scope.active) {
                        getFreebase();
                    }
                }
            });

            $scope.$watch('active', function (active) {

                if (active && $scope.node && !loaded) {

                    getFreebase();
                }
            });
        }
    };
}]);
'use strict';

angular.module('neograph.node.graphpanel', ['neograph.neo', 'neograph.utils']).directive('nodegraphpanel', ['neo', 'utils', function (neo, utils) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/node/graphpanel/node.graphpanel.html',
        scope: {
            node: '=',
            active: '=',
            window: '=?',
            width: '=?',
            height: '=?'
        },
        link: function link($scope, $element, $attrs) {

            var network;

            var graph = {
                nodes: new vis.DataSet(),
                edges: new vis.DataSet()
            };

            $scope.view = utils.newView('NodeGraph', 'NodeGraph');

            $scope.view.queryGenerator = {
                type: "nodeGraph",
                options: { node: $scope.node }
            };

            $scope.$watch('node', function (n) {
                $scope.view.queryGenerator.options = { node: n };
            });

            $scope.w = 200;
            $scope.h = 200;

            $scope.$watch('active', function (active) {
                if (active && !network) {

                    if ($scope.width && $scope.height) {
                        $scope.w = $scope.width;
                        $scope.h = $scope.height;
                    } else if ($scope.window) {
                        $scope.w = $scope.window.width;
                        $scope.h = $scope.window.height - 170;
                    }

                    network = new vis.Network($element.find('.graphContainer')[0], graph, utils.graphOptions);
                    network.setSize($scope.w + "px", $scope.h + "px");
                    //fit to screen on resize
                    network.on('resize', function (params) {
                        network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                    });

                    //network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });

            $scope.$watch('view.data', function (data) {
                if ($scope.active) {
                    console.log('drawing new graph');
                    graph.nodes.clear();
                    graph.edges.clear();
                    var gArr = utils.toGraphData(data);
                    graph.nodes.add(gArr.nodes);
                    graph.edges.add(gArr.edges);
                }
            });

            $scope.$watch('window', function (w) {

                if (network && w) {
                    network.setSize($scope.window.width + "px", $scope.window.height - 170 + "px");
                    network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });

            $scope.$watch('width', function () {

                if (network) {
                    network.setSize($scope.width + "px", $scope.height - 170 + "px");
                    network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });
            $scope.$watch('height', function () {

                if (network) {
                    network.setSize($scope.width + "px", $scope.height - 170 + "px");
                    network.zoomExtent({ duration: 1000, easingFunction: 'easeOutCubic' });
                }
            });
        }
    };
}]);
'use strict';

angular.module('node.graphTypes', ['neograph.neo']).directive('graphTypes', function () {
                    return {
                                        restrict: 'E',
                                        templateUrl: 'app/node/graphtypes/node.graphTypes.html',
                                        scope: {
                                                            node: '=',
                                                            window: '='
                                        },

                                        link: function link($scope) {

                                                            $scope.$watch('node', function (node) {

                                                                                if (node) {

                                                                                                    var querys = [];

                                                                                                    var Lookup = node.Lookup;

                                                                                                    //if ($.inArray('User', node.labels) > -1 || $.inArray('Picture', node.labels) > -1 || $.inArray('Favourite', node.labels) > -1) {
                                                                                                    //    querys.push(
                                                                                                    //                          {
                                                                                                    //                              name: "All immediate relationships",
                                                                                                    //                              q: "MATCH (c)-[r]-(d) where ID(c) = " + node.id + " return c,d,r"
                                                                                                    //                          })
                                                                                                    //}
                                                                                                    //else {

                                                                                                    //    querys.push(
                                                                                                    //                          {
                                                                                                    //                              name: "All immediate relationships",
                                                                                                    //                              q: "MATCH (c)-[r]-(d:Global) where ID(c) = " + node.id + " return c,d,r"
                                                                                                    //                          })

                                                                                                    //}

                                                                                                    if ($.inArray("Provenance", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: "Provenance",
                                                                                                                                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                                                                                                                        });
                                                                                                    }

                                                                                                    if ($.inArray("Period", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: "Period",
                                                                                                                                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                                                                                                                        });
                                                                                                    }

                                                                                                    if ($.inArray("Theme", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: "Theme",
                                                                                                                                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                                                                                                                        });
                                                                                                    }

                                                                                                    if ($.inArray("Person", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: "Outbound Influence",
                                                                                                                                            //  q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) return c,d,e,f,r,s,t",
                                                                                                                                            q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter) with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e ",
                                                                                                                                            connectAll: true
                                                                                                                        });

                                                                                                                        querys.push({
                                                                                                                                            name: "Inbound Influence",
                                                                                                                                            //    q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) return c,d,e,f,r,s,t",
                                                                                                                                            q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter) with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e ",
                                                                                                                                            connectAll: true
                                                                                                                        });
                                                                                                    }

                                                                                                    if ($.inArray("Group", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: 'Group',
                                                                                                                                            q: "match (n {Lookup:'" + Lookup + "'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p",

                                                                                                                                            connectAll: true
                                                                                                                        });
                                                                                                    }

                                                                                                    if ($.inArray("Iconography", node.labels) > -1) {

                                                                                                                        querys.push({
                                                                                                                                            name: 'Iconography',
                                                                                                                                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  and not d.Lookup='" + Lookup + "' and (d:" + Lookup + " or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r",

                                                                                                                                            connectAll: true
                                                                                                                        });
                                                                                                    }

                                                                                                    if (!node.temp.isPicture && node.YearFrom && node.YearTo) {

                                                                                                                        var yq = "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and ";
                                                                                                                        yq += "((c.YearTo >= " + node.YearFrom + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearTo + "))";
                                                                                                                        yq += "and ((d.YearTo >= " + node.YearFrom + " and d.YearTo<= " + node.YearTo + ") or (d.YearFrom >= " + node.YearFrom + " and d.YearFrom<= " + node.YearTo + "))";
                                                                                                                        yq += " return c,d,r";
                                                                                                                        querys.push({
                                                                                                                                            name: 'YearFromYearTo',
                                                                                                                                            q: yq,

                                                                                                                                            connectAll: true
                                                                                                                        });
                                                                                                    }

                                                                                                    angular.forEach(querys, function (query) {

                                                                                                                        query.view = node.Lookup + " - " + query.name;
                                                                                                                        query.type = "Graph";
                                                                                                    });

                                                                                                    $scope.querys = querys;
                                                                                } else {

                                                                                                    $scope.querys = [];
                                                                                }
                                                            });
                                        }

                    };
});
'use strict';

angular.module('node.imageRelationships', ['neograph.neo']).directive('imageRelationships', ['neo', function (neo) {
    return {
        restrict: 'E',
        templateUrl: '/app/node/imageRelationships/node.imageRelationships.html',
        scope: {
            node: '=',
            query: '=',
            window: '='
        },

        link: function link($scope) {

            $scope.$watch('node', function (node) {

                if (node) {

                    var querys = [];

                    querys.push({
                        name: "Linked pictures",
                        q: "MATCH (c)-[r]-(d:Picture) where ID(c) = " + node.id + " return d"
                    });

                    if (node.YearFrom || node.YearTo) {
                        var yq;

                        if (node.YearFrom && node.YearTo) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo >= " + node.YearTo + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearFrom + ") return c"
                            };
                        } else if (node.YearTo) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo = " + node.YearTo + " ) or (c.YearFrom = " + node.YearTo + " ) return c"
                            };
                        } else if (node.YearFrom) {
                            yq = {
                                q: "MATCH (c:Picture) where  (c.YearTo = " + node.YearFrom + ") or (c.YearFrom = " + node.YearFrom + " ) return c"
                            };
                        }
                        yq.name = "Contemporaneous";
                        yq.type = "Grid";

                        yq.preview = yq.q + " limit 3";
                        querys.push(yq);
                    }

                    angular.forEach(node.labels, function (label) {

                        if (label != "Picture" && label != "Painting") {
                            querys.push({
                                isLabel: true,
                                name: label,
                                q: "MATCH (c:Picture:" + label + ") return c",
                                preview: "MATCH (c:Picture:" + label + ")  where ID(c)<>" + node.id + "  return c limit 3",
                                view: label,
                                type: "Grid",
                                queryGenerator: { id: "nodeFilter", options: { node: { Lookup: label } } }
                            });
                        }
                    });

                    //if (node.YearFrom && node.YearTo) {

                    //    var yq = "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and ";
                    //    yq += "((c.YearTo >= " + node.YearFrom + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearTo + "))";
                    //    yq += "and ((d.YearTo >= " + node.YearFrom + " and d.YearTo<= " + node.YearTo + ") or (d.YearFrom >= " + node.YearFrom + " and d.YearFrom<= " + node.YearTo + "))";
                    //    yq += " return c,d,r";
                    //    querys.push({
                    //        name: 'YearFromYearTo',
                    //        q: yq

                    //     ,
                    //        connectAll: true
                    //    });

                    //}

                    $scope.querys = querys;

                    angular.forEach(querys, function (query) {

                        neo.getGraph(query.preview || query.q).then(function (g) {

                            query.hasData = !$.isEmptyObject(g.nodes);

                            query.data = g;
                        });
                    });

                    //   console.log(querys);
                } else {

                        $scope.querys = [];
                    }
            });
        }

    };
}]);
'use strict';

angular.module('neograph.node.images', ['neograph.neo']).directive('nodeimages', ['neo', function (neo) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'app/node/images/node.images.html',
        scope: {
            node: '=',
            active: '=',
            updatemasonry: '=' //required to pass on to images. if defined then masonry not used
        },
        link: function link($scope, $element, $attrs) {

            $scope.images = [];

            var loaded = false;

            //load images on active change or on node change if active
            $scope.$watch('active', function (active) {

                if ($scope.node && active && !loaded) {
                    getImages();
                }
            });

            $scope.$watch('node', function (node) {
                loaded = false;
                if (!$scope.active) {
                    $scope.images = [];
                }
                if (node && $scope.active) {
                    getImages();
                }
            });

            var getImages = function getImages() {

                neo.getImages($scope.node).then(function (images) {
                    $scope.images = images;
                    loaded = true;
                });
            };

            $scope.openGridTab = function (node) {

                $scope.publish("query", {
                    view: node.Lookup,
                    type: "Grid",
                    queryGenerator: { id: "nodeFilter", options: { node: node } }
                });
            };
        }
    };
}]);
'use strict';

angular.module('neograph.node.multiple', ['neograph.neo', 'neograph.utils']).directive('multiple', ['neo', 'utils', function (neo, utils) {
    return {
        restrict: 'E',
        templateUrl: 'app/node/multiple/node.multiple.html',
        scope: {
            nodes: '='
        },
        link: function link($scope) {

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

                    $scope.originalLabels = angular.copy($scope.labels); //store for saving so we know what to change
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
                            $scope.publish("restored", { selection: { nodes: restored } });
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
                            $scope.publish("deleted", { selection: { nodes: deleted } });
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
                            $scope.publish("deleted", { selection: { nodes: deleted } });
                            $scope.selection.multiple = undefined;
                            $scope.tabs = [];
                        }
                    });
                });
            };

            //$scope.selection.multiple = new (function (nodes, labels) {
            //    var self = this;
            //    this.nodes = nodes;
            //    this.labels = labels;

            //})(params.selection.nodes, labels);
        }
    };
}]);
'use strict';

angular.module('neograph.node.properties', ['neograph.node.service', 'neograph.session', 'neograph.utils']).controller('EditPropertiesCtrl', ["nodeService", "session", "utils", "$scope", "$stateParams", function (nodeService, session, utils, $scope, $stateParams) {

    if ($stateParams.node) {
        nodeService.get($stateParams.node, true).then(function (node) {
            $scope.node = node;
        });
    }

    $scope.deleteNode = function (n) {

        nodeService.delete(n).then(function (deleted) {

            $scope.selection.selectedNode = deleted;
            //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
            //let view handle its own data ?
            delete $scope.activeView.data.nodes[n.id];
            $scope.publish("deleted", { selection: { nodes: [n] } });
        });
    };

    $scope.destroyNode = function (n) {

        nodeService.destroy(n).then(function (deleted) {

            $scope.selection.selectedNode = undefined;

            //this assumes that the current view is not of deleted items, otherwise this would be inconsistent
            //let view handle its own data ?
            delete $scope.activeView.data.nodes[n.id];

            $scope.publish("deleted", { selection: { nodes: [n] } });
        });
    };

    $scope.saveNode = function (n) {

        nodeService.save(n, session.user).then(function (node) {

            $scope.node = node;

            var newData = {};
            newData[node.id] = node;
            $scope.publish("dataUpdate", newData);
            //if type, refresh types
            if (node.class == "Type") {
                utils.refreshTypes();
            }

            $(node.temp.links).each(function (i, e) {
                e.editing = undefined;
            });
        });
    };

    $scope.restoreNode = function (n) {
        nodeService.restore(n).then(function (node) {
            $scope.node = node;
            var newData = {};
            newData[node.id] = node;
            $scope.publish("dataUpdate", newData);
        });
    };

    $scope.$watch("node", function (node) {
        if (node) {

            node.labelled = node.labelled || [];

            $(".labelEdit input").val('');

            $scope.deleted = node.labels.indexOf('Deleted') > -1;
        }
    });

    //tie label value to lookup if empty or the same already
    $scope.$watch("node.lookup", function (lookup, beforechange) {
        if (lookup) {

            if ($scope.node.label != undefined && $scope.node.label.trim() == "" || $scope.node.label == beforechange) {
                $scope.node.label = lookup;
            }
        }
    });

    $scope.nodeTypes = [];

    //update tabs & properties if labels change
    var settingPropsAndTabs = false;

    /*
       //how can i stop this firing for newly loaded nodes ?
       $scope.$watchCollection('selection.selectedNode.labels', function (labels) {
        
           if (labels && labels.length && !settingPropsAndTabs ) {
    
               settingPropsAndTabs = true;
    
               nodeService.getProps(labels).then(function (out) {
    
                   console.dir($scope.selection.selectedNode);
                   $scope.selection.selectedNode = $.extend(null,out.properties, $scope.selection.selectedNode);
                   $scope.selection.selectedNode.temp.tabs = out.tabs;
                   $scope.tabs = $scope.selection.selectedNode.temp.tabs;
             
                   settingPropsAndTabs = false;
               })
           }
       });
       */

    $scope.$watchCollection("node.labels", function (labels) {
        console.log('labels changed');
        console.log(labels);
        if (labels) {

            var selectedTypes = [];
            angular.forEach($scope.node.labels, function (l) {
                if (utils.types[l]) {
                    selectedTypes.push({ lookup: l, class: 'Type' });
                }
            });

            $scope.nodeTypes = selectedTypes;

            //     console.log(selectedTypes);

            //set type if not yet set and one label added that is a type
            if (!$scope.node.class && $scope.nodeTypes.length === 1) {

                $scope.node.class = $scope.nodeTypes[0].lookup; //for types the lookup will always be the label
            }

            //get properties relating to chosen labels and extend node to enable them
            //nodeService.getProps(labels).then(function (out) {
            //    console.log('extending node');
            //    console.log(out);
            //    console.log(out.props);
            //    $scope.node = $.extend(out.props,$scope.node);
            //    console.log($scope.node);
            //});
        }
    });

    //can be called from clicking label, in which case item is text value, or from the typeahead in which case it is an object with Lookup property
    $scope.setType = function (item) {
        //   var itemtext = item.Label ||item.Lookup
        console.log(item);
        if (utils.isType(item.label)) {
            $scope.node.class = item.label;
        }
    };

    $scope.$watch('newPredicate', function (v) {

        if (v) {
            $scope.addRelationship({ lookup: v.toUpperCase().replace(/ /g, "_") });
        }
    });

    $scope.addRelationship = function (item) {

        var p = predicateFactory.create({ lookup: item.lookup, direction: "out" }); //currently no way to select 'in' relationships

        $scope.node.relationships = $scope.node.relationships || {};
        if (!$scope.node.relationships[p.toString()]) {
            $scope.node.relationships[p.toString()] = { predicate: p, items: [] };
        }
    };
}]);
'use strict';

angular.module('neograph.node.relationships', ['neograph.node.service', 'neograph.session', 'neograph.utils']).controller('EditRelationshipsCtrl', ["nodeService", "session", "utils", "$scope", "$stateParams", function (nodeService, session, utils, $scope, $stateParams) {

    if ($stateParams.node) {
        nodeService.get($stateParams.node, true).then(function (node) {
            $scope.node = node;
        });
    }

    $scope.$watch("node", function (node) {
        if (node) {

            node.labelled = node.labelled || [];

            $(".labelEdit input").val('');

            $scope.deleted = node.labels.indexOf('Deleted') > -1;
        }
    });

    $scope.nodeTypes = [];

    //update tabs & properties if labels change
    var settingPropsAndTabs = false;

    /*
       //how can i stop this firing for newly loaded nodes ?
       $scope.$watchCollection('selection.selectedNode.labels', function (labels) {
        
           if (labels && labels.length && !settingPropsAndTabs ) {
    
               settingPropsAndTabs = true;
    
               nodeService.getProps(labels).then(function (out) {
    
                   console.dir($scope.selection.selectedNode);
                   $scope.selection.selectedNode = $.extend(null,out.properties, $scope.selection.selectedNode);
                   $scope.selection.selectedNode.temp.tabs = out.tabs;
                   $scope.tabs = $scope.selection.selectedNode.temp.tabs;
             
                   settingPropsAndTabs = false;
               })
           }
       });
       */

    $scope.$watch('newPredicate', function (v) {

        if (v) {
            $scope.addRelationship({ lookup: v.toUpperCase().replace(/ /g, "_") });
        }
    });

    $scope.addRelationship = function (item) {

        var p = predicateFactory.create({ lookup: item.lookup, direction: "out" }); //currently no way to select 'in' relationships

        $scope.node.relationships = $scope.node.relationships || {};
        if (!$scope.node.relationships[p.toString()]) {
            $scope.node.relationships[p.toString()] = { predicate: p, items: [] };
        }
    };
}]);
'use strict';

angular.module('neograph.node.wikipedia', ['neograph.neo']).factory('wikiservice', function () {

                var wikiTabs = function wikiTabs(data, page) {

                                var tabs = [];

                                if (data.parse) {

                                                //     console.log(data.parse.text["*"]);
                                                var $wikiDOM = $("<document>" + data.parse.text["*"] + "</document>");

                                                // handle redirects
                                                if ($wikiDOM.find('ul.redirectText').length > 0) {

                                                                tabs = { redirect: $wikiDOM.find("ul.redirectText li a").attr("title") };

                                                                //$wikiDOM.find('li:contains("REDIRECT") a').css("cursor", "pointer");
                                                                //$wikiDOM.find('li:contains("REDIRECT") a').each(function () {

                                                                //    $(this).replaceWith($(this).text());

                                                                //});

                                                                //if ($wikiDOM.find('li:contains("REDIRECT")').length == 1) {
                                                                //    // self.getItem().wikiPageName = ;
                                                                //    var redirectTo = $wikiDOM.find('li:contains("REDIRECT")').text().replace('REDIRECT', '').trim();

                                                                //    service.getWiki(redirectTo).done(function (data) {
                                                                //        self.populateWiki(data);
                                                                //    });

                                                                //}
                                                                //else {

                                                                //    self.wiki($wikiDOM);
                                                                //    self.loaded(true);
                                                                //    self.loading(false);

                                                                //}
                                                } else {

                                                                                var images = $("<div></div>");

                                                                                $wikiDOM.find(".image").each(function (i, e) {

                                                                                                $(e).attr("href", $(e).attr("href").replace("/wiki/", "https://en.wikipedia.org/wiki/" + page.replace(" ", "_") + "#/media/")).attr("target", "_blank").css({ "padding-right": "5px", "padding-bottom": "5px" });
                                                                                });

                                                                                $wikiDOM.find(".image").appendTo(images);

                                                                                $wikiDOM.find("p").css({ "margin-bottom": "4px", "clear": "left" });

                                                                                //$wikiDOM.find("p,.thumb,.thumbinner").css({ "width": "340px" });
                                                                                $wikiDOM.find("p,.thumb,.thumbinner").css({ "width": "100%" });

                                                                                // $wikiDOM.find(".gallery.p,.gallery.thumb,.gallery.thumbinner").css({ "width": "" });

                                                                                // $wikiDOM.find("h2,h3").css({ "margin-top": "4px", "float": "left", "clear": "left" });
                                                                                //$wikiDOM.find("h2,h3,h4").css({ "margin-top": "4px", "margin-bottom": "2px", "float": "left", "clear": "left", "width": "340px", "overflow": "hidden" });
                                                                                $wikiDOM.find("h2,h3,h4").css({ "margin-top": "4px", "margin-bottom": "2px", "float": "left", "clear": "left", "width": "100%", "overflow": "hidden" });
                                                                                $wikiDOM.find("#toc").remove();
                                                                                $wikiDOM.find(".editsection").remove();
                                                                                $wikiDOM.find(".magnify").remove();
                                                                                $wikiDOM.find(".reflist").remove();
                                                                                $wikiDOM.find("img").css({ "display": "block", "float": "left", "margin-right": "3px", "margin-bottom": "3px" });
                                                                                $wikiDOM.find(".thumb,.thumbinner").css({ "float": "left", "margin-right": "3px", "margin-bottom": "3px" });
                                                                                $wikiDOM.find(".thumbcaption").css({ "font-size": "11px" });
                                                                                $wikiDOM.find(".plainlinks").remove();
                                                                                $wikiDOM.find("#navbox").remove();
                                                                                $wikiDOM.find(".rellink").remove();
                                                                                $wikiDOM.find(".references").remove();
                                                                                $wikiDOM.find(".IPA").remove();
                                                                                $wikiDOM.find("sup").remove();
                                                                                //$wikiDOM.find("dd,blockquote").css({ "margin": "10px", "width": "340px", "font-size": "11px" });
                                                                                $wikiDOM.find("dd,blockquote").css({ "margin": "0px", "width": "", "font-size": "11px", "margin-bottom": "10px", "margin-top": "7px" });
                                                                                $wikiDOM.find("blockquote p").css({ "font-size": "11px" });
                                                                                $wikiDOM.find(".navbox, .vertical-navbox").remove(); //nb this has interesting stuff in it
                                                                                $wikiDOM.find("#persondata").remove();
                                                                                $wikiDOM.find("#Footnotes").parent().remove();
                                                                                $wikiDOM.find("#References").parent().remove();
                                                                                $wikiDOM.find("#Bibliography").parent().remove();
                                                                                $wikiDOM.find(".refbegin").remove();
                                                                                $wikiDOM.find(".dablink").remove();
                                                                                $wikiDOM.find("small").remove(); //a bit too radical?
                                                                                $wikiDOM.find("img[alt='Wikisource-logo.svg'], img[alt='About this sound'], img[alt='Listen']").remove();
                                                                                $wikiDOM.find(".mediaContainer").remove();
                                                                                //remove links - todo:leave external links ?
                                                                                $wikiDOM.find("a").each(function () {
                                                                                                $(this).replaceWith($(this).html());
                                                                                });

                                                                                $wikiDOM.find(".gallery").find("p").css({ "width": "", "font-size": "11px", "float": "left", "clear": "left" });
                                                                                $wikiDOM.find(".gallery").find(".thumb").css({ "width": "" });
                                                                                $wikiDOM.find(".gallerybox").css("height", "220px");
                                                                                $wikiDOM.find(".gallerybox").css("float", "left");

                                                                                $wikiDOM.find("table").css({ "background": "none", "width": "", "max-width": "", "color": "" });

                                                                                $wikiDOM.find(".gallery").remove();
                                                                                $wikiDOM.find("#gallery").parent().remove();
                                                                                $wikiDOM.find("#notes").parent().remove();
                                                                                $wikiDOM.find("#sources").parent().remove();

                                                                                //radical - remoces all tables
                                                                                $wikiDOM.find("table").remove();

                                                                                $wikiDOM.find("h1,h2,h3,h4").next().css({ "clear": "left" });

                                                                                //remove description lists
                                                                                $wikiDOM.find("dl").remove();
                                                                                //removes images
                                                                                $wikiDOM.find(".thumb").remove();

                                                                                $wikiDOM.find("ul,.cquote").css({ "float": "left", "clear": "left" });

                                                                                $wikiDOM.find(".infobox, .vcard").remove();
                                                                                $wikiDOM.find(".thumbimage").css({ "max-width": "150px", "height": "auto" });

                                                                                $wikiDOM.find(".mw-editsection").remove();

                                                                                $wikiDOM.html($wikiDOM.html().replace('()', ''));
                                                                                $wikiDOM.html($wikiDOM.html().replace('(; ', '('));

                                                                                //    $wikiDOM.prepend("<h2>" + self.query() + "</h2>");

                                                                                $wikiDOM.find("h2").css({ "cursor": "pointer", "color": "rgba(0,85,128,1)", "font-size": "20px" });
                                                                                $wikiDOM.find("h3").css({ "font-size": "18px" });
                                                                                $wikiDOM.find('#Gallery').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#See_also').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Notes').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#External_links').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Selected_works').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Sources').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Other_reading').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Further_reading').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Resources').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Further_reading_and_sources').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#List_of_paintings').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Self-portraits').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Selected_paintings').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#References_and_sources').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Partial_list_of_works').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('#Notes_and_references').parent().nextUntil("h2").andSelf().remove();

                                                                                $wikiDOM.find('[id^=Selected_works]').parent().nextUntil("h2").andSelf().remove();
                                                                                $wikiDOM.find('[id^=Books]').parent().nextUntil("h2").andSelf().remove();
                                                                                //    $wikiDOM.find('#Books/Essays').parent().nextUntil("h2").andSelf().remove();

                                                                                //var $menu = $tabs.find("#tabmenu");
                                                                                //var $content = $tabs.find("#tabcontent");

                                                                                var $introTab = $("<div></div>");
                                                                                $wikiDOM.find("p:first").nextUntil("h2").andSelf().appendTo($introTab);
                                                                                if ($introTab.text().indexOf("Redirect") === -1 && $introTab.text().indexOf("may refer to") === -1) {
                                                                                                $introTab.find('ul').remove();
                                                                                }
                                                                                if ($introTab.html()) {
                                                                                                tabs.push({
                                                                                                                header: "Summary",
                                                                                                                content: $introTab.html().replace('/; /g', '')
                                                                                                });
                                                                                }

                                                                                $wikiDOM.find("h2").each(function (i, e) {

                                                                                                var $tab = $("<div></div>");
                                                                                                $(e).nextUntil("h2").appendTo($tab);
                                                                                                if ($tab.html()) {

                                                                                                                tabs.push({
                                                                                                                                header: $(e).text(),
                                                                                                                                content: $tab.html()
                                                                                                                });
                                                                                                }
                                                                                });

                                                                                if (images.html()) {

                                                                                                images.find("img").css({ "width": "250px", "marginBottom": "5px" });

                                                                                                tabs.push({
                                                                                                                header: "Images",
                                                                                                                content: images.html()
                                                                                                });
                                                                                }
                                                                }
                                }

                                return tabs;
                };

                var getWiki = function getWiki(page, callback) {

                                $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {
                                                page: page,
                                                prop: 'text',
                                                //prop: 'wikitext',
                                                uselang: 'en'
                                }, function (data) {
                                                console.log(data);
                                                var tabs = wikiTabs(data, page);

                                                if (tabs.redirect) {

                                                                getWiki(tabs.redirect, callback);
                                                } else {
                                                                callback(tabs);
                                                }
                                });
                };

                return {

                                getPage: function getPage(page, callback) {

                                                getWiki(page, callback);
                                }
                };
}).directive('wikipedia', ['wikiservice', 'neo', function (wikiservice, neo) {
                return {
                                restrict: 'E',
                                templateUrl: 'app/node/wikipedia/node.wikipedia.html',
                                scope: {
                                                node: '=',
                                                window: '=',
                                                active: '='
                                },
                                link: function link($scope, $element) {

                                                $scope.tabs = [];

                                                $scope.setActiveTab = function (tab) {
                                                                $scope.activeTab = tab;
                                                };

                                                var loaded = false;
                                                $scope.$watch('node', function (node) {
                                                                if (node) {
                                                                                loaded = false;
                                                                                $scope.page = node.Wikipagename || node.Name || node.Title;
                                                                }
                                                });

                                                $scope.savePage = function () {

                                                                $scope.node.Wikipagename = $scope.page;
                                                                neo.saveWikipagename($scope.node).then(function (node) {
                                                                                $scope.page = node.Wikipagename;
                                                                });
                                                };

                                                var getPage = function getPage() {

                                                                wikiservice.getPage($scope.page, function (tabs) {

                                                                                $scope.tabs = tabs;
                                                                                $scope.activeTab = $scope.tabs[0];
                                                                                $scope.$digest();
                                                                                $($element).find('.wikidropdown').dropdown();
                                                                                loaded = true;
                                                                });
                                                };

                                                $scope.$watch('page', function (page) {

                                                                if (page && $scope.active) {

                                                                                getPage();
                                                                } else {
                                                                                $scope.tabs = [];
                                                                }
                                                });

                                                $scope.$watch('active', function (active) {

                                                                if ($scope.page && active && !loaded) {

                                                                                getPage();
                                                                }
                                                });
                                }
                };
}]);
'use strict';

angular.module('neograph.query.generator.favouritesFilter', ['neograph.neo']).directive('favouritesFilter', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: 'app/query/generator/favouritesFilter.html',
        scope: {
            options: '=',

            generated: '='
        },
        link: function link($scope, $element, $attrs) {

            $scope.filters = [];
            $scope.node = {};
            var labels = [];
            $scope.$watch('options', function (options) {
                if (options) {
                    $scope.node = options.user;
                }
            });

            $scope.$watch('node', function (user) {
                load();
            });

            var load = function load() {
                if ($scope.node) {
                    labels = [$scope.node.Lookup, 'Favourite'];
                    getFilters();
                    $scope.enabledFilters = [];
                    $scope.process();
                }
            };

            var getFilters = function getFilters() {
                if (labels && labels.length) {

                    var labelQuery = "match (a:" + labels.join(':') + ") - [] -> (b) return distinct(LABELS(b))";

                    neo.getDistinctLabelsQuery(labelQuery).then(function (l) {

                        //remove filter for this node as it is duplicating
                        angular.forEach(labels, function (lab) {
                            l.splice($.inArray(lab, l), 1);
                        });
                        $scope.filters = l;
                    });
                }
            };

            $scope.process = function (labs) {

                if ($scope.node) {

                    labs = labs || [];

                    var b = "b";
                    if (labs.length) {
                        b += ":" + labs.join(":");
                    }

                    var q = "match (a:" + labels.join(':') + ") - [] -> (" + b + ")";

                    $scope.generated = q + " return b";

                    if (labs.length) {
                        neo.getDistinctLabelsQuery(q + " return distinct(LABELS(b))").then(function (l) {
                            $scope.enabledFilters = l;
                        });
                    } else {
                        $scope.enabledFilters = [];
                    }
                }
            };
        }
    };
}]);
'use strict';

angular.module('neograph.query.generator.nodeFilter', ['neograph.neo']).directive('nodeFilter', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: 'app/query/generator/nodeFilter.html',
        scope: {
            options: '=',

            generated: '=',

            nodechanged: '&?'
        },
        link: function link($scope, $element, $attrs) {

            $scope.filters = [];
            $scope.node = {};
            var labels = [];

            $scope.$watch('options', function (options) {

                console.log('node filter options changed');
                $scope.node = options.node;
            });

            //$scope.$watch('options.node', function (node) {

            //    console.log('node filter options.node changed')

            //});

            $scope.$watch('node', function (node) {
                if ($scope.nodechanged) {
                    $scope.nodechanged({ node: node });
                }
                load();
            });

            $scope.openNode = function () {

                if ($scope.node) {
                    $scope.publish('selected', { selection: { nodes: [$scope.node] } });
                }
            };

            var load = function load() {
                if ($scope.node) {
                    labels = [$scope.node.Label, 'Picture'];
                    getFilters();
                    $scope.enabledFilters = [];
                    $scope.process();
                }
            };

            var getFilters = function getFilters() {
                console.log('node filter - get filters');
                console.log(labels);
                if (labels && labels.length) {
                    neo.getDistinctLabels(labels).then(function (l) {

                        //remove filter for this node as it is duplicating
                        angular.forEach(labels, function (lab) {
                            l.splice($.inArray(lab, l), 1);
                        });

                        $scope.filters = l;
                        console.log($scope.filters);
                    });
                }
            };

            $scope.process = function (labs) {

                if ($scope.node) {

                    if (!labs || !labs.length) {
                        labs = labels;
                    } else {
                        labs = labs.concat(labels);
                    }

                    $scope.generated = "match (a:" + labs.join(':') + " ) return a order by a.Status desc limit 500";

                    if (labs != labels) {
                        neo.getDistinctLabels(labs).then(function (l) {
                            $scope.enabledFilters = l;
                        });
                    } else {
                        $scope.enabledFilters = [];
                    }
                }
            };
        }
    };
}]);
'use strict';

angular.module('neograph.query.generator.nodeGraph', ['neograph.neo']).directive('nodeGraph', ['neo', function (neo) {

    return {
        restrict: 'E',
        templateUrl: 'app/query/generator/nodeGraph.html',
        scope: {
            options: '=',

            generated: '=',

            nodechanged: '&?'
        },
        link: function link($scope, $element, $attrs) {

            $scope.querys = [];
            $scope.selected = "";
            $scope.node = {};

            $scope.$watch('options', function (options) {
                console.log('node filter options changed');
                $scope.node = options.node;
            });

            $scope.$watch('selected', function (sel) {
                console.log(sel);
                if (sel && sel.q) {
                    $scope.generated = sel.q;
                }
            });

            $scope.$watch('node', function (node) {

                if (node && node.id) {
                    if ($scope.nodechanged) {
                        $scope.nodechanged({ node: node });
                    }
                    neo.getNode(node.id, false).then(function (loaded) {
                        getQuerys(loaded);
                    });
                }
            });

            $scope.openNode = function () {

                if ($scope.node) {
                    $scope.publish('selected', { selection: { nodes: [$scope.node] } });
                }
            };

            var getQuerys = function getQuerys(node) {

                if (node) {

                    var querys = [];
                    var Lookup = node.Lookup;

                    querys.push({
                        name: "All immediate relationships",
                        q: "MATCH (c)-[r]-(d:Global) where ID(c) = " + node.id + " return c,d,r"
                    });

                    querys.push({
                        name: "Self",
                        q: "MATCH (c:" + node.Label + ")-[r]-(d:" + node.Label + ")   return c,d,r"
                    });

                    if ($.inArray("Provenance", node.labels) > -1) {

                        querys.push({
                            name: "Provenance",
                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                        });
                    }

                    if ($.inArray("Period", node.labels) > -1) {

                        querys.push({
                            name: "Period",
                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                        });
                    }

                    if ($.inArray("Theme", node.labels) > -1) {

                        querys.push({
                            name: "Theme",
                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and not d.Lookup='" + Lookup + "' and not c.Lookup='" + Lookup + "'  return c,d,r"
                        });
                    }

                    if ($.inArray("Person", node.labels) > -1) {

                        querys.push({
                            name: "Outbound Influence",
                            //  q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter)  -[s]->(e:Painter)  -[t]->(f:Painter) return c,d,e,f,r,s,t",
                            q: "MATCH (c {Lookup:'" + Lookup + "'})-[r]->(d:Painter) with c,d,r optional  match(d) -[s]->(e:Painter) return c,d,r,s,e ",
                            connectAll: true
                        });

                        querys.push({
                            name: "Inbound Influence",
                            //    q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter)  <-[s]-(e:Painter)  <-[t]-(f:Painter) return c,d,e,f,r,s,t",
                            q: "MATCH (c {Lookup:'" + Lookup + "'})<-[r]-(d:Painter) with c,d,r optional  match(d) <-[s]-(e:Painter) return c,d,r,s,e ",
                            connectAll: true
                        });
                    }

                    if ($.inArray("Group", node.labels) > -1) {

                        querys.push({
                            name: 'Group',
                            q: "match (n {Lookup:'" + Lookup + "'}) -[r]-(m:Global) -[s]-(p:Global) where not (n-[:TYPE_OF]-m) and not (m-[:TYPE_OF]-p) and (m:Painter or m:Group) and (p:Painter or p:Group) and not m:Provenance and not p:Provenance return n,r,m,s,p",

                            connectAll: true
                        });
                    }

                    if ($.inArray("Iconography", node.labels) > -1) {

                        querys.push({
                            name: 'Iconography',
                            q: "MATCH (c:Global:" + Lookup + ")-[r]-(d:Global)  where not (c-[:TYPE_OF]-d)  and not d.Lookup='" + Lookup + "' and (d:" + Lookup + " or d:Provenance or d:Group or d:Iconography or d:Place) return c,d,r",

                            connectAll: true
                        });
                    }

                    if (node.YearFrom && node.YearTo) {

                        var yq = "MATCH (c:Global)-[r]-(d:Global) where  not (c-[:TYPE_OF]-d) and ";
                        yq += "((c.YearTo >= " + node.YearFrom + " and c.YearTo<= " + node.YearTo + ") or (c.YearFrom >= " + node.YearFrom + " and c.YearFrom<= " + node.YearTo + "))";
                        yq += "and ((d.YearTo >= " + node.YearFrom + " and d.YearTo<= " + node.YearTo + ") or (d.YearFrom >= " + node.YearFrom + " and d.YearFrom<= " + node.YearTo + "))";
                        yq += " return c,d,r";
                        querys.push({
                            name: 'YearFromYearTo',
                            q: yq,

                            connectAll: true
                        });
                    }

                    var prevselection = $scope.selected.name;

                    $scope.querys = querys;

                    $($scope.querys).each(function (i, e) {

                        if (e.name === prevselection) {
                            $scope.selected = e;
                        }
                    });
                }
            };
        }
    };
}]);
'use strict';

angular.module('neograph.query.generator', ['neograph.query.generator.favouritesFilter', 'neograph.query.generator.nodeFilter', 'neograph.query.generator.nodeGraph']);
//# sourceMappingURL=bundle.js.map
