controllers.controller('artsyController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {

  



    var $nodeLookup = $compile("<div  style='margin-left:10px'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' required></typeahead><button type='button' class='btn' style='float:right;' id='captureAll'>Save All</button></div>")($scope);
    $nodeLookup.appendTo('.avant-garde-header-center');

    $("#captureAll").on("click", function () {

        $(".capture").each(function (i, e) {

            capture($(e));

        })

    })

    $("#addCaptureButtons").on("click",addCaptureButtons)
 
    //https://www.artsy.net/artist/*"

    var capture = function (el) {

        if (!$scope.nodeLookup) {

            alert("No node selected");
            return;


        }


        var linkprefix = "http://www.artsy.net";

        var img = el.find(".artwork-item-image img");

        if (img.length) {

            var thumbsrc = img.attr("src");
            var imgsrc = thumbsrc.replace("tall.jpg", "larger.jpg").replace("medium.jpg", "larger.jpg");

        
           

            //<figcaption class="artwork-item-caption">
            // <p class="artwork-item-artist artwork-item-overflow">
            // <a href="/artist/alex-katz" class="faux-underline-hover">Alex Katz</a></p>
            // <p class="artwork-item-title artwork-item-overflow"><em>Blue Flags</em>, 2014</p>
            // <p class="artwork-item-partner artwork-item-overflow"><a href="/galerie-fluegel-roncak" class="faux-underline-hover">Galerie Fluegel-Roncak</a></p>
            // </figcaption>

            var $titlecopy = el.find(".artwork-item-title").clone();
            $titlecopy.find("em").remove();
            var date = $titlecopy.text().replace("\"", "").replace(",", "");
            if (date) {
                date = date.trim();
            }

            var metadiv = el.find(".artwork-item-caption");

            var imageref = linkprefix + el.find("a.artwork-item-image-link").attr("href")
            var newNode = {
                id: -1,
                labels: ["Artsy", "Picture", "UnCached", $scope.nodeLookup.Lookup],
                Type: "Picture",
                ImageWidth: img.width(),//nb these are the thumb sizes ! should be sufficient to deduce proportions
                ImageHeight: img.height(),
                //ImageSize: data.meta.os,
                ImageUrl: imgsrc,
                ImageRef: imageref,
                ImageSite: "artsy.net",
                ImageThumb: thumbsrc,
                Title: el.find(".artwork-item-title em").text(),
                Description: img.attr("alt"),
                Date: date,
                Gallery : el.find(".artwork-item-partner a").text(),
                GalleryRef: linkprefix + el.find(".artwork-item-partner a").attr("href"),
                ArtistRef: linkprefix + el.find(".artwork-item-artist a").attr("href"),
                Status: 9,
                ImageZoomLink: imageref + "/zoom",
                temp: {
                    relProps: {
                        "by": {
                            predicate: new utils.Predicate("BY", "out")
                                ,
                            items: [{
                                id: $scope.nodeLookup.id
                            }]
                        },
                        "source": {
                            predicate: new utils.Predicate("SOURCED_FROM", "out")
                                ,
                            items: [{
                                id: 84256
                            }]
                        },
                    }
                }
            }

            console.log(newNode);

            var user = { Lookup: 'Julian' }

            neo.saveNode(newNode, user);

        }


    }

    function addCaptureButtons() {
      //  console.log('add capture buttons');

        var containers = $(".artwork-section__artworks .artwork-column figure.artwork-item:not(.capture)");
     //   console.log(containers.length);
        $("<button  type='button'  class='btn captureButton' style='position:relative;left:2px;top:2px'>Save</button>")
            .appendTo(containers)
            .on("click", function () {

                capture($(this).parent());

              

            })

        containers.addClass("capture");

        $("#artwork-see-more").click();
      

    }



    setInterval(addCaptureButtons, 1000);


}]);


$("<div ng-controller='artsyController'> </div>").appendTo('body');
angular.module('artsy', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['artsy']);
});



