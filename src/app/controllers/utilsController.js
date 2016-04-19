

controllers.controller("UtilsController", ['$scope', '$window', 'Neo', 'GraphPresets', 'Metadata', function ($scope, $window, neo, presets, metadata) {


    var getPersonData = function (node, callback) {




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

    }



    var getBlurb = function (node, callback) {


        metadata.getFreebaseText(node, function (blurb) {
  
            $scope.$apply(function () {
                $.extend(node, blurb);
            });

            callback(node);

        });

    }


    var getData = function (node, blurbOnly) {

        getBlurb(node, function (updated) {


            if ($.inArray("Person", updated.labels) > -1 && !blurbOnly) {

                getPersonData(updated, function (updatedPerson) {

                    console.log(updatedPerson);
                    neo.saveProps(updatedPerson)
                     .then(function (nid) {
                         console.log(nid + " saved");
                     });
                });
            }
            else {

                console.log(updated);

                neo.saveProps(updated)
                 .then(function (nid) {

                     console.log(nid + " saved");

                 });
            }

        })

    }

    $scope.fixNames = function () {




        neo.getNodeList(" match (n:Person) where n.Name =~ '(?i).*,.*'")
            .then(function (nodes) {
                console.log(nodes);
                angular.forEach(nodes, function (node) {

                    var names = node.Name.split(",");

                    if (names.length == 2) {



                        var newName = names[1].trim() + " " + names[0].trim();
                        console.log("old name: " + node.Name + ", new name: " + newName);
                        node.Name = newName;

                        neo.saveProps(node)
                              .then(function (nid) {

                                  console.log(nid + " saved");

                              });
                    }
                    else {
                        console.log("ODD NAME: " + node.Name);
                    }

                });

            });

    }

    $scope.importQuery = "match(n:Period) "

    $scope.reselect = function (node, mid,name) {

        node.FreebaseID = mid;
        node.FB_name = name;
        getData(node);


    }

    $scope.clear = function (node) {

        node.FreebaseID = null;
        node.FB_name = null;
        node["FB_blurb"]=null; 
        node["FB_blurb_full"]=null;

        neo.saveProps(node)
                   .then(function (nid) {
                       console.log(nid + " saved");
                   });



    }

    //TODO: REMOVE ALL FB ASSOCIATIONS FOR THE FOLLOWING QUERY
    //match(n:Global)  where n.Status is null
    //THEY ARE UNSAFE
    //DICTIONARY WOULD BE A BETTER SOURCE FOR THOSE

    $scope.importFreebaseData = function () {


        console.log('importing...');
        // -persons - quotes, dates, nationality, fbid
        neo.getNodeList($scope.importQuery)
            .then(function (nodes) {
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
                                console.log('already have freebase id for ' + node.Name + ':' + node.FreebaseID)
                            }
                            else if (result.mid && !node.FreebaseID) {
                                nochange = result.mid == node.FreebaseID;
                                node.FreebaseID = result.mid;
                                console.log('got freebase id:' + result.mid + ' for ' + node.Name)

                            }
                            else {
                                console.log('couldnt get freebase id for ' + node.Name);
                                console.dir(result.response);

                            }

                            if (node.FreebaseID) { //&& !nochange
                                //set freebasename
                                angular.forEach(node.disambiguation, function (n) {
                                    if (n.mid === node.FreebaseID) {
                                        node.FB_name = n.name;
                                    }
                                });
                                getData(node,true);//true = blurb only
                            }


                        })



                    });

                    //  }


                })



            })


        //
        //neo.getNodeList("match(n:Global)", 10);

    }

    $scope.quotesToNodes = function () {

        neo.getNodeList("match (n) where n.FB_quotations is not null")
           .then(function (nodes) {
               angular.forEach(nodes, function (node) {
                   //   console.log(node);
                   angular.forEach(node.FB_quotations, function (quote) {
                       //console.log(quote);
                       var qnode = { id: 0, properties: { Type: 'Quotation', Text: quote, Creator: node.Lookup }, labels: [node.Lookup] };

                       neo.saveNode(qnode).then(function (n) {

                           console.log(n);

                           var edge = { startNode: n.id, endNode: node.id, type: 'BY' }
                           neo.saveEdge(edge, n, node).then(function (e) {
                               console.log(e);
                           });

                       });

                   });

               });

           });


    }


}]);



