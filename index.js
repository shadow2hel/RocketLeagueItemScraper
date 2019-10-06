const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
let Items = {};

function writeToJSON(object){
    let data = JSON.stringify(object, null, 2);

    fs.writeFile('items.json', data, (err) => {
        if(err) throw err;
        console.log("Data written to file");
    });
}

function loopHtml(itemID){
    setTimeout(request, 500 * itemID, 'https://rocket-league.com/trading?filterItem=' + itemID + '&filterCertification=0&filterPaint=0&filterPlatform=0', function(error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            found = false;
            $(".rlg-trade-display-items").each(function () {
                $(this).each(() => {
                    let foundHtml = $(this).find('a').attr('href').match(/filterItem=[(0-9)]+/g)[0];
                    let foundId = foundHtml.substr(foundHtml.indexOf('=') + 1);
                    let foundName = $(this).find('img').attr('alt');
                    if (!found && itemID === parseInt(foundId)) {
                        console.log(foundId + ": " + foundName);
                        Items[foundName] = foundId;
                        writeToJSON(Items);
                        found = true;

                    }
                });
            });
        }
    });
}

var i;
for(i = 1; i < 3000; i++){
        loopHtml(i);
}

