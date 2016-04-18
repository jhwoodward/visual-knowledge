controllers.controller('olgaController', ['$scope', '$window', '$document', '$compile', 'Neo', 'Utils', function ($scope, $window, $document, $compile, neo, utils) {

    console.log('olga controller startup')
    var $panel = $compile("<div style='position:fixed;top:0px;left:0px;z-index:1000'><button class='btn' ng-click='scrapeExisting()'>Scrap Existing</button></div> ")($scope);
    $panel.appendTo('body');


    var clean = function (txt) {


        if (!txt) return undefined;

        return txt.replace(/\r?\n|\r/g, "").trim();

    }

    var inspectPage = function (url, imgs,surname, done) {

      
        var found = [];

        $.ajax({
            url: url
        })
                .done(function (html) {
                    console.log(url);
                    //  var $dom = $(html);
                    var $dom = $("<document>" + html + "</document>");
             
               //     console.log($dom.html())

                    $(imgs).each(function (j, src) {

                        //     var href = src.replace("http://www.olga.hu", "");
                        //     console.log(href);

                        //     $dom.find("a").each(function (k, l) {
                        //         console.log($(l).attr("href"));
                        //      })
                        // "/B/bonnard/bonnard43.html"  /B/bonnard/bonnard-6.html
                        var urlbits = url.replace("http://www.abcgallery.com/", "").split("/");
                        var testhref = "/" + urlbits[0] + "/" + urlbits[1] + "/" + src.replace(".jpg", ".html").replace(".JPG", ".html").replace("_","-");
                        var selector = "a[href='" + testhref + "']";
                        //      var selector = "img[src='s" + src + "']";

                        console.log(selector);

                        var $itemlink = $dom.find(selector);

                        if ($itemlink.length) {

                            found.push(src);

                            var $tr = $itemlink.closest('tr');

                            var $info = $tr.find("td.table_info");



                            var d;

                            var $a = $($info.find("a")[0]);
                            var page = "http://www.abcgallery.com" + $a.attr("href");
                            var title = $a.find("i b").text().replace(".", "")
                            var metadatabits = $info.remove("a").text().replace(/"/g, "").replace(/\r?\n|\r/g, "").split(". ");

                            var lastitem;
                            $(metadatabits).each(function (i, e) {
                                if (e.indexOf("[Order a Print]") > -1) {
                                    lastitem = i - 1;
                                }
                            })

                            try {

                                d = {
                                    "page": page,
                                    "imageCache": "3/" + surname + "/" + src,
                                    "title": clean(title),
                                    "date": clean(metadatabits[1]),
                                    "type": clean(metadatabits[2]),
                                    "dimensions": lastitem == 4 ? clean(metadatabits[3]) : undefined,
                                    "collection": lastitem == 4 ? clean(metadatabits[4]) : undefined,

                                }


                            }
                            catch (e) {
                                console.log(e);
                                d = {
                                    "page": page,
                                    "imageCache": "3/" + surname + "/" + src,
                                    "title": title,
                                    "metadata": $info.remove("a").text().replace(/"/g, "").replace(/\r?\n|\r/g, "")
                                }
                            }
                            console.log(metadatabits);
                            console.dir(d);

                            neo.saveMetadata(d);




                        }
                        else {
                            //     console.log('not found ' + selector);
                            //  d = {
                            //      "imageCache": "3/" + surname + "/" + src,
                            //      "page": undefined
                            //  }
                            ////  neo.saveMetadata(d);
                        }

                    });

                    done(found);


                })
                .fail(function (jqXHR, textStatus) {
                    console.log(textStatus);
                })




    }

    $scope.scrapeExisting = function () {

        //get list of current index pages
        //   var q = 'match (n:Wga) with n,REPLACE(n.ImageUrl,"/art/","/html/") as htmlpath with htmlpath, split(htmlpath,"/") as bits return distinct(replace(htmlpath,last(bits),"") + "index.html")';

        var q = 'match (n:Olga) where n.ImageRef is null and not n:NoRef  with n ,split(n.ImageCache,"/") as bits return distinct("http://www.abcgallery.com/" + UPPER(SUBSTRING(bits[1],0,1)) + "/" + bits[1] + "/" + bits[1]+".html"),collect(bits[2]),bits[1]';
        q += " limit 1";

        neo.getData(q).then(function (data) {

            $(data).each(function (i, e) {

                var url = e[0];
                var surname = e[2];
                var images = [1];

                //look for links to further pages
                $.ajax({
                    url: url
                })
                 .done(function (html) {
        
                    
                     var $dom = $("<document>" + html + "</document>");

                     var pages = [url];

                     for (i = 2; i < 100; i++) {

                         var testHref = url.replace("http://www.abcgallery.com","").replace(".html", "") + "-" + i + ".html";

                         var $test = $dom.find("a[href='" + testHref + "']");

                         if ($test.length) {
                             pages.push("http://www.abcgallery.com" + testHref);
                         }
                     }
                     console.log(pages);

                     var completedCount = 0;
                     var totalFound = [];
                     $(pages).each(function (i, p) {

                         inspectPage(p, images, surname, function (found) {

                             totalFound.concat(found);
                             completedCount += 1;

                             if (completedCount === pages.length) {

                                 console.log("FINISHED");
                                 var notFound = e[1].diff(totalFound);
                                 console.log(notFound);

                                 $(notFound).each(function (x, nf) {

                                     d = {
                                         "imageCache": "3/" + e[2] + "/" + nf,
                                         "page": undefined
                                     }
                                     neo.saveMetadata(d);


                                 })



                             }

                         });

                     });


                 });

             





            });


       

        });

    }


}]);


$("<div ng-controller='olgaController'> </div>").appendTo('body');
angular.module('olga', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['olga']);
});







