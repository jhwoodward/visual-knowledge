



document.addEventListener('DOMContentLoaded', function () {

    $('#btn').click(function () {

        chrome.tabs.executeScript(null, { file: "angular.min.js" });
        chrome.tabs.executeScript(null, { file: "jquery.js" });
        chrome.tabs.executeScript(null, { file: "scraper/controller.js" });
        chrome.tabs.executeScript(null, { file: "scraper/scraper.js" });


    });


    var addDependencies = function () {


 chrome.tabs.insertCSS(null, { file: "ext/lib/bootstrap-button.css" });
        chrome.tabs.insertCSS(null, { file: "ext/lib/bootstrap-dropdown.css" });
        chrome.tabs.insertCSS(null, { file: "ext/style.css" });
        chrome.tabs.executeScript(null, { file: "ext/lib/jquery.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/bootstrap.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular.min.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular-resource.min.js" });
        chrome.tabs.executeScript(null, { file: "ext/lib/angular-sanitize.min.js" });
        chrome.tabs.executeScript(null, { file: "modules.js" });
        chrome.tabs.executeScript(null, { file: "filters/filters.js" });
        chrome.tabs.executeScript(null, { file: "factories/neoHelper.js" });
        chrome.tabs.executeScript(null, { file: "factories/utils.js" });
        chrome.tabs.executeScript(null, { file: "factories/neo.js" });
        chrome.tabs.executeScript(null, { file: "directives/typeahead.js" });

    }


    $('#google').click(function () {
        addDependencies();
        chrome.tabs.executeScript(null, { file: "ext/google.js" });
    });

    $('#tate').click(function () {
        addDependencies();
        chrome.tabs.executeScript(null, { file: "ext/tate.js" });
    });

});
