controllers.controller('pradoController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {


    var selector = ".buscadorObra";


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


        var linkprefix = "https://www.museodelprado.es";

        //var thumbsrc = linkprefix + el.find(".buscadorImg a img").attr("src");

        var itemHref = linkprefix + "/" + el.find(".buscadorMasInfo a").attr("href");
        //console.log("send message to background page");
        //chrome.runtime.sendMessage({
        //    url: itemHref,
        //    node: $scope.nodeLookup,
        //    scripts: ['lib/jquery.js', 'prado/pradoItem.js']
        //});

        $.ajax({ url: itemHref })
              .done(function (html) {

                  var newNode = captureItem(itemHref, $("<document>" + html + "</document>"));
                  console.log(newNode);

                  var user = { Lookup: 'Julian' }

                  neo.saveNode(newNode, user);

              })
              .fail(function (jqXHR, textStatus, errorThrown) {

                  alert(textStatus);


              });





    }



    function addCaptureButtons() {

        $("<button  type='button'  class='btn captureButton' >Save</button>")
            .appendTo(selector)
            .on("click", function () {
                capture($(this).parent());
            })
    }



    addCaptureButtons();

    var captureItem = function (itemHref,$dom) {

        var linkprefix = "https://www.museodelprado.es";

        var $thumb = $dom.find("#fichaImg a img");

        var newNode = {
            id: -1,
            labels: ["Prado", "Picture", "UnCached", $scope.nodeLookup.Lookup],
            Type: "Picture",
            ImageWidth: $thumb.attr("width"),
            ImageHeight: $thumb.attr("height"),
            ImageThumb: linkprefix + $thumb.attr("src"),
            ImageRef: itemHref,
            ImageSite: "museodelpreado.es",
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
                    //,
                    //"source": {
                    //    predicate: new utils.Predicate("SOURCED_FROM", "out")
                    //        ,
                    //    items: [{
                    //        id: 84256
                    //    }]
                    //},
                }
            }
        }





        $dom.find("#fichaInfo dl").each(function (i, e) {

            var dataItemName = $(e).find("dt").text();
            if (dataItemName == "Inventory number") dataItemName = "PradoID";
            if (dataItemName == "Chronology") dataItemName = "Date";
            if (dataItemName == "Technique") dataItemName = "Medium";
            if (dataItemName == "Author") dataItemName = "Artist";
            console.log(dataItemName)
            var val = $(e).find("dd").text();
            if (dataItemName == "Title" || dataItemName == "PradoID" || dataItemName == "Dimensions" || dataItemName == "Date" || dataItemName == "Medium" || dataItemName == "Artist") {
                newNode[dataItemName] = val;
            }

        });




     //   newNode.ImageUrl = "https://www.museodelprado.es/imagen/alta_resolucion/" + newNode.PradoID + ".jpg";
        newNode.ImageUrl = "https://www.museodelprado.es/uploads/tx_gbobras/" + newNode.PradoID + ".jpg";

        newNode.PradoDescription = $dom.find(".fichaDescripcion").html();

        return newNode;
    }



}]);


$("<div ng-controller='pradoController'> </div>").appendTo('body');
angular.module('prado', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['prado']);
});



chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
      console.log('message received from ' + sender);
      if ("message" in request) {
          console.log("msg: " + request.message)
      }
  });