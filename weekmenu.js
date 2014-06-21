/**
 * Created by ruben on 20.06.14.
 */

var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var whitelist = [
  'middelheim',
  'groenenborger',
  'drie eiken'
];

var baseURL = 'https://www.uantwerpen.be';
var result = [];
// assume this is in /scripts
var file = '../default/files/scrapy/menulinks.json';
var menuDir = 'weekmenus'

fs.mkdir(menuDir, function(err) {
   // meh
});

request('https://www.uantwerpen.be/nl/campusleven/eten/studentenrestaurants/weekmenu-s-/#', function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      $('.contents p').each(function(i, el) {
        strong = $(el).find('strong');
        if (strong && _.reduce(whitelist, function(res, word) { return res || strong.text().toLowerCase().match(word);}, false)) {
          title = strong.text();
          $(el).next().each(function(i, el) {
            href = $(el).find('a').attr('href');
            result.push({
              name: title,
              url: href
            });
            var thathref = href;
            var req = request(baseURL + thathref);
            req.on('response', function(res) {
                console.log('writing to ' + menuDir + path.sep + path.basename(thathref));
                res.pipe(fs.createWriteStream(menuDir + path.sep + path.basename(thathref)));
            });
          });
        }
      });
    } else {
      console.log('Something went terribly wrong with loading the page.');
    }
  console.log(result);
  fs.writeFile(file, result, {}, function() {
     // finished
  });
});
