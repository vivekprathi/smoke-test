const minimist = require('minimist');
export const config = minimist(process.argv);
export const hostnameWithoutProtocol = process.env.HOSTNAME || config.baseUrl;
export const hostname: string = hostnameWithoutProtocol
    ? `https://${hostnameWithoutProtocol}`
    : 'http://gind1dev.visualwebsiteoptimizer.com';
export const serverSideAccountConfig: any = {
    '514146': {
        urlsAccToFeature: {
            'featureTest-featureRollout-withoutServerAB': `${hostname}/server-side/settings?a=514146&i=926b4705b1056edf3d8155ba37d2b680&r=0.1312175181809617&platform=server-app&api-version=2`,
            'featureTest-featureRollout-withServerAB': `${hostname}/server-side/settings?a=514146&i=11a5c7991cf0918d198a5deb49872495&platform=server-app&api-version=2`,
            mobileAB: `${hostname}/api?a=514146&i=07b8894c6f32af3b63e3bff1caff40d9&platform=abcd&api-version=2`,
        },
        responseDataAccToFeature: {
            'featureTest-featureRollout-withoutServerAB': `{"sdkKey":"926b4705b1056edf3d8155ba37d2b680","campaigns":[{"id":5,"segments":{},"status":"RUNNING","percentTraffic":100,"goals":[{"type": "ON_PAGE", "id": 1, "identifier": "http://vwo_d_feature-rollout"}],"variations":[{"id":1,"name":"website","changes":{},"weight":100}],"variables":[{"value":"ssdsdds","type":"string","key":"aaaa","id":1}],"isForcedVariationEnabled":false,"key":"ft2","type":"FEATURE_ROLLOUT"},{"id":6,"segments":{},"status":"RUNNING","percentTraffic":100,"goals":[{"identifier":"dsdssd","id":203,"type":"CUSTOM_GOAL"}],"isForcedVariationEnabled":false,"key":"ftt2","variations":[{"changes":{},"id":1,"variables":[{"value":"ssdsdds","type":"string","key":"aaaa","id":1}],"isFeatureEnabled":false,"weight":33.3333,"name":"Control"},{"changes":{},"id":2,"variables":[{"value":"ssdsdds","type":"string","key":"aaaa","id":1}],"isFeatureEnabled":true,"weight":33.3333,"name":"Variation-1"},{"changes":{},"id":3,"variables":[{"value":"ssdsdds","type":"string","key":"aaaa","id":1}],"isFeatureEnabled":false,"weight":33.3333,"name":"Variation-2"}],"type":"FEATURE_TEST"}],"accountId":514146,"version":1}`,
            'featureTest-featureRollout-withServerAB':
                '{"sdkKey":"11a5c7991cf0918d198a5deb49872495","campaigns":[{"id":2,"segments":{},"status":"RUNNING","percentTraffic":100,"goals":[{"identifier":"custom","id":201,"type":"CUSTOM_GOAL"}],"isForcedVariationEnabled":false,"key":"bg12","variations":[{"id":1,"name":"Control","changes":{},"weight":33.3333},{"id":2,"name":"Variation-1","changes":{},"weight":33.3333},{"id":3,"name":"Variation-2","changes":{},"weight":33.3333}],"type":"VISUAL_AB"},{"id":3,"segments":{},"status":"RUNNING","percentTraffic":100,"goals":[{"type": "ON_PAGE", "id": 1, "identifier": "http://vwo_d_feature-rollout"}],"variations":[{"id":1,"name":"website","changes":{},"weight":100}],"variables":[{"value":0,"type":"integer","key":"testVariable1","id":1},{"value":0.2,"type":"double","key":"testVariable2","id":2}],"isForcedVariationEnabled":false,"key":"testKey1","type":"FEATURE_ROLLOUT"},{"id":4,"segments":{},"status":"RUNNING","percentTraffic":100,"goals":[{"identifier":"e","id":202,"type":"CUSTOM_GOAL"}],"isForcedVariationEnabled":false,"key":"featureTest2","variations":[{"changes":{},"id":1,"variables":[{"value":0,"type":"integer","key":"testVariable1","id":1},{"value":0.2,"type":"double","key":"testVariable2","id":2}],"isFeatureEnabled":false,"weight":50,"name":"Control"},{"changes":{},"id":2,"variables":[{"value":0,"type":"integer","key":"testVariable1","id":1},{"value":0.2,"type":"double","key":"testVariable2","id":2}],"isFeatureEnabled":true,"weight":50,"name":"Variation-1"}],"type":"FEATURE_TEST"}],"accountId":514146,"version":1}',
            mobileAB: `[{"pc_traffic":100,"clickmap":1,"id":1,"name":"Campaign 1","status":"RUNNING","version":2,"count_goal_once":1,"test_key":"bg1","goals":[{"identifier":"custom","id":200,"type":"CUSTOM_GOAL"}],"track_user_on_launch":false,"isEventMigrated": true,"_t": 1656659516,"variations":{"id":"2","name":"Variation-1","changes":{"abc":"1"},"weight":50},"type":"VISUAL_AB"}]`,
        },
    },
};
