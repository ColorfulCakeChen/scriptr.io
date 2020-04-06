var crypto = require("modules/crypto/sjcl.js"); // Stanford Javascript Crypto Library (https://github.com/bitwiseshiftleft/sjcl/)
var http = require("http");

var API_ROOT = "https://max-api.maicoin.com";

var API_PATH_TICKERS =          "/api/v2/tickers";
var API_PATH_MEMBERS_ACCOUNTS = "/api/v2/members/accounts";



/** Issue http request with digested body.
 * @param {string} method     The http request method. e.g. "GET"
 * @param {Object} body       The http request body.
 * @param {string} secret_key The key to digest the body.
 * @param {string} access_key The value used in http request header X-MAX-ACCESSKEY.
 * @return {Object} The response.body, if success. Return null, otherwise.
 */
function HMAC_SHA256_HTTP_Request( method, body, secret_key, access_key ) {
    var payload = btoa(JSON.stringify(body)); // to Base64.

    var hmac = new crypto.sjcl.misc.hmac(secret_key, crypto.sjcl.hash.sha256);
    hmac.update(payload);
    var digestNumberArray = hmac.digest();
//    return digestNumberArray;

    // Convert number array to unsigned integer, and then convert to HEX, and then concate to one string.
    var signature = (digestNumberArray.map(function (x) { return (x>>>0).toString(16); })).join("");
//    return signature;

    var requestObject = {
        url: API_ROOT + body.path,
//      "params" : {
//      },
        method: method,
        headers: {
            'X-MAX-ACCESSKEY': access_key,
            'X-MAX-PAYLOAD': payload,
            'X-MAX-SIGNATURE': signature
        },
        bodyString: JSON.stringify(body)
    };

    var response = http.request(requestObject);
    return response;
    if (response.status !== "200")
        return;

    var responseBody = JSON.parse(response.body);
    return responseBody;
/*
    try {
        var hmacKey = "1234";
        var hmac = new crypto.sjcl.misc.hmac(hmacKey, crypto.sjcl.hash.sha256);
        hmac.update("Hello");
        var t = hmac.digest();
        return t;
    } catch (e) {
        return e;
    }
*/
/*
    let payload = new Buffer(JSON.stringify(body)).toString('base64');
    let signature = crypto.createHmac('sha256', secret_key).update(payload).digest('hex');
    let options = {
      method: 'GET',
    //  headers: {
    //    'X-MAX-ACCESSKEY': access_key,
    //    'X-MAX-PAYLOAD': payload,
    //    'X-MAX-SIGNATURE': signature
      },
      uri: apiPath + bodyGetTickersBTCTWD.path,
      json: true,
      body: bodyGetTickersBTCTWD
    };
    request(options, function(error, response, body) { ... });
*/
}

/** Get the current state of the specified market.
 * @param path_market e.g. "btctwd"
 */
function tickers_PathMarket_get( path_market ) {
    var body = {
      path: API_PATH_TICKERS + "/" + path_market,
      nonce: Date.now()
    };

    var requestObject = {
        url: API_ROOT + body.path,
    //    "params" : {
    //    },
        method: "GET",
        bodyString: JSON.stringify(body)
    };

    var response = http.request(requestObject);
    //return response;
    if (response.status !== "200")
        return;

    var responseBody = JSON.parse(response.body);
    return responseBody;
}

/** Get the current state of the BTCTWD market.
 */
function tickers_BTCTWD_get() {
	var path_market = "btctwd";
    return tickers_PathMarket_get( path_market );
}

/** Get the current balance of the specified currency.
 * @param path_currency e.g. "twd", or "btc"
 */
function membersAccountsCurrency_PathCurrency_get( path_currency ) {
	var method = "GET";

    var body = {
      path: API_PATH_MEMBERS_ACCOUNTS + "/" + path_currency,
      nonce: Date.now()
    };

    var secret_key = "1234";
    var access_key = "5678";

    var responseBody = HMAC_SHA256_HTTP_Request( method, body,	secret_key, access_key );
    return responseBody;
}

/** Get the current balance of the TWD currency.
 */
function membersAccountsCurrency_TWD_get() {
    return membersAccountsCurrency_PathCurrency_get( "twd" );
}
