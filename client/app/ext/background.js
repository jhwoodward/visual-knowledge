// Add listener for message events from the injected spider code.
chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

        chrome.runtime.sendMessage({
            message: "received request "
        });
    
        if ('url' in request) {
      
            chrome.runtime.sendMessage({
               message:"received url " + request.url
            });
            alert('loading page ajax');
            $.ajax({ url: request.url })
                .done(function (page) {
                    alert('got page');
                    chrome.runtime.sendMessage({
                        message: "page loaded, opening tab..."
                    });

                    chrome.tabs.create({
                        url: request.url,
                        selected: false
                    }, function (tab) {
                        console.log('tab created callback');
                        console.log(tab);
                        //find a way to tell child tag what the artist node is
                        chrome.tabs.executeScript(tab.id, "var nodeLookup='" + request.node + "'");

                        $(request.scripts).each(function (i, e) {
                            console.log('injecting script ' + e)
                            chrome.tabs.executeScript(tab.id, {
                                file: e
                            });

                        })
                    });

                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                    alert('failed');
                    chrome.runtime.sendMessage({
                        message: "page failed: " + textStatus
                    });



                });



        }

        if ('captured' in request) {

            console.log(request.captured)


        }

        //if ('links' in request) {
        //    spiderInjectCallback(request.links, request.inline, request.scripts, request.painting, request.url);
        //}
        //if ('stop' in request) {
        //    if (started) {
        //        if (request.stop == "Stopping") {
        //            setStatus("Stopped");
        //            chrome.tabs.sendMessage(resultsTab.id, {
        //                method: "getElementById",
        //                id: "stopSpider",
        //                action: "setValue",
        //                value: "Stopped"
        //            });
        //            popupStop();
        //        }
        //    }
        //}
        //if ('pause' in request) {
        //    if (request.pause == "Resume" && started && !paused) {
        //        paused = true;
        //    }
        //    if (request.pause == "Pause" && started && paused) {
        //        paused = false;
        //        spiderPage();

        //    }
        //}

    });