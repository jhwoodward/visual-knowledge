controllers.controller('vangoghController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {



    var selector = ".search-results .col-single a";

    var $nodeLookup = $compile("<div style='width:450px;position:fixed;top:20px;left:0px'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' ></typeahead><input type='text' id='extraTags' ng-model='extraTags' placeholder='extra tags' /><button type='button' class='btn'  id='captureAll'>Capture All</button></div>")($scope);
    $nodeLookup.appendTo('body');

    $("#captureAll").on("click", function () {

        $(selector).each(function (i, e) {

            capture($(e));



        })

    })


    var capture = function (el) {
        console.log(el);
        var linkprefix = "http://www.vangoghmuseum.nl";

        var img = el.find("img");

        var labels = ["VanGoghMuseum", "Picture", "UnCached", $scope.nodeLookup.Lookup];
     
        console.log($scope.extraTags)
        if ($scope.extraTags) {
            var arrTags = $scope.extraTags.split(",");
            console.log(arrTags);
            labels = labels.concat(arrTags);

        }
        console.log(labels);

        if (img.length) {
            var title = el.find("h3").text().split(", ")[0];
            var date = el.find("h3").text().split(", ")[1];


            var thumbsrc = img.css("background-image").replace("url(", "").replace(")", "");
            var imgsrc = thumbsrc.split("=")[0] + "=s2700";

            var metadiv = el.find(".grid-item-text");
            var newNode = {
                id: -1,
                labels: labels,
                Type: "Picture",
                ImageWidth: img.attr("data-lazy-image-width"),//nb these are the thumb sizes ! should be sufficient to deduce proportions
                ImageHeight: img.attr("data-lazy-image-height"),
                //ImageSize: data.meta.os,
                ImageUrl: imgsrc,
                ImageRef: linkprefix + el.attr("href"),
                ImageSite: "vangoghmuseum.nl",
                ImageThumb: thumbsrc,
                Title: title,
                Date: date,
                ZoomLink: linkprefix + el.attr("href"),
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

            var user = { Lookup: 'Julian' }

            neo.saveNode(newNode, user);

        }


    }

    function addCaptureButton() {


        $("<button  type='button'  class='btn captureButton' >Capture</button>")
            .insertAfter(selector)
            .on("click", function () {

                capture($(this).parent().find("a"));


            })



    }


    addCaptureButton();




}]);


$("<div ng-controller='vangoghController'> </div>").appendTo('body');
angular.module('vangogh', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['vangogh']);
});



