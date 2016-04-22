angular.module('neograph.common.typeahead',['neograph.utils','neograph.node.service'])
    .directive('typeahead', ['utils', 'nodeService', function (utils, nodeService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            choice: '=?',   //the choice should be an object for 2 way binding with lookup property
            watchvalue: '=?',  //watchvalue should be a text string  -just for updating the textbox value when the value changes, not fed back
            text: '=?', //to feed back the text value when it changes (when no item has been selected)
            restrict: '=?',//options to retrict the items that can be selected = Type,Predicate,User,custom object array with lookup property
            onselected: '&?',
            autosize:'@?'

        },
        template: '<input type="text" class="form-control" />',
        link: function ($scope, element, attrs) {

            var placeholderDefault = "Node...";

            var $input = $(element);//.find('input');
            $input.attr("placeholder", attrs["placeholder"] || placeholderDefault);

            $scope.$watch('choice', function (n) {
                if (n) {
                    $input.val(n.Label || n.lookup);
                }
            })

            if (!attrs["choice"]) {
                $scope.$watch('watchvalue', function (n) {
                    $input.val(n);
                })
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
                    }, 100)
                  
                });
                $input.on("blur", function () {
                    $input.css({ width: '10px' });
                    $input.attr("placeholder", "+");
                    $input.val('');
                })
              
            }

            $input.typeahead({
                source: getSource(),

                matcher: function (obj) {

                    var item = JSON.parse(obj);

                    return ~item.lookup.toLowerCase().indexOf(this.query.toLowerCase())
                }
                ,
                sorter: function (items) {
                    var beginswith = [], caseSensitive = [], caseInsensitive = [],aItem, item;
                    while (aItem = items.shift()) {
                        var item = JSON.parse(aItem);
                        if (!item.lookup.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(JSON.stringify(item));
                        else if (~item.lookup.indexOf(this.query)) caseSensitive.push(JSON.stringify(item));
                        else caseInsensitive.push(JSON.stringify(item));
                    }

                    return beginswith.concat(caseSensitive, caseInsensitive)

                },
                highlighter: function (obj) {
                    var item = JSON.parse(obj);
                    var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                    var out;

                    if (attrs["restrict"] == "Predicate") {
                        out = new utils.Predicate(item.lookup).ToString().replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                            return '<strong>' + match + '</strong>'
                        });

                    }
                    else {
                      
                        out = item.lookup.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                            return '<strong>' + match + '</strong>'
                        }) + " <div style='float:right;margin-left:8px;color:#ccc'>" + item.class + "</div>";
                       
                    }

                    return out;
                },
                updater: function (obj) {

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
                if (e.keyCode == 13) {//enter

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
                }
                else if (attrs["restrict"] == "Predicate") {
                    //convert predicates object to array
                    var source = [];
                    for (var key in utils.predicates) {
                        source.push(JSON.stringify(utils.predicates[key]));
                    }

                    return source;
                  
                }
                else return nodeSource;

            }

            //Globals & users or one or the other depending on value of restrict
            var nodeSource = function (query, process) {

                if ($scope.restrict && $.isArray($scope.restrict) && $scope.restrict.lenth > 0) {

                    if ($scope.restrict[0].lookup) {
                        return $scope.restrict.map(function (d) { return JSON.stringify(d); });
                    }
                    else {
                        return $scope.restrict.map(function (d) { return JSON.stringify({ lookup: d }); });
                    }
                }
                else {
                    nodeService.search(query, attrs["restrict"]).then(function (nodes) {

                        console.log(nodes);
                        process(nodes.map(function (d) {
                            return JSON.stringify(d);
                        }));
                    });
                }

            }

            $scope.$watch('restrict', function () {
                $input.data('typeahead').source = getSource();
            }, true);



        }
    };
}]);
