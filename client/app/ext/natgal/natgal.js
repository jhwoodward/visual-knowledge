controllers.controller('natgalController', ['$scope', '$window', '$document', '$compile', 'Neo','Utils', function ($scope, $window, $document, $compile, neo,utils) {




    var $nodeLookup = $compile("<div ><typeahead choice='nodeLookup' style='position:fixed;top:10px;left:10px' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' ></typeahead></div>")($scope);
    $nodeLookup.appendTo('body');

    $("<button type='button' class='btn'  id='captureAll'>Capture All</button>")
        .appendTo('td.artistName .content .contentInner')
       .on("click", function () {

           capture($(this).closest("tr"));

       })

    var capture = function (tr) {



        var artistname = tr.find("td.artistName .content .contentInner .top .name a").text();
        if (artistname.indexOf(',') > -1) {

            var names = artistname.split(',');
            artistname = names[1].trim() + " " + names[0].trim();

        }
        console.log(artistname);

        neo.getOne("match (n:Painter {Name:'" + artistname + "'})").then(function (node) {

            if (node && node.Lookup) {
                var plist = tr.find("td.paintings ul.paintingList");
                var previewListItems = tr.find("td.preview ul.previewList li");

                console.log(node.Lookup);
                $('.nodeSearch').val(node.Lookup);

                $(plist).find("li").each(function (i, e) {

                    var el = $(e).find("div.content");

                    if (el.length) {

                        var img = $(previewListItems[i]).find(".content a img");
                        var imgsrc = img.attr("src").replace("ft.jpg", "fm.jpg");
                        var newNode = {
                            id: -1,
                            labels: ["Natgal", "Picture", "UnCached", node.Lookup],
                            Type: "Picture",

                            //ImageSize: data.meta.os,

                            ImageRef: $(e).find("div.content").find("a.clickableArrow").attr("href"),
                            ImageSite: "nationalgallery.org.uk",
                            ImageThumb: imgsrc,
                            ImageUrl: imgsrc,
                            ImageWidth: img.attr("width"),//nb these are the thumb sizes ! should be sufficient to deduce proportions
                            ImageHeight: img.attr("height"),
                            Title: $(e).find("div.contentInner .title a").text(),
                            Date: $(e).find("div.contentInner .artistDate").text(),
                            Artist: $(e).find("div.contentInner .artistName").text(),
                            Status: 9,
                            temp: {
                                relProps: {
                                    "by": {
                                        predicate: new utils.Predicate("BY", "out")
                                     ,
                                        items: [{
                                            id: node.id
                                        }]
                                    }
                                }
                            }
                        }

                        console.log(newNode);

                        var user = { Lookup: 'Julian' }

                        neo.saveNode(newNode, user);
                    }



                })

            }
            else {
                alert('couldnt find painter named ' + artistname)
            }


        }).catch(function (e) { alert(e);})




    }

    function addCaptureButton() {


        $("<button  type='button'  class='btn captureButton' style='position:absolute;left:2px;top:2px'>Capture</button>")
            .insertAfter(".art-results .grid-item-image:not(.capture) a")
            .on("click", function () {

                capture($(this).closest(".grid-item-inner"));


            })


        $(".art-results .grid-item-image").addClass("capture");

    }


    addCaptureButton();




}]);


$("<div ng-controller='natgalController'> </div>").appendTo('body');
angular.module('natgal', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['natgal']);
});



