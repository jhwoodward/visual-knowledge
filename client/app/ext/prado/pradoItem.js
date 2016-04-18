controllers.controller('pradoItemController', ['$scope', '$window', '$document', '$compile', function ($scope, $window, $document, $compile) {





    //var $nodeLookup = $compile("<div  style='margin-left:10px'><typeahead choice='nodeLookup' class='nodeSearch' text='nodeLookupText' placeholder='Node Lookup...' required></typeahead><button type='button' class='btn' ng-click='capture()'  id='capture'>Save</button></div>")($scope);
    //$nodeLookup.appendTo('body');

    //variable set by script in calling parent page
    if (nodeLookup) {
        alert(nodeLookup);
        $scope.nodeLookup = nodeLookup;
    }
  

    $scope.capture = function () {

        if (!$scope.nodeLookup) {

            alert("No node selected");
            return;


        }

        var linkprefix = "https://www.museodelprado.es";

        var $thumb = $("#fichaImg a img");

        var newNode = {
            id: -1,
            labels: ["Prado", "Picture", "UnCached", $scope.nodeLookup.Lookup],
            Type: "Picture",
            ImageWidth: $thumb.attr("width"),
            ImageHeight: $thumb.attr("height") ,
            ImageThumb: linkprefix + $thumb.attr("src"),
            ImageRef: location.href,
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

   
     


        $("#fichaInfo dl").each(function (i, e) {

            var dataItemName = $(e).find("dt").text();
            if (dataItemName == "Inventory number") dataItemName = "PradoID";
            if (dataItemName == "Chronology") dataItemName = "Date";
            if (dataItemName == "Technique") dataItemName = "Medium";
            console.log(dataItemName)
            var val = $(e).find("dd").text();
            if (dataItemName == "Title" || dataItemName == "PradoID" || dataItemName == "Dimensions" || dataItemName == "Date" || dataItemName == "Medium") {
                newNode[dataItemName] = val;
            }

        });




        newNode.ImageUrl= "https://www.museodelprado.es/imagen/alta_resolucion/" + newNode.PradoID + ".jpg";


        newNode.PradoDescription = $(".fichaDescripcion").html();


        chrome.runtime.sendMessage({
            captured:newNode
        });


        //console.log(newNode);

        //var user = { Lookup: 'Julian' }

        //neo.saveNode(newNode, user);

    }


    setTimeout($scope.capture, 500);


}]);


$("<div ng-controller='pradoItemController'> </div>").appendTo('body');
angular.module('pradoItem', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['pradoItem']);
});



