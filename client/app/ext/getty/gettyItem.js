controllers.controller('gettyController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {




    var $pnl = $compile("<div  style='position:fixed;top:0px;left:0px;width:200px;height:50px'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' ></typeahead></div>")($scope);
    $("<button type='button' class='btn'  id='capture'>Save</button>").on("click", function () {capture()}).appendTo($pnl);

    $pnl.appendTo('body');


    $("#capture")


    var capture = function () {



    


        var imgsrc = $("#download-open-content").attr("href").split("?")[1].split("&")[0].replace("dlimgurl=", "");
        var thumbsrc = imgsrc.replace("/download/", "/thumbnail/");


        var newNode = {
            id: -1,
            labels: ["Getty", "Picture", "UnCached", $scope.nodeLookup.Lookup],
            Type: "Picture",
            ImageUrl: imgsrc,
            ImageRef: location.href,
            ImageSite: "getty.edu",
            ImageThumb: thumbsrc,
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

      
 
        $("section.object-details-primary div.clearfix").each(function (i, e) {
       
            var dataItemName = $(e).find("div h6").text().replace(":","");
            console.log(dataItemName)
            var val = $(e).find("div p").text();
            if (dataItemName == "Title" || dataItemName == "Date" || dataItemName ==  "Dimensions" || dataItemName == "Medium") {
                newNode[dataItemName] = val;
            }

        });

        newNode.ImageHeight= newNode.Dimensions.split(" x ")[0];
        newNode.ImageWidth= newNode.Dimensions.split(" x ")[1].split(" cm ")[0];



        console.log(newNode);


        var user = { Lookup: 'Julian' }

        neo.saveNode(newNode, user);




    }






}]);


$("<div ng-controller='gettyController'> </div>").appendTo('body');
angular.module('getty', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['getty']);
});



