angular.module("neograph.utils",["neograph.neo.client","neograph.query.presets"])
    .factory("utils", ["neoClient","queryPresets", function (neoClient,presets) {


    Array.prototype.diff = function (a) {
        return this.filter(function (i) { return a.indexOf(i) < 0; });
    };

    Array.prototype.ids = function () {
        return this.map(function (e) { return e.id });
    }

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
    }

  


   
 
  

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
        refreshPredicates: function () {//consider creating lookup nodes for relationship types so that i can store properties for them

            return neoClient.predicate.getAll().$promise.then(function (predicates) {
                utils.predicates = predicates.toJSON();
               // console.log(utils.predicates);
                return utils.predicates;
            });

  


        }
     ,
        isSystemInfo: function (label) {

            return label == "Global" || label == "Type" || label == "Label" || label == "SystemInfo";

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

      
            //mopve to 'state' object
            ,
            tabSettings: {}
            ,
            selectedTab:"Properties"
 
      


    }
    return utils.init();

}]);
