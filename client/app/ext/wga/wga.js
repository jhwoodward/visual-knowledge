controllers.controller('wgaController', ['$scope', '$window', '$document','$compile', 'Neo', 'Utils',function ($scope, $window, $document, $compile,neo,utils) {

      console.log('wga controller startup')
    var $panel = $compile("<div style='position:fixed;top:0px;left:0px;z-index:1000'><button class='btn' ng-click='scrapeExisting()'>Scrap Existing</button></div> ")($scope);
    $panel.appendTo('body');


    var clean = function (txt) {
        if (!txt) return undefined;
        return txt.replace(/\r?\n|\r/g, "").trim();
    }

    $scope.scrapeExisting = function () {

        //get list of current index pages
     //   var q = 'match (n:Wga) with n,REPLACE(n.ImageUrl,"/art/","/html/") as htmlpath with htmlpath, split(htmlpath,"/") as bits return distinct(replace(htmlpath,last(bits),"") + "index.html")';

        var q = 'match (n:Wga) where n.ImageRef is null and not n:NoRef with n,REPLACE(n.ImageUrl,"/art/","/html/") as htmlpath with htmlpath, split(htmlpath,"/") as bits,n return distinct(replace(htmlpath,last(bits),"") + "index.html"),collect(n.ImageUrl)';
        q += " limit 500";

        neo.getData(q).then(function (data) {

            $(data).each(function (i, e) {

                var url = e[0];
                $.ajax({
                    url: url
                })
                .done(function (html) {
                  //  var $dom = $(html);
                    var $dom = $("<document>" + html + "</document>");
                 //   console.log(html);
                    var imgs = e[1];
                 //   console.log(url);
                //    console.log($dom.html());
                    $(imgs).each(function (j, imgurl) {

                        var href = imgurl.replace("http://www.wga.hu", "");
                        //     console.log(href);
                    
                   //     $dom.find("a").each(function (k, l) {
                   //         console.log($(l).attr("href"));
                  //      })

                        var selector = "a[href='" + href + "']";
                        var $a = $dom.find(selector);

                        if ($a.length) {
                           
                            var $tr = $a.closest('tr');
                        //    console.log($tr.html());
                            var metadatabits = $($tr.find('td')[1]).html().split('<br>');

                            var itempageurl;
                            var expectItempage = href.split('/')[href.split('/').length - 1].replace(".jpg", ".html");
                        //    console.log(expectItempage);
                            var $aitempage = $($tr.find('td')[3]).find("a[href='" + expectItempage + "']");
                            if ($aitempage.length) {
                                itempageurl = "http://www.wga.hu" + href.replace(".jpg", ".html").replace("/art/", "/html/");
                            }
                            if (!itempageurl) {
                                itempageurl = url;
                            }

                            var d;

                            try {

                                d = {
                                    "imageUrl": imgurl,
                                    "title": clean(metadatabits[0].replace("<b>", "").replace("</b>", "")),
                                    "date": clean(metadatabits[1]),
                                    "type": clean(metadatabits[2].split(",")[0]),
                                    "dimensions": clean(metadatabits[2].split(",")[1]),
                                    "collection": clean(metadatabits[3]),
                                    "page": itempageurl
                                }


                            }
                            catch (e)
                            {
                                d = {
                                    "imageUrl": imgurl,
                                    "metadata": $($tr.find('td')[1]).text().replace(/\r?\n|\r/, ""),//get rid of first linebreak only
                                    "page": itempageurl
                                }
                            }

                        

                            neo.saveMetadata(d);
                         

                        
                        }
                        else {
                            console.log('not found ' + selector);
                            d = {
                                "imageUrl": imgurl,
                                "page":undefined
                            }
                            neo.saveMetadata(d);
                        }

                    })

                   
                })
                .fail(function (jqXHR, textStatus) {
                    console.log(textStatus);
                })
                

              

            });


            console.log(data);

        });

    }

      
}]);
console.log('wga ')

$("<div ng-controller='wgaController'> </div>").appendTo('body');
angular.module('wga', ['controllers', 'directives']);
angular.element(document).ready(function () {
    angular.bootstrap(document, ['wga']);
});







