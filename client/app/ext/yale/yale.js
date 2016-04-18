controllers.controller('yaleController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {


    var selector = ".gridRecordBox";


    var $nodeLookup = $compile("<div  style='position:fixed;top:10px;left:10px;z-index:2000'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' required></typeahead><button type='button' class='btn'  id='captureAll'>Save All</button></div>")($scope);
    $nodeLookup.appendTo('body');

    $("#captureAll").on("click", function () {

        $(selector).each(function (i, e) {

            capture($(e));

        })

    })



    var capture = function (el) {

        if (!$scope.nodeLookup) {

            alert("No node selected");
            return;


        }

    
        var thumbsrc = el.find(".gridImageBox a img").attr("src");
        if (thumbsrc.indexOf('noCover3.gif') == -1) {

            var newNode = {
                id: -1,
                labels: ["YalePaulMellon", "Picture", "UnCached", $scope.nodeLookup.Lookup],
                Type: "Picture",
                //ImageWidth: $thumb.attr("width"),
                //ImageHeight: $thumb.attr("height"),
                ImageSite: "collections.britishart.yale.edu",
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

            el.find(".gridTitleBox .resultItem").comments().each(function (i, e) {

                if ($(e).html().indexOf('div class="resultItemLine3"&gt;') > -1) {

                    newNode.Date = $(e).html().replace('div class="resultItemLine3"&gt;', "").replace(/\r?\n|\r/g, "").trim();
                }

                if ($(e).html().indexOf('div class="resultItemLine5"&gt;') > -1) {

                    newNode.Dimensions = $(e).html().replace('div class="resultItemLine5"&gt;', "").replace(/\r?\n|\r/g, "").trim();
                }
                if ($(e).html().indexOf('div class="resultItemLine6"&gt;') > -1) {

                    newNode.Collection = $(e).html().replace('div class="resultItemLine6"&gt;', "").replace(/\r?\n|\r/g, "").trim();
                }


            });



            el.find(".gridTitleBox .resultItem div").each(function (i, e) {

                if ($(e).hasClass("type")) {
                    
                    var types = $(e).text().trim().split(" & ");
                    var ts = [];
                    $(types).each(function (i, e) {

                        var t = e.split("-");

                        ts = ts.concat(t);

                    });
                    newNode.labels = newNode.labels.concat(ts);

                }
                if ($(e).hasClass("resultItemLine1")) {
                    newNode.Title = $(e).text().replace(/\r?\n|\r/g, "").trim();
                }
                if ($(e).hasClass("resultItemLine2")) {
                    newNode.Artist = $(e).text().replace(/\r?\n|\r/g, "").trim();
                }

                if ($(e).hasClass("resultItemLine4")) {
                    newNode.Medium = $(e).text().replace(/\r?\n|\r/g, "").trim();
                }



            });



            newNode.ImageThumb = thumbsrc;
            newNode.ImageUrl = thumbsrc.replace("format/1", "format/3");

            newNode.ImageRef = el.find(".gridImageBox a").attr("href");


            console.log(newNode);

            var user = { Lookup: 'Julian' }

            neo.saveNode(newNode, user);

        }



    }



    function addCaptureButtons() {

        $("<button  type='button'  class='btn captureButton' style='position:relative;top:0px;left:0px' >Save</button>")
            .insertBefore(selector)
            .on("click", function () {
                capture($(this).parent());
            });

        $(selector).addClass("capture");
    }



    addCaptureButtons();


   // setInterval(addCaptureButtons, 1000);



}]);


$("<div ng-controller='yaleController'> </div>").appendTo('body');
angular.module('yale', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['yale']);
});



chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
      console.log('message received from ' + sender);
      if ("message" in request) {
          console.log("msg: " + request.message)
      }
  });