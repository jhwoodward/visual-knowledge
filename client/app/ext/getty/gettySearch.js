controllers.controller('gettyController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {




    var $pnl = $compile("<div style='width:450px'><typeahead choice='nodeLookup' style='position:fixed;top:0px;left:0px;width:200px;height:50px' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' style='left:300px'></typeahead><button type='button' class='btn' style='float:right;' id='captureAll'>Capture All</button></div>")($scope);
    $pnl.appendTo('body');

    $("#captureAll").on("click", function () {
        $("#search-results ul li figure").each(function (i, e) {
            capture($(e));
        })

    });


    var capture = function (el) {




        var imgdiv = el.find("a > div");
        if (imgdiv.length) {
            var thumbsrc = imgdiv.css("background-image").replace("url(", "").replace(")", "");
            var imgsrc = thumbsrc.replace("/thumbnail/", "/download/");

            var size = imgdiv.css("background-size");


            var metadiv = el.find(".grid-item-text");
            var newNode = {
                id: -1,
                labels: ["Getty", "Picture", "UnCached", $scope.nodeLookup.Lookup],
                Type: "Picture",
                ImageWidth: size.split(" ")[0].replace("px", ""),
                ImageHeight: size.split(" ")[1].replace("px", ""),
                //ImageSize: data.meta.os,
                ImageUrl: imgsrc,
                ImageRef: el.find("a:first").attr("href"),
                ImageSite: "getty.edu",
                ImageThumb: thumbsrc,
                Title: el.find("figcaption a h5").text(),
                Date: el.find("figcaption p").html().split("<br>")[1].replace('"', ''),
                Status: 9,
                temp: {
                    relProps: {
                        "by": {
                            predicate: new utils.Predicate("BY", "out")
                                ,
                            items: [{
                                id: $scope.nodeLookup.id
                            }]
                        }
                    }
                }
            }

            console.log(newNode);
        }

          var user = { Lookup: 'Julian' }

            neo.saveNode(newNode, user);




    }

    function addCaptureButton() {


        $("<button  type='button'  class='btn captureButton' >Capture</button>")
            .appendTo("#search-results ul li figure")
            .on("click", function () {

                capture($(this).parent());


            })


        $("#search-results ul li figure").addClass("capture");

    }


    addCaptureButton();




}]);


$("<div ng-controller='gettyController'> </div>").appendTo('body');
angular.module('getty', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['getty']);
});



