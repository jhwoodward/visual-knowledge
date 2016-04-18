controllers.controller('googleController', ['$scope', '$window', '$document','$compile', 'Neo', 'Utils',function ($scope, $window, $document, $compile,neo,utils) {

         console.log('hello from controller');



         var $element = $("body");
         var lastHeight = $element.css('height');

         function checkForChanges() {

             if ($element.css('height') != lastHeight) {

                 addCaptureButton()
                 lastHeight = $element.css('height');
             }

             setTimeout(checkForChanges, 1000);
         }

         var $nodeLookup = $compile("<typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...'></typeahead>")($scope);
         $nodeLookup.insertAfter('#sfdiv');

         $scope.$watch('nodeLookup', function (node) {
            
             //load node ?
             //if (node) {
             //    $(".gsfi").val(node.Lookup);
             //    $(".lsb").click();
             //}

         })
       


         function addCaptureButton() {


             $("<button class='btn captureButton' style='position:relative'>Capture</button>")
                 .insertAfter(".rg_di:not(.capture) a")
                 .on("click", function () {

                     var hrefQueryStringElements = $(this).parent().find("a").attr("href").split('?')[1].split('&');

                     var data = {};
                     $(hrefQueryStringElements).each(function (i, e) {

                         var pair = e.split('=');
                       //  if (pair[0] == "w" || pair[0] == "h" || pair[0] == "imgrefurl" || pair[0] == "imgurl") {
                             data[pair[0]] = pair[1];
                       //  }

                     })

                     data.meta = JSON.parse($(this).parent().find(".rg_meta").text());

                

                     var newNode = {
                         id: -1,
                         labels: ["Picture","UnCached",$scope.nodeLookup.Lookup],
                         Type: "Picture",
                         ImageWidth: data.meta.ow,
                         ImageHeight: data.meta.oh,
                         ImageSize: data.meta.os,
                         ImageUrl: decodeURIComponent(data.imgurl),
                         ImageRef: decodeURIComponent(data.imgrefurl),
                         ImageSite: data.meta.isu,
                         ImageThumb: $(this).parent().find("a img").attr("src"),
                         Text: data.meta.s.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }),
                         Title: data.meta.pt.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); }),
                         ImageDataGoogle: JSON.stringify(data),
                         Status: 9,
                         temp: {
                             relProps: {
                                 "by": {
                                     predicate: new utils.Predicate("BY","out")
                                     ,
                                     items:[{
                                         id: $scope.nodeLookup.id
                                     }]
                                 }
                             }
                         }
                     }

                     console.log(newNode);

                     var user = {Lookup: 'Julian'}

                     neo.saveNode(newNode, user);


                 })


             $(".rg_di").addClass("capture");

         }

     
         addCaptureButton();
         checkForChanges();


      
     }]);


$("<div ng-controller='googleController'> </div>").appendTo('body');
angular.module('google', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['google']);
});



