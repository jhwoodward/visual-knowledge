controllers.controller('albertinaController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {


    var selector = ".entry_liste";


    var $nodeLookup = $compile("<div  style='position:fixed;top:10px;left:10px;'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' required></typeahead><button type='button' class='btn'  id='captureAll'>Save All</button></div>")($scope);
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

    

        var newNode = {
            id: -1,
            labels: ["Albertina", "Picture", "UnCached", $scope.nodeLookup.Lookup],
            Type: "Picture",
            //ImageWidth: $thumb.attr("width"),
            //ImageHeight: $thumb.attr("height"),
            ImageSite: "sammlungenonline.albertina.at",
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

        el.find("table tbody tr td:nth-child(3) table tbody tr").each(function (i, e) {

            var dataItemName = $(e).find(".table_title").text().replace(":","");

            if (dataItemName == "Inventory number") dataItemName = "AlbertinaID";
            if (dataItemName == "Chronology") dataItemName = "Date";
            if (dataItemName == "Technique") dataItemName = "Medium";
            if (dataItemName == "Author") dataItemName = "Artist";
            console.log(dataItemName)
            var val = $($(e).find("td")[1]).text();
            if (dataItemName == "Title" || dataItemName == "AlbertinaID" || dataItemName == "Dimensions" || dataItemName == "Date" || dataItemName == "Medium" || dataItemName == "Artist") {
                newNode[dataItemName] = val;
            }

        });

        newNode.ImageThumb = "http://sammlungenonline.albertina.at/cc/imageproxy.aspx?server=localhost&port=15001&filename=images/" + newNode.AlbertinaID.replace("/", "_")  + ".jpg&width=236&quality=95";
        newNode.ImageUrl = "http://sammlungenonline.albertina.at/imageproxy.aspx?server=localhost&port=15001&filename=images/" + newNode.AlbertinaID.replace("/", "_") + ".jpg";

   
        newNode.ImageRef = "http://sammlungenonline.albertina.at/?query=Inventarnummer=[" + newNode.AlbertinaID + "]&showtype=record";
     

        console.log(newNode);

        var user = { Lookup: 'Julian' }

        neo.saveNode(newNode, user);





    }



    function addCaptureButtons() {

        $("<button  type='button'  class='btn captureButton' >Save</button>")
            .appendTo(selector + ":not(.capture)")
            .on("click", function () {
                capture($(this).parent());
            });

        $(selector).addClass("capture");
    }



    addCaptureButtons();


    setInterval(addCaptureButtons, 1000);



}]);


$("<div ng-controller='albertinaController'> </div>").appendTo('body');
angular.module('albertina', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['albertina']);
});



chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
      console.log('message received from ' + sender);
      if ("message" in request) {
          console.log("msg: " + request.message)
      }
  });