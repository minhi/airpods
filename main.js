var https = require('https');
var notifier = require('node-notifier/notifiers/balloon')();
var colors = require('colors');
var config = require('./config.js');

// Start the whole main loop
getAirPodsLoop();

function getAirPodsLoop() {
    https.get('https://www.apple.com/de/shop/retail/pickup-message?parts.0=MMEF2ZM%2FA&' + config.store, function (res) {
        var data = '';
        
        res.on('data', function (chunk) {
            data += chunk;
        });

        // parse, check and output
        res.on('end', function () {
            var json = JSON.parse(data);
            if (json.head.status == '200') {
                var available = getAllAirpodsAvailable(json.body.stores);
                if (available.length > 0) {
                    var str = '=================== AIRPODS FOUND ===================\n' +
                        available;
                    log(str.green);
                    notify('Airpods are available');
                } else {
                    log('meh'.yellow);
                }
            }

        });
    });

    setTimeout(getAirPodsLoop, 5000);
}

/**
 * Returns a list of stores where AirPods are available.
 * @param {Object[]} list - Array of Apple store objects in REST format.
 * @returns {string[]} list of Apple Store names where AirPods are currently available.
 */
function getAllAirpodsAvailable(list) {

    // step 1: get all stores where AirPods are available right now
    var filteredList = list.filter(function (store) {
        var availability = store.partsAvailability[config.code];
        return availability.storePickupQuote.toLowerCase().includes(config.trigger) 
            || availability.pickupSearchQuote.toLowerCase().includes(config.trigger);
    });


    // step 2: format the list
    var res = [];
    if (filteredList.length > 0) {
        res = filteredList.map(function (store) {
            return store.storeName + ' | ' + store.partsAvailability[config.code].storePickupQuote;
        });
    }

    return res;
}

function notify(text) {
    notifier.notify({
        title: 'AirPods',
        message: text,
        sound: true
    });
}

function log(text) {
    console.log('[' + new Date().toISOString() + '] ' + text.toString());
}