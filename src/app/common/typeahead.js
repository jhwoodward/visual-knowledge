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
