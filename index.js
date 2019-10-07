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

function getAllItems(){
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

function getRequestedItem(itemID){
    request('https://rocket-league.com/trading?filterItem=' + itemID + '&filterCertification=0&filterPaint=0&filterPlatform=0', null, function(error, response, html){
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let results = [];


            $('div.rlg-trade-display-items').each((i, item) => {
                let objectItems = {
                    youritems: [],
                    theiritems: []
                }
                $(item).find('#rlg-youritems').each((j, item2) => {
                    $(item2).find('.rlg-trade-display-item').each((i, item3) => {
                        objectItems.youritems.push($(item3).find('h2').first().text());
                        console.log($(item3).find('h2').first().text());
                    });
                });
                $(item).find('#rlg-theiritems').first().each((j, item2) => {
                    $(item2).find('.rlg-trade-display-item').each((i, item3) => {
                        objectItems.theiritems.push($(item3).find('h2').first().text());
                        console.log($(item3).find('h2').first().text());
                    });
                });
                results.push(objectItems);
            });

            console.log(results[2].youritems.toString())

            for(let i = 0; i < results.length; i++){
                console.log("Trade " + i + "\n")
                console.log("\tYour items: \n")
                for(let j = 0; j < results[i].youritems.length; j++){
                    console.log("\t\t" + results[i].youritems[j] + "\n");
                }
                console.log("\n\tTheir items: \n");
                for(let j = 0; j < results[i].theiritems.length; j++){
                    console.log("\t\t" + results[i].theiritems[j] + "\n");
                }
            }

            //console.log($('body > main > div > div > div > div:nth-child(5) > div:nth-child(2) > div.rlg-trade-display-items').first().find('#rlg-youritems').first().text());
        }
    })
}

getRequestedItem(1000);
