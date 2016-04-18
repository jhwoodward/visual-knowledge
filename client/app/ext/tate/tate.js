controllers.controller('tateController', ['$scope', '$window', '$document','$compile', 'Neo', 'Utils',function ($scope, $window, $document, $compile,neo,utils) {

      


         var $nodeLookup = $compile("<div style='width:450px'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' style='left:300px'></typeahead><button type='button' class='btn' style='float:right;' id='captureAll'>Capture All</button></div>")($scope);
         $nodeLookup.insertAfter('.aa-header');

         $("#captureAll").on("click",function () {

             $(".grid-item-inner").each(function (i, e) {

                 capture($(e));

                

             })

         }).insertAfter($nodeLookup);


         var capture = function (el) {

             var linkprefix = "http://www.tate.org.uk";

             var img = el.find(".grid-item-image a img");

             if (img.length) {

                 var thumbsrc = linkprefix + decodeURIComponent(img.attr("src"));
                 var imgsrc = thumbsrc.replace("_8.jpg", "_10.jpg");

                 var metadiv = el.find(".grid-item-text");
                 var newNode = {
                     id: -1,
                     labels: ["Tate", "Picture", "UnCached", $scope.nodeLookup.Lookup],
                     Type: "Picture",
                     ImageWidth: img.attr("width"),//nb these are the thumb sizes ! should be sufficient to deduce proportions
                     ImageHeight: img.attr("height"),
                     //ImageSize: data.meta.os,
                     ImageUrl: imgsrc,
                     ImageRef: linkprefix + decodeURIComponent(el.find(".grid-item-image a").attr("href")),
                     ImageSite: "tate.org.uk",
                     ImageThumb: thumbsrc,
                     Title: metadiv.find(".title").text(),
                     Description: img.attr("alt"),
                     Date: metadiv.find(".dates").text(),
                     TateID: metadiv.find(".acno").text(),
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


             $("<button  type='button'  class='btn captureButton' style='position:absolute;left:2px;top:2px'>Capture</button>")
                 .insertAfter(".art-results .grid-item-image:not(.capture) a")
                 .on("click", function () {

                     capture($(this).closest(".grid-item-inner"));
               

                 })


             $(".art-results .grid-item-image").addClass("capture");

         }

     
         addCaptureButton();
      


      
     }]);


$("<div ng-controller='tateController'> </div>").appendTo('body');
angular.module('tate', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['tate']);
});



