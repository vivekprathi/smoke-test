//@ts-nocheck
var nodeFetch = require('node-fetch')

var dataCollectionRequests = [
    "/l.gif",
    "/l.gif?ab=1",
    "/c.gif",
    "/c.gif?ab=1",
    "/h.gif",
    "/h.gif?ab=1",
    "/s.gif",
    "/s.gif?ab=1",
    "/v.gif",
    "/v.gif?ab=1",
    "/events",
    "/events?ab=1",
    "/events/",
    "/events/?ab=1",
    '/server-side/track-goal',
    '/server-side/track-goal?ab=1',
    '/server-side/track-user',
    '/server-side/track-user?ab=1',
    '/track-user',
    '/track-user?ab=1',
    '/track-goal',
    '/track-goal?ab=1',
    '/e.gif',
    '/e.gif?sdf=1'
];

var contentRequests = [
    '/j.php',
    '/j.php?abc=1',
    '/deploy/js_visitor_settings.php',
    '/deploy/js_visitor_settings.php?ab=1',
    '/settings.js',
    '/settings.js?sdfd',
    '/api',
    '/api?sdfd',
    '/server-side/settings',
    '/server-side/settings?sdfs',
    '/cdc',
    '/cdc?asdf',
    '/ping_tpc.php',
    '/ping_tpc.php?sdfdf',
];

var servers = [
    'https://dacdn.vwo.com',
    'https://dacdn.visualwebsiteoptimizer.com',
    'https://dev.visualwebsiteoptimizer.com',
    'http://dacdn.vwo.com',
    'http://dacdn.visualwebsiteoptimizer.com',
    'http://dev.visualwebsiteoptimizer.com',
    'http://dev1.visualwebsiteoptimizer.com'
];

var dataCollectionServerPattern = 'g[a-z]+-c';

servers.forEach(function (server) {
    dataCollectionRequests.forEach(function (val) {
        nodeFetch(`${server}${val}`).then(function (response) {
            if (response.headers.get('server').search(new RegExp(dataCollectionServerPattern)) !== -1) {
                console.error(`Failed ${server}${val}: Got  ${response.headers.get('server')}, Expected: ${dataCollectionServerPattern}`.red)
            } else {
                console.log(`${server}${val}`, response.headers.get('server'));
            }
        });
    });

    var contentRequestServerName = 'gsng1';

    contentRequests.forEach(function (val) {
        nodeFetch(`${server}${val}`).then(function (response) {
            if (response.headers.get('server') !== contentRequestServerName) {
                console.error(`Failed ${server}${val}: Got  ${response.headers.get('server')}, Expected: ${contentRequestServerName}`.red)
            } else {
                console.log(`${server}${val}`, response.headers.get('server'));
            }
        });
    });
}, {
    mode: 'cors',
    redirect: 'follow'
});