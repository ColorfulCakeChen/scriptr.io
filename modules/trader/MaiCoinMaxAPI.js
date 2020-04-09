var crypto = require("modules/crypto/sjcl.js"); // Stanford Javascript Crypto Library (https://github.com/bitwiseshiftleft/sjcl/)
var defaultStoreDocuments = require("document");
var http = require("http");

var METHOD_GET = "GET";

var API_ROOT = "https://max-api.maicoin.com";

var API_PATH_TICKERS =          "/api/v2/tickers";
var API_PATH_MEMBERS_ACCOUNTS = "/api/v2/members/accounts";

/** Get keys from data store.
 * @return {Object} the a_key and s_key.
 */
function A_S_Key_get_FromStore() {
	var theStore = defaultStoreDocuments.getInstance("MaiCoinMAXStore");
    var filter = {
//        query: "ABC",
//    	fields: "t_key"
    	fields: "a_key, s_key"
    };
    var queryReturn = theStore.query(filter);
//    if (queryReturn.metadata.status !== "success")
//        return;
    if (!queryReturn.result)
        return;

    if (!queryReturn.result.documents)
        return;

    var theDocument = queryReturn.result.documents[0];
    if (!theDocument)
        return;

    var keys = {
    	a_key: theDocument.a_key,
    	s_key: theDocument.s_key
//    	t_key: theDocument.t_key
    };
    return keys;
}

/** Issue http request with digested body.
 * @param {string} method     The http request method. e.g. "GET"
 * @param {Object} body       The http request body.
 * @param {string} keys.s_key The key (secret_key) to digest the body.
 * @param {string} keys.a_key The access_key used in http request header X-MAX-ACCESSKEY.
 * @return {Object} The response.body, if success. Return null, otherwise.
 */
function HMAC_SHA256_HTTP_Request( method, body, keys ) {

    var requestObject = {
        url: API_ROOT + body.path,
//      "params" : {
//      },
        method: method,
        bodyString: JSON.stringify(body)
    };

    // If there are keys, sign it.
    if (keys && keys.s_key && keys.a_key) {
        var payload = btoa(requestObject.bodyString); // to Base64.
        //return payload;

        var hmac = new crypto.sjcl.misc.hmac(keys.s_key, crypto.sjcl.hash.sha256);
        hmac.update(payload);
        var digestNumberArray = hmac.digest();
        //return digestNumberArray;

        // Convert number array to unsigned integer, and then convert to HEX, and then concate to one string.
        var signature = (digestNumberArray.map(function (x) { return (x>>>0).toString(16); })).join("");
        //return signature;

    	requestObject.headers = {
            'X-MAX-ACCESSKEY': keys.a_key,
            'X-MAX-PAYLOAD': payload,
            'X-MAX-SIGNATURE': signature
        };
    }

    var response = http.request(requestObject);
    //return response;
    return response.body;
/*
    if (response.status !== "200")
        return;

    var responseBody = JSON.parse(response.body);
    return responseBody;
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
    var responseBody = HMAC_SHA256_HTTP_Request( METHOD_GET, body );
    return responseBody;
}

/** Get the current state of the BTCTWD market.
 */
function tickers_BTCTWD_get() {
	var path_market = "btctwd";
    return tickers_PathMarket_get( path_market );
}

/** Get the current balance of all currency.
 */
function membersAccounts_get() {
    var body = {
      path: API_PATH_MEMBERS_ACCOUNTS,
      nonce: Date.now()
    };
    var keys = A_S_Key_get_FromStore();
    var responseBody = HMAC_SHA256_HTTP_Request( METHOD_GET, body, keys );
    return responseBody;
}

/** Get the current balance of the specified currency.
 * @param path_currency e.g. "twd", or "btc"
 */
function membersAccounts_PathCurrency_get( path_currency ) {
    var body = {
      path: API_PATH_MEMBERS_ACCOUNTS + "/" + path_currency,
      nonce: Date.now()
    };

    //var secret_key = "1234";
    //var access_key = "5678";
    var keys = A_S_Key_get_FromStore();

    var responseBody = HMAC_SHA256_HTTP_Request( METHOD_GET, body, keys );
    return responseBody;
}

/** Get the current balance of the TWD currency.
 */
function membersAccounts_TWD_get() {
    return membersAccounts_PathCurrency_get( "twd" );
}
