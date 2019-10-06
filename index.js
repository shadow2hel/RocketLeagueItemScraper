const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
let Items = {};

function writeToJSON(){
    let data = JSON.stringify(Items, null, 2);

    fs.writeFile('items.json', data, (err) => {
        if(err) throw err;
        console.log("Data written to file");
    });
}

function loopHtml(){
    setTimeout(request, 0, 'https://rocket-league.com/trading?filterItem=1000&filterCertification=0&filterPaint=0&filterPlatform=0', function(error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            $('#filterItem').find('option').each(function(i, item){
                console.log($(item).text() + ": " + $(item).attr('value'))
                Items[$(item).text()] = $(item).attr('value');
            })
            writeToJSON();
        }
    });
}

loopHtml();

