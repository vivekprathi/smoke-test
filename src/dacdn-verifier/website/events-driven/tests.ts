// import {combinationsOfAcceptEncoding} from '../../../endpoints-verifier/config';
import {HOSTNAME} from '../../../env';

const fs = require('fs');
export interface TestConfig {
    features: Record<string, string>;
    testPage: string;
    urls: UrlsTestConfig;
    only?: boolean;
    disable?: boolean;
}

export interface TestsConfig {
    [accountId: number]: TestConfig;
}
export interface UrlTestConfig {
    // Base URL to be used if the url is relative.
    assumedBaseUrl?: any;

    // Ordered Content Test
    content?: string[];

    // Unordered Content Test
    unorderedContent?: string[];

    // ContentType Test for the response
    contentType?: string;

    // URLS that are requested through the response
    outgoingUrls?: string[];
    mochaFiles?: string[];
    _pattern?: string;
    preJs?: string;
    isSettingsRequest?: boolean;
}

export interface UrlsTestConfig {
    [pattern: string]: UrlTestConfig;
}

const JSLibIdentifier = 'removeWWW',
    PhoenixIdentifier = 'currentSettings.rules',
    SettingsIdentifier = 'getMode';

const asyncSmartCodeJs = `window._vwo_code = {
    load: function() {},
    finished: function() {},
    finish: function() {},
    use_existing_jquery: function() {},
    library_tolerance: function() {}
};
document.getElementById = function() {
    return document.body
}
_vwo_settings_timer = 1;
`;
const path = require('path');
const jQueryContent = fs
    .readFileSync(path.join(__dirname, '../../../../', 'node_modules/jquery/dist/jquery.min.js'))
    .toString();
export const inputConfig: TestsConfig = {
    // Requests Go according to smartcode-config.ts
    '621087': {
        features: {},
        //SmartCode Test Page Url to be assumed
        testPage: 'https://ritakumari.wingified.com/?id=621087',
        urls: {
            //urlTesterMatchingPattern: {} //urlTestConfig
            '/j.php': {
                preJs: asyncSmartCodeJs,
                unorderedContent: ['runTestCampaign', 'runCampaign'],
                // Will automatically check for JS errors
                contentType: 'javascript',
                // outgoingUrls are only tested for visitor settings requests.
                //Temporary disabled because of the change to serve hashed files
                outgoingUrls: ['edrv/va', 'edrv/worker'],
                // Mark a request as as the visitor settings request.
                isSettingsRequest: true,
                // mochaFiles: ['./mocha-tests/j-global-vars.spec.ts']
            },
            // It would match vanj, va_gq and va
            'edrv/va': {
                // assumedBaseUrl: 'http://dev.visualwebsiteoptimizer.com/',
                assumedBaseUrl: `https://${HOSTNAME}/`,
                /**
                 * To Make the JS runtime valid.
                 * vanj requires jQuery. So add that.
                 */
                preJs: `${jQueryContent};
                VWO = [];
                VWO._ = {
                    allSettings: {
                        dataStore: {
                            campaigns: {},
                            plugins: {},
                        },
                        tags: {},
                        triggers: {},
                    },
                };
                window.mainThread = {
                    webWorker: {
                        postMessage: () => {},
                    },
                };`,
                unorderedContent: [JSLibIdentifier],
                contentType: 'javascript',
            },
            'edrv/worker': {
                assumedBaseUrl: '',
                preJs: `
                VWO = [];
                VWO._ = {
                    allSettings: {
                        dataStore: {
                            campaigns: {},
                            plugins: {},
                        },
                        tags: {},
                        triggers: {},
                    },
                };`,
                unorderedContent: [PhoenixIdentifier],
                contentType: 'javascript',
            },
            '/lib/621087.js': {
                contentType: 'javascript',
                // unorderedContent: [SettingsIdentifier, JSLibIdentifier, PhoenixIdentifier]
                unorderedContent: [SettingsIdentifier, JSLibIdentifier],
            },
        } as UrlsTestConfig,
        only: false,
        disable: false,
    },
    '477767': {
        features: {},
        testPage: 'http://vwo-jslib-test-website.hariombalhara.in/?accountId=477767',
        urls: {
            '/j.php': {
                preJs: asyncSmartCodeJs,
                // mochaFiles: ['./mocha-tests/j-global-vars.spec.ts'],
                //'edrv/va.js': [],
                //FIXME: These are not required to be in order.
                unorderedContent: ['runTestCampaign'],
                // Will automatically check for JS errors
                contentType: 'javascript',
            },
        },
        only: false,
        disable: false,
    },
};
