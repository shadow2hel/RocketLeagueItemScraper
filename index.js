const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
let trades = [];
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
                Items[$(item).text()] = $(item).attr('value');
            });
            writeToJSON();
        }
    });
}

function getTradesForItem(itemID){
    request('https://rocket-league.com/trading?filterItem=' + itemID + '&filterCertification=0&filterPaint=0&filterPlatform=0', null, function(error, response, html){
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);


            $('div.rlg-trade-display-items').each((i, item) => {
                let objectItems = {
                    youritems: [],
                    theiritems: []
                };

                function getItems(whichitems){
                    let objectItems = []

                    $(item).find('#rlg-' + whichitems + 'items').each((j, item2) => {
                        $(item2).find('.rlg-trade-display-item').each((i, item3) => {
                            if($(item3).find('.rlg-trade-display-item-paint').length > 0){
                                objectItems[i] = $(item3).find('h2').first().text() + ' (' + $(item3).find('.rlg-trade-display-item-paint').first().attr('data-name') + ")";
                            } else {
                                objectItems[i] = $(item3).find('h2').first().text();
                            }

                            console.log($(item3).find('h2').first().text());
                        });
                    });

                    return objectItems;
                }

                objectItems.youritems = getItems('your');
                objectItems.theiritems = getItems('their');
                trades.push(objectItems);
            });

            for(let i = 0; i < trades.length; i++){
                console.log("Trade " + i + "\n")
                console.log("\tYour items: \n")
                for(let j = 0; j < trades[i].youritems.length; j++){
                    console.log("\t\t" + trades[i].youritems[j] + "\n");
                }
                console.log("\n\tTheir items: \n");
                for(let j = 0; j < trades[i].theiritems.length; j++){
                    console.log("\t\t" + trades[i].theiritems[j] + "\n");
                }
            }
        }
    })
}

getTradesForItem(1000);