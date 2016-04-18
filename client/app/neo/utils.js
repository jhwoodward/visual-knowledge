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

    var Predicate = function (lookup, direction) {
        this.Lookup = lookup;

        this.IsDirectional = this.Lookup != "ASSOCIATED_WITH";

        this.Direction = direction;

        this.Type = 'Predicate';

        this.Key = function () {

            if (!this.IsDirectional || !this.Direction) {
                return this.Lookup
            }
            else if (this.Direction == "out") {
                return this.Lookup + " ->";
            }
            else {
                return this.Lookup + " <-";
            }
        }

        this.ToString = function () {

            if (!this.IsDirectional || !this.Direction || this.Direction == "out") {
                return this.Lookup.replace(/_/g, ' ').toLowerCase();
            }
            else {

                if (this.Lookup == "CREATED")
                    return "created by"
                else if (this.Lookup == "INFLUENCES")
                    return "influenced by"
                else if (this.Lookup == "INSPIRES")
                    return "inspired by"
                else if (this.Lookup == "ANTICIPATES")
                    return "anticipated by"
                else if (this.Lookup == "DEVELOPS")
                    return "developed by"
                else if (this.Lookup == "DEPICTS")
                    return "depicted by"
                else if (this.Lookup == "TYPE_OF")
                    return "type(s)"
                else
                    return "(" + this.Lookup.replace(/_/g, ' ').toLowerCase() + ")";

            }

        }

        this.Reverse = function () {

            if (!this.IsDirectional) {
                return;
            }

            if (this.Direction === "in") {
                this.Direction = "out";
            }
            else {
                this.Direction = "in";
            }

        }


    }


    var View = function (key, type) {



        this.key = key;
        this.name = key;
        this.type = type;

        this.data = {
            nodes: {},
            edges: {}
        }


        if (type == "Graph") {
            this.queryPresets = presets;
            this.queryGenerators = {};
            this.queryGenerators.nodeGraph = {
                type: "nodeGraph",
                options: {}
            }
        }

        if (type == "Grid") {
            this.queryPresets = presets;
            this.queryGenerators = {};

            this.queryGenerators.nodeFilter = {
                type: "nodeFilter",
                options: {}
            }

            this.queryGenerators.favouritesFilter = {
                type: "favouritesFilter",
                options: {}
            }

        }

    }

 
    var graphNodeFromNeoNode = function (neoNode) {

        var type = neoNode.Type;
        var yf = parseInt(neoNode.YearFrom);
        var yt = parseInt(neoNode.YearTo);

        var y = yt;

        if (yf && yt) {
            y = yt - ((yt - yf) / 2);
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
        }

        var image = (type === 'Painting' || type === 'Picture') ? neoNode.temp.thumbUrl : null;

        if (image) {
            node.image = image;
            node.shape = 'image';
        }
        else if (type == "Provenance") {
            node.fontSize = 50;
            node.fontColor = 'lightgray';
            node.color = 'transparent';
        }
        else if (type == "Iconography" || type == "Place") {
            node.shape = 'ellipse';
        }
        else if (type == "Quotation") {

            node.shape = 'box';
            node.color = 'transparent';
            node.label = neoNode.Text;
        }
        else if (type == "User") {
            node.shape = 'star';
            node.size = 20;
        }
        else if (type == "Link") {
            node.label = neoNode.Name;
            node.shape = 'box';
            node.color = 'transparent';
        }
        else {
            node.shape = person ? 'dot' : 'box';
        }

        return node;

    };

    var graphEdgeFromNeoEdge = function (neoEdge) {
        //id, from, to, type, properties

        var type = neoEdge.type;

        var directional =
                   type == "INFLUENCES" ||
                   type == "INSPIRES" ||
                   type == "ANTICIPATES" ||
                   type == "DISCOVERS" ||
                   type == "TEACHES" ||
                   type == "ADMIRES" ||
                   type == "ENCOURAGES" ||
                    type == "PRECURSOR_OF" ||
                    type == "INVENTS";

        var hideEdgeLabel =
            type == "BY" || "INFLUENCES" ||
              type == "INSPIRES" ||
              type == "DEALS_WITH" ||
            type == "PART_OF" ||
            type == "MEMBER_OF" ||
            type == "ASSOCIATED_WITH" ||
            type == "ACTIVE_DURING" ||
            type == "FROM" ||
            type == "DEVELOPS" ||
            type == "LEADS" ||
            type == "FOUNDS" ||
            type == "DEPICTS" ||
            type == "WORKS_IN" ||
            type == "STUDIES" || type == "STUDIES_AT" ||
            type == "TEACHES" || type == "TEACHES_AT"; //displayed in light green

        var hideEdge = type == "FROM";

        var edge = {
            id: neoEdge.id,
            from: neoEdge.startNode,
            to: neoEdge.endNode,
            label: hideEdgeLabel ? null : type.toLowerCase(),
            fontColor: 'lightblue',
            //  width: neoEdge.Weight/2 ,
            color: type == "FROM" ? "#EEEEEE"
                : type == "INFLUENCES" ? 'pink'
                : (type == "TEACHES" || type == "TEACHES_AT") ? 'lightgreen'
                : 'lightblue',
            opacity: hideEdge ? 0 : 1,//type == "INFLUENCES" ? 1 : 0.7,
            style: directional ? 'arrow-center' : 'dash-line',
            type: ['curved'],
            labelAlignment: 'line-center'

        }

        return edge;

    }


    var utils = {

        init: function () {

            utils.refreshTypes();
            utils.refreshPredicates();
            return utils;


        }
        ,
        newView : function (key, type) {
            var view = new View(key, type);
            return view;
        }
        ,
        types: {}
        ,
        Predicate: Predicate
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
        defaultEdgeType : function (fromType, toType) {
            if (toType == "Provenance") {
                return "FROM";
            }
            else if (toType == "Painter") {
                return "INFLUENCES";
            }

            return "ASSOCIATED_WITH";

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
        ,
        graphOptions:   {
            //  configurePhysics:true,
            edges: { widthSelectionMultiplier: 4 }
                ,
            hierarchicalLayout: {
                enabled: false,
                levelSeparation: 10,//make this inversely proportional to number of nodes
                nodeSpacing: 200,
                direction: "UD",//LR
                //    layout: "hubsize"
            }
                ,
            dataManipulation: {
                enabled: true,
                initiallyVisible: true
            }
    ,
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
                }
                ,
                hierarchicalRepulsion: {
                    enabled: false,
                    centralGravity: 0,
                    springLength: 270,
                    springConstant: 0.01,
                    nodeDistance: 300,
                    damping: 0.09
                }
            }
             
                ,
            onDelete: function (data, callback) {
                //   $scope.publish("deleting");
            }
        }
            ,
            //transforms neo graph data object into object containing array of nodes and array of edges renderable by vis network
             toGraphData : function (g) {
                var graphData = {
                    nodes: [],
                    edges: []
                }
                for (var n in g.nodes) {
                    var node = graphNodeFromNeoNode(g.nodes[n])
                    graphData.nodes.push(node);
                }

                for (var r in g.edges) {
                    var edge = graphEdgeFromNeoEdge(g.edges[r]);
                    graphData.edges.push(edge);
                }
                return graphData;
            }
            //mopve to 'state' object
            ,
            tabSettings: {}
            ,
            selectedTab:"Properties"
 
      


    }
    return utils.init();

}]);
