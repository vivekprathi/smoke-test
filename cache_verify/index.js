/* eslint-disable no-console */
/**
 * Verifies that various caches are same across servers and are same in memcached and nginx shared cache
 */

/************************ CONFIGURATION ********************************/
var servers = [
    {
        name: 'gcp-cnv1',
        ip: '35.245.219.104',
    },
    {
        name: 'gcp-sng1',
        ip: '35.240.247.201',
    },
    {
        name: 'gcp-sng2',
        ip: '34.126.78.137',
    },
    {
        name: 'gcp-ore1',
        ip: '104.199.113.143',
    },
    {
        name: 'gcp-tok1',
        ip: '35.200.63.97',
    },
    {
        name: 'gcp-tok2',
        ip: '34.84.53.74',
    },
    // {
    //     name: 'gcp-jkt1',
    //     ip: '34.101.222.221',
    // },
    {
        name: 'gcp-gsc1',
        ip: '34.138.54.163',
    },
    {
        name: 'gcp-gsc2',
        ip: '35.231.0.177',
    },
    {
        name: 'gcp-ams1',
        ip: '35.204.240.30',
    },
    {
        name: 'gcp-ams2',
        ip: '34.32.223.163',
    },
    /*{
       name: 'gtok2',
       ip: '34.84.239.228',
    },
    {
        name: 'gcp-ams5',
        ip: '34.90.106.11',
    },*/
    {
        name: 'gcp-bel1',
        ip: '35.205.32.3',
    },
    {
        name: 'gcp-brz1',
        ip: '35.198.23.89',
    },
    {
        name: 'gcp-brz2',
        ip: '35.247.245.229',
    },
    {
        name: 'gcp-fra1',
        ip: '35.234.98.204',
    },

    {
        name: 'gcp-iow1',
        ip: '104.197.220.33',
    },
    {
        name: 'gcp-la1',
        ip: '35.235.124.245',
    },
    {
        name: 'gcp-lon1',
        ip: '34.89.81.57',
    },
    {
        name: 'gcp-nv1',
        ip: '35.230.166.51',
    },
    {
        name: 'gcp-nv2',
        ip: '35.194.66.225',
    },
    {
        name: 'gcp-cnv3',
        ip: '35.245.43.81',
    },
    {
        name: 'gcp-syd1',
        ip: '34.87.239.206',
    },
    {
        name: 'gcp-ind1',
        ip: '35.200.174.40',
    },
    {
        name: 'gcp-ind2',
        ip: '34.131.195.24',
    },
    {
        name: 'sjc1',
        ip: '108.168.224.131',
    },
    /*{
        name: 'gcp-r1',
        ip: '35.245.208.72',
    },
    {
        name: 'gcp-r2',
        ip: '35.221.11.9',
    },
    {
        name: 'gcp-r3',
        ip: '35.194.81.74',
    },*/
    // "ams5dev.visualwebsiteoptimizer.com",
    // "rec1.visualwebsiteoptimizer.com",
    // "rec2.visualwebsiteoptimizer.com",
    // "rec3.visualwebsiteoptimizer.com"
];

var caches = {
    account: function (account) {
        return `/get_account_cache?a=${account}&json=1`;
    },
    ip_filters: function (account) {
        return `/get_cache_core?k=${account}&u=sparshgupta&p=121285&c=ip_filters`;
    },
    cd_pii: function (account) {
        return `/get_cache_core?k=${account}&u=sparshgupta&p=121285&c=cd_pii`;
    },
    qp_pii: function (account) {
        return `/get_cache_core?k=${account}&u=sparshgupta&p=121285&c=qp_pii`;
    },
    ie_urls: function (account) {
        return `/get_cache_core?k=${account}&u=sparshgupta&p=121285&c=ie_urls`;
    },
    //settings: function(account, exp) {
    //  return `/get_cache_core?k=${account}_${exp}&u=sparshgupta&p=121285&c=settings`;
    // },
    urls: function (account) {
        return `/get_cache_core?k=${account}&u=sparshgupta&p=121285&c=urls`;
    },
};

// Accounts that would always be verified.
var accounts = [/*6, 196,*/ 191249, 331081, 438979, 287192, 298809, 355097];

var randomAccounts = [],
    randomExps = [],
    randomNum;

// Generate 5 random accounts to test on.
for (var i = 0; i < 5; i++) {
    randomNum = Math.floor(Math.random() * 348226 + 10000); // Generate random account Id from 10000 to 358226
    randomAccounts.push(randomNum);
}

for (var i = 0; i < 5; i++) {
    randomNum = Math.floor(Math.random() * 100) + 1; // Generate random account Id from 10000 to 358226
    randomExps.push(randomNum);
}

var allAccounts = randomAccounts.concat(accounts);
var allExperiments = randomExps;
/*********************************************************************************/
/*var _jsonStringify = JSON.stringify;
JSON.stringify = function (str) {
    return _jsonStringify.call(JSON, str, null, 2);
}; */

require('colors');

var request = require('request');
var errorFound = false;
var stringify = require('json-stable-stringify');
var md5 = require('md5');
var minimist = require('minimist');
const { fn } = require('jquery');
var config = minimist(process.argv);
var noMemcachedVerification = config.memcachedVerification === false;
var customRequest = request.defaults({
    headers: {
        'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
    },
});

var _jsonParse = JSON.parse;
JSON.parse = function (str) {
    try {
        return _jsonParse.apply(JSON, [].slice.call(arguments));
    } catch (e) {
        return str;
    }
};

var responses = {};
var sameServerCacheFailures = {};

function validateCache(server, account, endpoint, cache) {
    var promise = new Promise(function (resolve, reject) {
        console.log('Verifying for ' + 'http://' + server.ip + endpoint);

        customRequest('http://' + server.ip + endpoint, function (error, response, body) {
            if (!error) {
                body = JSON.parse(body);

                const parsedBody = {
                    nginx: JSON.parse(body.nginx) || {},
                    memc: JSON.parse(body.memc) || {},
                };
                // Remove properties that are variable over time.
                delete parsedBody.nginx.pc_t;
                delete parsedBody.nginx.pc_a;
                delete parsedBody.memc.pc_t;
                delete parsedBody.memc.pc_a;
                /*if (parsedBody.memc == "_" && parsedBody.nginx == "_"){
                    parsedBody.memc = {};
                    parsedBody.nginx;
                }*/
                var md5_hashes = {
                    nginx: md5(parsedBody.nginx),
                    memc: md5(parsedBody.memc),
                    body: md5(stringify(parsedBody)),
                };

                if (md5_hashes.nginx != md5_hashes.memc) {
                    sameServerCacheFailures[account][cache][server.name] = stringify(parsedBody);
                }

                responses[account][cache]['nginx'][md5_hashes.nginx] = {
                    server: server.name,
                    content: parsedBody.nginx,
                };

                responses[account][cache]['memc'][md5_hashes.memc] = {
                    server: server.name,
                    content: parsedBody.memc,
                };
                resolve();
            } else {
                console.log(server.name, endpoint, error);
                reject(new Error('Error connecting to server'));
            }
        });
    });
    return promise;
}
const failedAccounts = new Object();
var promises = [];
var newPromises = [];
var updatePromise = [];
// NOTE: 
async function promiseBuild(accounts) {
    accounts.forEach(function (account) {
        responses[account] = {};
        sameServerCacheFailures[account] = {};
        // eslint-disable-next-line guard-for-in
        for (var cache in caches) {
            responses[account][cache] = {
                nginx: {},
                memc: {},
            };
            sameServerCacheFailures[account][cache] = {};
            if (cache == 'settings') {
                allExperiments.forEach(function (expId) {

                    servers.forEach(function (server) {
                        sameServerCacheFailures[account][cache][server.name] = {};
                        promises.push(
                            validateCache(server, account, caches[cache](account, expId), cache)
                        );
                    });
                });
            }
            servers.forEach(function (server) {
                sameServerCacheFailures[account][cache][server.name] = {};
                promises.push(validateCache(server, account, caches[cache](account), cache));
            });
        }
    });

    await Promise.all(promises).then(function () {
        if (errorFound) {
            console.log('Errors found in cache'.red);
        }
        allAccounts.forEach(function (account) {
            // eslint-disable-next-line guard-for-in
            for (var cache in caches) {
                if (Object.keys(responses[account][cache]['nginx']).length > 1) {
                    console.log(
                        `"${cache}" - Nginx Shared Cache not same across servers for account:${account}. Various versions of cache available are ${stringify(
                            responses[account][cache],
                            { space: 3 }
                        )}`.red
                    );
                    failedAccounts[account.toString() + "_" + cache] = cache;

                    errorFound = true;
                }

                if (
                    !noMemcachedVerification &&
                    Object.keys(responses[account][cache]['memc']).length > 1
                ) {
                    console.log(
                        `"${cache}" - Memcached not same across servers for account:${account}. Various versions of cache available are ${stringify(
                            responses[account][cache],
                            { space: 3 }
                        )}`.red
                    );
                    failedAccounts[account.toString() + "_" + cache] = cache;
                    errorFound = true;
                }

                servers.forEach(function (server) {
                    if (
                        !noMemcachedVerification &&
                        Object.keys(sameServerCacheFailures[account][cache][server.name]).length > 0
                    ) {
                        console.error(
                            `${cache} is not same for l1 and l2 on ${server.name
                                } for ${account}, response was - ${sameServerCacheFailures[account][cache][server.name]
                                }`.red
                        );
                        failedAccounts[account.toString() + "_" + cache] = cache;
                        errorFound = true;
                    }
                });
            }
        });
    });
}
async function retryPromiseBuild() {
    responses = {}
    Object.entries(failedAccounts).forEach(([acc, cache]) => {
        var account = acc.split("_")[0]
        responses[account] = {};
        sameServerCacheFailures[account] = {};
        // eslint-disable-next-line guard-for-in
        for (var cache in caches) {
            responses[account][cache] = {
                nginx: {},
                memc: {},
            };
            sameServerCacheFailures[account][cache] = {};
            if (cache == 'settings') {
                allExperiments.forEach(function (expId) {

                    servers.forEach(function (server) {
                        sameServerCacheFailures[account][cache][server.name] = {};
                        newPromises.push(
                            validateCache(server, account, caches[cache](account, expId), cache)
                        );
                    });
                });
            }
            servers.forEach(function (server) {
                sameServerCacheFailures[account][cache][server.name] = {};
                newPromises.push(validateCache(server, account, caches[cache](account), cache));
            });
        }
    });
    var newfailedAccounts = new Object();
    await Promise.all(newPromises).then(function () {
        if (errorFound) {
            console.log('Errors found in cache'.red);
        }
        Object.entries(failedAccounts).forEach(([acc, cache]) => {
            var account = acc.split("_")[0]
            // eslint-disable-next-line guard-for-in
            for (var cache in caches) {
                if (Object.keys(responses[account][cache]['nginx']).length > 1) {
                    console.log(
                        `"${cache}" - Nginx Shared Cache not same across servers for account:${account}. Various versions of cache available are ${stringify(
                            responses[account][cache],
                            { space: 3 }
                        )}`.red
                    );
                    newfailedAccounts[account.toString() + "_" + cache] = cache;
                    errorFound = true;
                }

                if (
                    !noMemcachedVerification &&
                    Object.keys(responses[account][cache]['memc']).length > 1
                ) {
                    console.log(
                        `"${cache}" - Memcached not same across servers for account:${account}. Various versions of cache available are ${stringify(
                            responses[account][cache],
                            { space: 3 }
                        )}`.red
                    );
                    newfailedAccounts[account.toString() + "_" + cache] = cache;
                    errorFound = true;
                }

                servers.forEach(function (server) {
                    if (
                        !noMemcachedVerification &&
                        Object.keys(sameServerCacheFailures[account][cache][server.name]).length > 0
                    ) {
                        console.error(
                            `${cache} is not same for l1 and l2 on ${server.name
                                } for ${account}, response was - ${sameServerCacheFailures[account][cache][server.name]
                                }`.red
                        );
                        newfailedAccounts[account.toString() + "_" + cache] = cache;
                        errorFound = true;
                    }
                });
            }
        });
        if (!errorFound) {
            console.log('Succesfully Verified for accounts:', allAccounts, allExperiments);
        } else {
            console.log("Failed again for", newfailedAccounts)
        }
        process.exit(+errorFound);
    });
}
function accountCachePurgeCall(account, server, cache) {
    return new Promise((resolve, reject) => {
        var s = md5("R3dCh3rry08" + account + "_@" + "R3dCh3rry08")
        customRequest(`http://${server.ip}/purge_account_settings?s=${s}&a=${account}`, function (error, response, body) {
            console.log(`Update ${cache} cache for account id=${account} for server=${server.name}`)
            resolve();
            if (error) {
                console.log(`Cache Update failed for ${server.name}: http://${server.ip}/lib/${account}/.js`)
                reject(new Error('Error occured'));
            }
        });
    })
}
function urlsCachePurgeCall(account, server, cache) {
    return new Promise((resolve, reject) => {
        customRequest(`http://${server.ip}/inspectcache?auth=BFJnorCGKTzkCodjAh7Dqwea&u=sparshgupta&p=121285&mode=human&flush=both&key=${account}&dict=URLS`, function (error, response, body) {
            console.log(`Update ${cache} cache for account id=${account} for server=${server.name}`)
            resolve();
            if (error) {
                console.log(`Cache Update failed for ${server.name}: http://${server.ip}/lib/${account}/.js`)
                reject(new Error('Error occured'));
            }
        });
    })
}
function cachePurgeCall(account, server, cache) {
    return new Promise((resolve, reject) => {
        var s = md5("R3dCh3rry08" + account + "" + "@" + "R3dCh3rry08")
        customRequest(`http://${server.ip}/purge_cache_core?s=${s}&k=${account}&c=${cache}`, function (error, response, body) {
            console.log(`Update ${cache} cache for account id=${account} for server=${server.name}`)
            resolve();
            if (error) {
                console.log(`Cache Update failed for ${server.name}: http://${server.ip}/lib/${account}/.js`)
                reject(new Error('Error occured'));
            }
        });
    })

}
async function updateCache(accountsObject) {
    console.log("Updating cache for : ", accountsObject)
    Object.entries(accountsObject).forEach(([acc, cache]) => {
        var account = acc.split("_")[0]
        if (cache == 'account') {
            servers.forEach(function (server) {
                updatePromise.push(accountCachePurgeCall(account, server, cache))
            });
        } else if (cache == 'urls') {
            servers.forEach(function (server) {
                console.log("in here for server ", server.name)
                updatePromise.push(urlsCachePurgeCall(account, server, cache))
            });
        } else {
            servers.forEach(function (server) {
                updatePromise.push(cachePurgeCall(account, server, cache))
            });
        }
    });
    await Promise.all(updatePromise).then(function () {
        retryPromiseBuild()
    }).catch(function (error) {
        console.error(error);
    });;
    errorFound = false;
}
function processExitAndLog() {
    if (!errorFound) {
        console.log('Succesfully Verified for accounts:', allAccounts, allExperiments);
    }
    process.exit(+errorFound);
}
async function driver() {
    await promiseBuild(allAccounts);
    console.log(Object.keys(failedAccounts).length)
    if (Object.keys(failedAccounts).length > 0) {
        updateCache(failedAccounts)
    } else {
        const myTimeout = setTimeout(processExitAndLog, 10000);
    }
}
driver()

