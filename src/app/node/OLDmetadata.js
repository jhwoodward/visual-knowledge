factories.factory("Metadata", function () {


    var wikiTabs = function (data,page) {

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

            }
            else {

                var images = $("<div></div>");


                $wikiDOM.find(".image").each(function (i, e) {

                    $(e).attr("href", $(e).attr("href").replace("/wiki/", "https://en.wikipedia.org/wiki/" + page.replace(" ", "_") + "#/media/"))
                    .attr("target", "_blank").css({"padding-right": "5px","padding-bottom": "5px"});

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
                $wikiDOM.find("a").each(function () { $(this).replaceWith($(this).html()); })

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

                    $tab = $("<div></div>");
                    $(e).nextUntil("h2").appendTo($tab);
                    if ($tab.html()) {

                        tabs.push({
                            header: $(e).text(),
                            content: $tab.html()
                        });
                    }


                });

                if (images.html()) {

                    //images.find(".image").insertBefore

                    images.find("img").css({ "width": "250px", "marginBottom": "5px" });

                    tabs.push({
                        header: "Images",
                        content: images.html()
                    });
                }











            }




        }

        return tabs;


    }

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


    var getFreebaseTopic = function (freebaseId, filter, callback) {

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



    var runFreebaseQuery = function (q, callback) {

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

            getFreebaseTopic(freebaseId, f.filter, function (result) {

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

    //var getData = function (freebaseId, queries, callback) {

    //    var results = {};
    //    var cnt = 0;


    //    angular.forEach(queries, function (q) {

    //        q.query.id = freebaseId;

    //        runFreebaseQuery(q.query, function (result) {

    //            if (result) {
    //                if (typeof q.propname === 'string') {
    //                    var propname = q.propname;
    //                    if (result[propname]) {

    //                        if (typeof result[propname] === 'string') {
    //                            result[propname] = [{ name: result[propname] }];
    //                        }
    //                        results[propname] = { query: q, results: result[propname] };
    //                    }
    //                }
    //                else {


    //                    angular.forEach(q.propname, function (propname) {

    //                        if (result[propname]) {

    //                            if (typeof result[propname] === 'string') {
    //                                result[propname] = [{ name: result[propname] }];
    //                            }
    //                            results[propname] = { query: q, results: result[propname] };
    //                        }

    //                    });
    //                }
    //            }

    //            cnt += 1;

    //            if (cnt === queries.length) {
    //                callback(results);
    //            }
    //        });
    //    });


    //}


    var getWiki = function (page, callback) {

        $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
                  {
                      page: page,
                      prop: 'text',
                      //prop: 'wikitext',
                      uselang: 'en'
                  },
                  function (data) {
                      console.log(data);
                      var tabs = wikiTabs(data, page);

                      if (tabs.redirect) {

                          getWiki(tabs.redirect, callback);

                      }
                      else {
                          callback(tabs);
                      }


                  }
                 );

    }

    return {

        wikipedia: function (page, callback) {

            getWiki(page, callback);


        }
        ,
        getFreebaseImage: function (freebaseId, width, height, callback) {

            //first get image ids

            getFreebaseTopic(freebaseId, "/common/topic/image", function (prop) {
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
        getFreebaseText: function (node, callback) {

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
                    shortname=shortname.replace(/([A-Z])/g, ' $1')
.replace(/^./, function (str) { return str.toUpperCase(); });
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
                //var stop = response.result.substring(200, response.result.length).indexOf('. ') + 1;

                //callback(response.result.substring(0, 200 + stop));
            });



            //var service_url = 'https://www.googleapis.com/freebase/v1/text/' + freebaseId;
            //$.getJSON(service_url + '?callback=?', function (response) {

            //    if (response && response.result) {

            //        var allowedLength = 150;

            //        var indIs = response.result.indexOf(' is ');
            //        var indWas = response.result.indexOf(' was ');
            //        if (indIs > -1 && (indIs < indWas || indWas == -1)) { indWas = indIs; }
            //        if (indWas === -1) { indWas = 0; };


            //        var stop = response.result.substring(allowedLength + indWas, response.result.length).indexOf('. ') + 1;


            //        console.log(response.result);
            //        console.log(indIs);
            //        console.log(indWas);
            //        console.log(stop);

            //        callback(response.result.substring(indWas, allowedLength + indWas + stop));

            //        //var stop = response.result.substring(200, response.result.length).indexOf('. ') + 1;

            //        //callback(response.result.substring(0, 200 + stop));


            //    }
            //    else {

            //        callback("No text returned for " + freebaseId + "(" +   JSON.stringify(response)+ ")");
            //    }

            //});
        }
        ,
        getFreebaseTopic: function (freebaseId, callback) {

            getFreebaseTopic(freebaseId, callback);

        }
        ,
        getFreebasePersonData: function (freebaseId, callback) {


            getPersonData(freebaseId, callback);

        }
         ,
        getCreationData: function (freebaseId, callback) {

            getData(freebaseId, creationQueries, callback);



        }
        ,
        getFreebaseId: function (node, callback) {

      
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

            

            console.log(params);
            var out = { id: undefined, error: undefined };

            $.getJSON(service_url + '?callback=?', params, function (response) {

                console.log(response);
               
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