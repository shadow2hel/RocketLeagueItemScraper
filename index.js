const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
let pages = [];
let Items = {};

function writeToJSON() {
    let data = JSON.stringify(Items, null, 2);

    fs.writeFile('items.json', data, (err) => {
        if (err) throw err;
        console.log("Data written to file");
    });
}

function getAllItems() {
    setTimeout(request, 0, 'https://rocket-league.com/trading?filterItem=1000&filterCertification=0&filterPaint=0&filterPlatform=0', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            $('#filterItem').find('option').each(function (i, item) {
                Items[$(item).text()] = $(item).attr('value');
            });
            writeToJSON();
        }
    });
}

function getTradesForItem(itemID, page) {
    setTimeout(request, 100, 'https://rocket-league.com/trading?filterItem=' + itemID + '&filterCertification=0&filterPaint=0&filterPlatform=0&p=' + page, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let trades = [];
            $('div.rlg-trade-display-container').each((i, item) => {
                let objectItems = {
                    youritems: [],
                    theiritems: [],
                    url: '',
                    notes: ''
                };

                objectItems.url = 'https://rocket-league.com' + $(item).find('div.rlg-trade-display-header a').first().attr('href');
                objectItems.notes = $(item).find('div.rlg-trade-note-area-read p').first().text();

                function getItems(whichitems) {
                    let objectItems = [];
                    $(item).find('#rlg-' + whichitems + 'items').each((j, item2) => {
                        $(item2).find('.rlg-trade-display-item').each((i, item3) => {
                            if ($(item3).find('.rlg-trade-display-item-paint').length > 0) {
                                objectItems[i] = $(item3).find('h2').first().text() + ' (' + $(item3).find('.rlg-trade-display-item-paint').first().attr('data-name') + ")";
                            } else {
                                if ($(item3).find('h2').first().text().toLowerCase() === "key") {
                                    objectItems[i] = $(item3).find('.rlg-trade-display-item__amount.is--premium').text()+ "Key(s)";
                                } else {
                                    objectItems[i] = $(item3).find('h2').first().text();
                                }
                            }
                        });
                    });

                    return objectItems;
                }

                objectItems.youritems = getItems('your');
                objectItems.theiritems = getItems('their');
                trades.push(objectItems);

                if ($('div.rlg-trade-display-container').length - 1 === i) {
                    pages.push(trades);
                }

            });

            for (let i = 0; i < trades.length; i++) {
                let youritemsString = [];
                let theiritemsString = [];
                console.log('Page ' + (pages.length + 1));
                console.log("Trade " + i);
                console.log("Notes: " + trades[i].notes);
                console.log("URL: " + trades[i].url + "\n");
                //console.log("[H] ")
                for (let j = 0; j < trades[i].youritems.length; j++) {
                    youritemsString.push(trades[i].youritems[j]);
                }
                //console.log("\n\tTheir items: \n");
                for (let j = 0; j < trades[i].theiritems.length; j++) {
                    theiritemsString.push(trades[i].theiritems[j]);
                }
                let str1= "[H] " + youritemsString;
                str1 = str1.replace("\n", " ");
                str1=str1.replace("\r", "");

                let str2= "[W] " + theiritemsString;
                str2=str2.replace("\n", "");
                str2=str2.replace("\r", "");

                console.log(str1);
                console.log(str2);
                console.log("\n\n");
            }
        }
    });
}

function getPages(itemID, callback) {
    request('https://rocket-league.com/trading?filterItem=' + itemID + '&filterCertification=0&filterPaint=0&filterPlatform=0', null, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let pageNumber = 1;
            pageNumber = $('a.rlg-trade-pagination-button').get($('a.rlg-trade-pagination-button').length - 2);
            pageNumber = parseInt($(pageNumber).text().trim());
            callback(pageNumber);
        }
    });
}

function docode(itemID) {
    getPages(itemID, function (pageNumber) {
        for (let i = 0; i < pageNumber; i++) {
            let page = i + 1;
            console.log('Page ' + pages.length);
            getTradesForItem(itemID, page);
        }
    })
}

docode(1014);
