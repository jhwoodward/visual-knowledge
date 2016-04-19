angular.module('neograph.node.freebase',['neograph.neo'])
    .factory('freebase.service',
    function(){
        
        
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


    var getTopic = function (freebaseId, filter, callback) {

        var service_url = 'https://www.googleapis.com/freebase/v1/topic';
        var params = {
            'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE',
            'filter': filter
            //  , 'filter': 'suggest'
        }

        $.getJSON(service_url + freebaseId + '?callback=?', params, function (response) {

            callback(response);





        });

    }



    var runQuery = function (q, callback) {

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

    }

    var getPersonData = function (freebaseId, callback) {

        var filters = [];

        filters.push(
            {
                filter: "/visual_art/visual_artist",
                props: [
                    "associated_periods_or_movements"
                ]
            }
            )

        filters.push({
            filter: "/influence/influence_node",
            props: ["influenced",
                "peers,/influence/peer_relationship/peers",
                "influenced_by"
            ]

        })

        filters.push({
            filter: "/people/person",
            props: ["date_of_birth",
                "gender",
                "nationality",
             //   "parents",
                "place_of_birth",
                "places_lived,/people/place_lived/location",
            //    "profession",
             //   "religion",
             //   "sibling_s,/people/sibling_relationship/sibling",
                "quotations"
            ]

        })

        filters.push({
            filter: "/people/deceased_person",
            props: ["date_of_death"
                , "place_of_death"]

        })



        var results = {};
        var cnt = 0;
   

        var out = {};

        angular.forEach(filters, function (f) {

            getTopic(freebaseId, f.filter, function (result) {

                angular.forEach(f.props, function (p) {

                    arr = p.split(',');

                    var propname = f.filter + "/" + arr[0];

                
                    if (!result || !result.property || !result.property[propname])
                    { console.log('property not available: ' + propname); }
                    else {
                           var val = result.property[propname];

                        if (val.valuetype == "compound") {
                            vals = [];
                            angular.forEach(val.values, function (v) {
                                vals.push(v.property[arr[1]].values[0].text);
                            });

                            out["FB_" + arr[0]] = vals;
                        }
                        else {

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


    }

 


    return {

       
        getImage: function (freebaseId, width, height, callback) {

            //first get image ids

            getTopic(freebaseId, "/common/topic/image", function (prop) {
                console.log(prop);
                var imageId = prop.values[0].id;

                var service_url = "https://usercontent.googleapis.com/freebase/v1/image";

                var params = {
                    'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE'
                    //maxwidth=225&maxheight=225&mode=fillcropmid
                }
                width = width || 225;
                height = height || 400;

                callback(service_url + imageId + "?mode=fillcropmid&maxwidth=" + width + "&maxheight=" + height);

                //$.getJSON(service_url + imageId + '?callback=?', params, function (response) {

                //    console.log(response);
                //    callback(response);
                //});


            });

        }
        ,
        getText: function (node, callback) {

            var prop = '/common/topic/description';

            var service_url = 'https://www.googleapis.com/freebase/v1/topic';
            var params = {
                'key': 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE',
                'filter': prop
                //  , 'filter': 'suggest'
            }

            $.getJSON(service_url + node.FB_ID + '?callback=?', params, function (response) {
                //var out = { results: [], error: undefined };
                //if (response.result && response.result[q.propname]) {
                //    out.result = response.result[q.propname];
                //}
                // console.log(response);

                if (!response["property"])
                {
                    console.log('no blurb found for ' + node.Name)
                    callback({});
                }
                else{

                    console.log(response);

                var blurb = response["property"][prop].values[0].value;

                var allowedLength = 20;

                var indIs = blurb.indexOf(' is ');
                var indWas = blurb.indexOf(' was ');
                if (indIs > -1 && (indIs < indWas || indWas == -1)) { indWas = indIs; }
                if (indWas === -1) { indWas = 0; };

                if ($.inArray("Person", node.labels) == -1) {
                    indWas = 0;
                }


                var stopSpc = blurb.substring(allowedLength + indWas, blurb.length).indexOf('. ') + 1;
                var stopCr = blurb.substring(allowedLength + indWas, blurb.length).indexOf('.\n') + 1;

                var stop = (stopCr>0 &&stopCr < stopSpc )? stopCr : stopSpc;

                //console.log(blurb);
                //console.log(indIs);
                //console.log(indWas);
                //console.log(stop);

                var until = stop > 0 ? allowedLength + indWas + stop : blurb.length;


                var shortname = node.Lookup;

                if (shortname.replace(/ /g, '').toLowerCase() == node.Name.toLowerCase()) {
                    shortname = node.name
                }
                else {
                    shortname=shortname.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) { return str.toUpperCase(); });
                }

                  



                var short = (indWas > 0 ? (shortname) : "") + blurb.substring(indWas, until);
                var full = blurb.substring(until, blurb.length);

                if (short != full)
                {
                    callback(
                    {
                        "FB_blurb": short.trim(),
                        "FB_blurb_full": full.trim()
                   
                    });
                }
                else{
                    callback(
                      {
                          "FB_blurb": short.trim(),
                          "FB_blurb_full": null
                    })
                }

    
            }

            });

        }
        ,
        getTopic: function (freebaseId, callback) {

            getTopic(freebaseId, callback);

        }
        ,
        getPersonData: function (freebaseId, callback) {


            getPersonData(freebaseId, callback);

        }
         ,
        getCreationData: function (freebaseId, callback) {

            getData(freebaseId, creationQueries, callback);



        }
        ,
        getId: function (node, callback) {

      
            var API_KEY = 'AIzaSyDKAx-gsd84J-0ebWuGI3QMG2N7daVyqLE';
            var service_url = 'https://www.googleapis.com/freebase/v1/search';

            var ispicture = $.inArray('Picture', node.labels) ;

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

            }
            else if ($.inArray("Group", node.labels) > -1 || $.inArray("Period", node.labels) > -1 ) {

                params.filter = "(any type:/visual_art/art_period_movement type:/architecture/architectural_style  type:/time/event   type:/book/book_subject)";
     
            }
            else if ($.inArray("Provenance", node.labels) > -1) {

            
                params.filter = "(any type:/people/ethnicity type:/location/country )";
              //  params.query = node.Name + " people";
            }
            else if ( ispicture)
            {
                params.domain = "/visual_art";
            }

            var out = { id: undefined, error: undefined };

            $.getJSON(service_url + '?callback=?', params, function (response) {

                $(response.result).each(function (i, e) {


                    if (e.name === node.Name || e.name == node.Wikipagename || e.name.indexOf(node.Name) > -1 || e.name.indexOf(node.Lookup) > -1)
                        {
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
    }
    
        
    })
    .directive('freebase', ['freebase.service', 'neo', function (service, neo) {
    return {
        restrict: 'E',
        templateUrl: 'app/node/freebase/node.freebase.html',
        scope: {
            node: '=',
            active:'='
        },
        link: function ($scope) {

            var getPersonData = function (node, callback) {

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

            }

            var getBlurb = function (node, callback) {


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

            }


            var getData = function (node, blurbOnly) {

                getBlurb(node, function (updated) {

                    if ($.inArray("Person", updated.labels) > -1 && !blurbOnly) {

                        getPersonData(updated, function (updatedPerson) {

                            console.dir(updatedPerson);
                            neo.saveProps(updatedPerson)
                             .then(function (nid) {
                                 console.log(nid + " saved");
                             });
                        });
                    }
                    else {

                        neo.saveProps(updated)
                         .then(function (nid) {
                             console.log(nid + " saved");
                         });
                    }

                })

            }

            $scope.reselect = function (node, mid, name) {

                $scope.clear(node);

                node.FB_ID = mid;
                node.FB_name = name;
                getData(node);


            }

            $scope.clear = function (node) {

                node.FB_ID = null;

                if (node.Text === node.FB_blurb_full) {
                    delete node.Text;
                }

                if (node.Description === node.FB_blurb) {
                    delete node.Description
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

                neo.saveProps(node)
                           .then(function (nid) {
                               console.log(nid + " saved");
                           });

            }
          
            var loaded = false;

            var getFreebase = function () {

                service.getId($scope.node, function (result) {
                   
                    $scope.$apply(function () {
                        $scope.disambiguation = result.response;
                        loaded = true;
                    })

                });
                

            }

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


            })




        }
    }
}])