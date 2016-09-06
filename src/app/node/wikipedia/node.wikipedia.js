angular.module('neograph.node.wikipedia', ['neograph.neo'])
    .factory('wikiservice', () => {
      const wikiTabs = (data, page) => {
        let tabs = [];
        if (data.parse) {
          const $wikiDOM = $(`<document>${data.parse.text['*']}</document>`);
          // Handle redirects
          if ($wikiDOM.find('ul.redirectText').length > 0) {
            tabs = { redirect: $wikiDOM.find('ul.redirectText li a').attr('title') };
          } else {
            const images = $('<div></div>');
            $wikiDOM.find('.image').each((i, e) => {
              $(e).
                attr('href', $(e).attr('href').
                  replace('/wiki/', `https://en.wikipedia.org/wiki/${page.replace(' ', '_')}#/media/`)).
                attr('target', '_blank').css({ 'padding-right': '5px', 'padding-bottom': '5px' });
            });
            $wikiDOM.find('.image').appendTo(images);
            $wikiDOM.find('p').css({ 'margin-bottom': '4px', 'clear': 'left' });
            $wikiDOM.find('p,.thumb,.thumbinner').css({ 'width': '100%' });
            $wikiDOM.find('h2,h3,h4').css({ 'margin-top': '4px', 'margin-bottom': '2px', 'float': 'left', 'clear': 'left', 'width': '100%', 'overflow': 'hidden' });
            $wikiDOM.find('#toc').remove();
            $wikiDOM.find('.editsection').remove();
            $wikiDOM.find('.magnify').remove();
            $wikiDOM.find('.reflist').remove();
            $wikiDOM.find('img').css({ 'display': 'block', 'float': 'left', 'margin-right': '3px', 'margin-bottom': '3px' });
            $wikiDOM.find('.thumb,.thumbinner').css({ 'float': 'left', 'margin-right': '3px', 'margin-bottom': '3px' });
            $wikiDOM.find('.thumbcaption').css({ 'font-size': '11px' });
            $wikiDOM.find('.plainlinks').remove();
            $wikiDOM.find('#navbox').remove();
            $wikiDOM.find('.rellink').remove();
            $wikiDOM.find('.references').remove();
            $wikiDOM.find('.IPA').remove();
            $wikiDOM.find('sup').remove();
            $wikiDOM.find('dd,blockquote').css({ 'margin': '0px', 'width': '', 'font-size': '11px', 'margin-bottom': '10px', 'margin-top': '7px' });
            $wikiDOM.find('blockquote p').css({ 'font-size': '11px' });
            // NB this has interesting stuff in it
            $wikiDOM.find('.navbox, .vertical-navbox').remove();
            $wikiDOM.find('#persondata').remove();
            $wikiDOM.find('#Footnotes').parent().remove();
            $wikiDOM.find('#References').parent().remove();
            $wikiDOM.find('#Bibliography').parent().remove();
            $wikiDOM.find('.refbegin').remove();
            $wikiDOM.find('.dablink').remove();
            // A bit too radical?
            $wikiDOM.find('small').remove();
            $wikiDOM.find("img[alt='Wikisource-logo.svg'], img[alt='About this sound'], img[alt='Listen']").remove();
            $wikiDOM.find('.mediaContainer').remove();
            // Remove links - (leave external links ?)
            $wikiDOM.find('a').each(() => { $(this).replaceWith($(this).html()); });
            $wikiDOM.find('.gallery').find('p').css({ 'width': '', 'font-size': '11px', 'float': 'left', 'clear': 'left' });
            $wikiDOM.find('.gallery').find('.thumb').css({ 'width': '' });
            $wikiDOM.find('.gallerybox').css('height', '220px');
            $wikiDOM.find('.gallerybox').css('float', 'left');
            $wikiDOM.find('table').css({ 'background': 'none', 'width': '', 'max-width': '', 'color': '' });
            $wikiDOM.find('.gallery').remove();
            $wikiDOM.find('#gallery').parent().remove();
            $wikiDOM.find('#notes').parent().remove();
            $wikiDOM.find('#sources').parent().remove();
            // Radical - remove all tables
            $wikiDOM.find('table').remove();
            $wikiDOM.find('h1,h2,h3,h4').next().css({ 'clear': 'left' });
            $wikiDOM.find('dl').remove();
            $wikiDOM.find('.thumb').remove();
            $wikiDOM.find('ul,.cquote').css({ 'float': 'left', 'clear': 'left' });
            $wikiDOM.find('.infobox, .vcard').remove();
            $wikiDOM.find('.thumbimage').css({ 'max-width': '150px', 'height': 'auto' });
            $wikiDOM.find('.mw-editsection').remove();
            $wikiDOM.html($wikiDOM.html().replace('()', ''));
            $wikiDOM.html($wikiDOM.html().replace('(; ', '('));
            $wikiDOM.find('h2').css({ 'cursor': 'pointer', 'color': 'rgba(0,85,128,1)', 'font-size': '20px' });
            $wikiDOM.find('h3').css({ 'font-size': '18px' });
            $wikiDOM.find('#Gallery').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#See_also').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Notes').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#External_links').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Selected_works').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Sources').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Other_reading').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Further_reading').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Resources').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Further_reading_and_sources').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#List_of_paintings').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Self-portraits').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Selected_paintings').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#References_and_sources').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Partial_list_of_works').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('#Notes_and_references').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('[id^=Selected_works]').parent().nextUntil('h2').andSelf().remove();
            $wikiDOM.find('[id^=Books]').parent().nextUntil('h2').andSelf().remove();

            const $introTab = $('<div></div>');
            $wikiDOM.find('p:first').nextUntil('h2').andSelf().appendTo($introTab);
            if ($introTab.text().indexOf('Redirect') === -1 && $introTab.text().indexOf('may refer to') === -1) {
              $introTab.find('ul').remove();
            }
            if ($introTab.html()) {
              tabs.push({
                header: 'Summary',
                content: $introTab.html().replace('/; /g', '')
              });
            }

            $wikiDOM.find('h2').each((i, e) => {
              const $tab = $('<div></div>');
              $(e).nextUntil('h2').appendTo($tab);
              if ($tab.html()) {
                tabs.push({
                  header: $(e).text(),
                  content: $tab.html()
                });
              }
            });

            if (images.html()) {
              images.find('img').css({ 'width': '250px', 'marginBottom': '5px' });
              tabs.push({
                header: 'Images',
                content: images.html()
              });
            }
          }
        }
        return tabs;
      };

      const getWiki = (page, callback) => {
        $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?',
          {
            page,
            prop: 'text',
            uselang: 'en'
          },
            data => {
              const tabs = wikiTabs(data, page);
              if (tabs.redirect) {
                getWiki(tabs.redirect, callback);
              } else {
                callback(tabs);
              }
            });
      };

      return {
        getPage: (page, callback) => getWiki(page, callback)
      };
    })
    .directive('wikipedia', (wikiservice, neo) => (
      {
        restrict: 'E',
        templateUrl: 'app/node/wikipedia/node.wikipedia.html',
        scope: {
          node: '=',
          window: '=',
          active: '='
        },
        link: ($scope, $element) => {
          $scope.tabs = [];

          $scope.setActiveTab = tab => {
            $scope.activeTab = tab;
          };

          let loaded = false;
          $scope.$watch('node', node => {
            if (node) {
              loaded = false;
              $scope.page = node.Wikipagename || node.Name || node.Title;
            }
          });

          $scope.savePage = () => {
            $scope.node.Wikipagename = $scope.page;
            neo.saveWikipagename($scope.node).then(node => $scope.page = node.Wikipagename);
          };

          const getPage = () => {
            wikiservice.getPage($scope.page, tabs => {
              $scope.tabs = tabs;
              $scope.activeTab = $scope.tabs[0];
              $scope.$digest();
              $($element).find('.wikidropdown').dropdown();
              loaded = true;
            }); };

          $scope.$watch('page', page => {
            if (page && $scope.active) {
              getPage();
            }
            else {
              $scope.tabs = [];
            }
          });

          $scope.$watch('active', active => {
            if ($scope.page && active && !loaded) {
              getPage();
            }
          });
        }
      })
);
