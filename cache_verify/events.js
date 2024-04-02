// FORCE chalk to use ansi colors for jenkins
process.env.FORCE_COLOR = 1;
var CACHES = {
    CAMPAIGN: {
        campaign_settings: function (serverOrigin, data) {
            const url = `${serverOrigin}/inspectcache?dict=CAMPAIGN&key=${data.accountId}_${data.expId}&u=sparshgupta&p=121285&auth=BFJnorCGKTzkCodjAh7Dqwea`;
            console.log(`Fetching ${url}`);
            return url;
        },
    },
    campaign_meta: function (serverOrigin, data) {
        const url = `${serverOrigin}/inspectcache?dict=CAMPAIGNMETA&key=${data.accountId}&u=sparshgupta&p=121285&auth=BFJnorCGKTzkCodjAh7Dqwea`;
        console.log(`Fetching ${url}`);
        return url;
    },
};

const TESTS = [{ accountId: 6 }];
var SERVERS = [
    {
        name: 'gnv1c',
        ip: '35.245.219.104',
    },
    {
        name: 'gsng1',
        ip: '35.240.247.201',
    },
    {
        name: 'gsng2',
        ip: '34.126.78.137',
    },
    {
        name: 'gore1',
        ip: '104.199.113.143',
    },
    {
        name: 'gtok1',
        ip: '35.200.63.97',
    },
    {
        name: 'gtok2',
        ip: '34.84.53.74',
    },
    // {
    //     name: 'gjkt1',
    //     ip: '34.101.222.221',
    // },
    {
        name: 'gsc1',
        ip: '34.138.54.163',
    },
    {
        name: 'gsc2',
        ip: '35.231.0.177',
    },
    {
        name: 'gams1',
        ip: '35.204.240.30',
    },
    {
        name: 'gams2',
        ip: '34.32.223.163',
    },
    /*{
        name: 'gtok2',
        ip: '34.84.239.228',
    },
    {
        name: 'gams5',
        ip: '34.90.106.11',
    }*/
    {
        name: 'gbel1',
        ip: '35.205.32.3',
    },
    {
        name: 'gbrz1',
        ip: '35.198.23.89',
    },
    {
        name: 'gbrz2',
        ip: '35.247.245.229',
    },
    {
        name: 'gfra1',
        ip: '35.234.98.204',
    },
    {
        name: 'giow1',
        ip: '104.197.220.33',
    },
    {
        name: 'gla1',
        ip: '35.235.124.245',
    },
    {
        name: 'glon1',
        ip: '34.89.81.57',
    },
    {
        name: 'gnv1',
        ip: '35.230.166.51',
    },
    {
        name: 'gnv2',
        ip: '35.194.66.225',
    },
    {
        name: 'gnv3c',
        ip: '35.245.43.81',
    },
    {
        name: 'gsyd1',
        ip: '34.87.239.206',
    },
    {
        name: 'gind1',
        ip: '35.200.174.40',
    },
    {
        name: 'gind2',
        ip: '34.131.195.24',
    },
    //FIXME: SJC1 auth is failing
    /*{
        name: 'sjc1',
        ip: '108.168.224.131',
    }*/
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
    ,
];

var fetch = require('node-fetch');

const CACHE_STORE = {
    /*
    ACCOUNTID: {
        campaign_settings: {
            AMS1: {
                    sharedCache: "",
                    memCache: ""
            }
        }
    }
    */
};

const Diff = require('diff');
const chalk = require('chalk');
let errorFound = false;
function diffPrint(text1, text2) {
    errorFound = true;
    text1 = text1 || '';
    text2 = text2 || '';
    if (text1.length > 1000 || text2.length > 1000) {
        console.log('Skipping Diff Print as it can be too slow for large strings');
        return;
    }
    const diff = Diff.diffChars(text1, text2);
    diff.forEach((part) => {
        // green for additions, red for deletions
        // grey for common parts
        const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        console.log(chalk[color](part.value), '\n');
    });
}

const promises = [];

// FIXME: Remove these campaigns once the issue is fixed.
const EXCLUDED_CAMPAIGNS = {
    6: [
        //879, // TRACK
        //877, // Survey
        //866, // TRACK
        //764, // ANALYZE_RECORDING,
        //715, // DEPLOY,
        //10, // TRACK
    ],
};
console.log(chalk.red('Skipping Campaigns:'), EXCLUDED_CAMPAIGNS);
function getCampaignIds(accountId) {
    return new Promise(function (resolve, reject) {
        getCampaignIds.cache = getCampaignIds.cache || {};
        if (getCampaignIds.cache[accountId]) {
            resolve(getCampaignIds.cache[accountId]);
        }
        fetch(
            CACHES.campaign_meta(`http://${SERVERS[0].ip}`, {
                accountId: accountId,
            })
        ).then(function (res) {
            return res.json().then(function (obj) {
                let campaignIds = Object.keys(JSON.parse(JSON.parse(obj.memCache).urls).campaigns);
                campaignIds = campaignIds.filter(function (campaignId) {
                    if (!EXCLUDED_CAMPAIGNS[accountId]) {
                        return true;
                    }
                    return EXCLUDED_CAMPAIGNS[accountId].indexOf(+campaignId) == -1;
                });
                getCampaignIds.cache[accountId] = campaignIds;
                resolve(campaignIds);
            });
        });
    });
}

SERVERS.forEach(function (server) {
    const serverIp = server.ip;
    const serverName = server.name;
    const serverOrigin = `http://${serverIp}`;
    console.log('Verifying Server', server);
    TESTS.forEach(function (test) {
        promises.push(
            getCampaignIds(test.accountId).then(function (campaignIds) {
                const _promises = [];
                campaignIds.forEach(function (campaignId) {
                    for (var [cacheName, getCacheRequest] of Object.entries(CACHES.CAMPAIGN)) {
                        _promises.push(
                            fetch(
                                getCacheRequest(serverOrigin, {
                                    accountId: test.accountId,
                                    expId: campaignId,
                                })
                            ).then(function (res) {
                                return res.json().then(function (cache) {
                                    CACHE_STORE[test.accountId] = CACHE_STORE[test.accountId] || {};

                                    CACHE_STORE[test.accountId][cacheName] =
                                        CACHE_STORE[test.accountId][cacheName] || {};

                                    CACHE_STORE[test.accountId][cacheName][campaignId] =
                                        CACHE_STORE[test.accountId][cacheName][campaignId] || {};

                                    CACHE_STORE[test.accountId][cacheName][campaignId][serverName] =
                                        CACHE_STORE[test.accountId][cacheName][campaignId][
                                        serverName
                                        ] || {};

                                    CACHE_STORE[test.accountId][cacheName][campaignId][
                                        serverName
                                    ] = cache;
                                });
                            })
                        );
                    }
                });
                return Promise.all(_promises);
            })
        );
    });
});

Promise.all(promises).then(function () {
    for (var [accountId, accountData] of Object.entries(CACHE_STORE)) {
        for (var [cacheName, accountCacheData] of Object.entries(accountData)) {
            for (var [campaignId, accountCacheCampaignData] of Object.entries(accountCacheData)) {
                const combinationsDone = {}; // Remove permutations e.g. A & B is same as B & A comparisoon

                for (var [serverName, accountCacheCampaignServerData] of Object.entries(
                    accountCacheCampaignData
                )) {
                    /*console.log(
                        `Account: ${accountId}, Cache: ${cacheName}, ServerName: ${serverName}`,
                        accountCacheServerData
                    );*/

                    for (var [serverName2, accountCacheCampaignServerData2] of Object.entries(
                        accountCacheCampaignData
                    )) {
                        if (
                            combinationsDone[serverName] === serverName2 ||
                            serverName == serverName2
                        ) {
                            continue;
                        }

                        combinationsDone[serverName2] = serverName;
                        /*console.log(
                            `Account: ${accountId}, CampaignId: ${campaignId}, Cache: ${cacheName}. Servers ${serverName} and ${serverName2}`
                        );*/
                        if (
                            accountCacheCampaignServerData.memCache !==
                            accountCacheCampaignServerData2.memCache
                        ) {
                            console.log(
                                `Account: ${accountId}, CampaignId: ${campaignId}, Cache: ${cacheName}. Mismatch for Memcached on servers ${serverName} and ${serverName2}`
                            );
                            diffPrint(
                                accountCacheCampaignServerData.memCache,
                                accountCacheCampaignServerData2.memCache
                            );
                        }
                        if (
                            accountCacheCampaignServerData.sharedCache !==
                            accountCacheCampaignServerData2.sharedCache
                        ) {
                            console.log(
                                `Account: ${accountId}, CampaignId: ${campaignId}, Cache: ${cacheName}. Mismatch for Shared Cache on servers ${serverName} and ${serverName2}`
                            );
                            diffPrint(
                                accountCacheCampaignServerData.sharedCache,
                                accountCacheCampaignServerData2.sharedCache
                            );
                        }
                    }
                }
            }
        }
    }
    console.log('Done');
    process.exit(errorFound ? 1 : 0);
});
