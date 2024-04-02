'use strict';
/* eslint-disable no-console */
const minimist = require('minimist');
const config = minimist(process.argv);
import fs = require('fs');
import extend = require('extend');
import { BASE_URL } from '../env';
import { log } from '../log';
const CONTENT_CHECK_FAIL = 'CONTENT_CHECK_FAIL';
const CORE_LIB_VERSION = config.coreLibVersion || 'na';
const NLS_JSLIB_VERSIONFOR2 = config.nlsJslibVersionFor2 || 'na';
const NLS_JSLIB_VERSIONFOR3 = config.nlsJslibVersionFor3 || 'na';
const OPS_JSLIB_VERSIONFOR05 = config.opsJslibVersionFor05 || 'na';
const OPS_JSLIB_VERSIONFOR1 = config.opsJslibVersionFor1 || 'na';
export let BATCH_SIZE = config.batchSize || 10;
export let doTags = config.tags;
export let doNonTags = config.nonTags;
export let doDacdnVerifier = config.dacdnVerifier;

// Run all types of tests if nothing specified
if (!doTags && !doNonTags && !doDacdnVerifier) {
    doTags = doNonTags = doDacdnVerifier = true;
}

export const enum LIBRARY_NAMES {
    'core-lib' = 'core-lib',
    'nls-jslib' = 'nls-jslib',
    'on-page-surveys' = 'on-page-surveys',
    'tag-manager' = 'tag-manager',
    'oneSmartCode' = 'oneSmartCode',
}
export const IS_CLOUDFLARE_CACHING = BASE_URL.includes('vwo-analytics.com');
export const productionServerBaseUrl = 'http://gind1dev.visualwebsiteoptimizer.com';
export const msgs = {
    CONTENT_ENCODING_WRONG: 'CONTENT_ENCODING_WRONG',
    VARY_HEADER_MISSING: 'VARY_HEADER_NOT_FOUND',
    SIZE_TOO_SMALL: 'SIZE_TOO_SMALL',
    NOT_UGLIFIED: 'NOT_UGLIFIED',
    CONTENT_NOT_READABLE: 'CONTENT_NOT_READABLE',
    STATUS_CODE_MISMATCH_WITH_PRODUCTION: 'STATUS_CODE_MISMATCH_WITH_PRODUCTION',
    TRY_WITHOUT_FOLDER_PREFIX: 'TRY_WITHOUT_FOLDER_PREFIX',
};
function checkIfBaseUrlIsADomainName(): void {
    const newRegEx = new RegExp(/([a-zA-Z]+[0-9]{0,1})[.-]/g);
    const isDomainName = newRegEx.test(BASE_URL);
    if (isDomainName) {
        BATCH_SIZE = 10;
    }
    console.log(BATCH_SIZE);
}
checkIfBaseUrlIsADomainName();
export const getTags = function () {
    return JSON.parse(fs.readFileSync('../../dacdn/tags/tagsConfig.json').toString());
}

export const librariesConfigsExternal = JSON.parse(
    fs.readFileSync('endpoints-without-tags.json').toString()
);

export function commonContentChecker(
    libraryName: string,
    text: string,
    libVersion: string,
    endpoint: string,
    _tagType: string,
    userAgent: string,
    file: string,
    skipLicense: string
): boolean {
    let LIBRARY_VERSION = 'na';
    let userAgentCheck = true;
    let licenseCheck = true;
    let versionCheck = true;
    let licenseText = '';
    let cookieJarShouldBePresent = false;
    if (!_tagType) {
        let stringForfindingLicense;
        if (librariesConfigsExternal[libraryName].files[file].stringForfindingLicense) {
            stringForfindingLicense = librariesConfigsExternal[libraryName].files[file].stringForfindingLicense;
        } else {
            stringForfindingLicense = librariesConfigsExternal[libraryName].stringForfindingLicense;
        }
        if (stringForfindingLicense) {
            licenseText = text.substring(
                text.indexOf(stringForfindingLicense[0]),
                text.indexOf(stringForfindingLicense[1])
            );
        } else {
            log.warn(`Ignoring the license extracting part for libraryName: ${libraryName} & endpoint: ${endpoint}`)
        }

    }
    const skipUserAgentCheck = librariesConfigsExternal[libraryName].files && librariesConfigsExternal[libraryName].files[file].skipUserAgentCheck;
    if (libraryName === 'core-lib' || libraryName === 'oneSmartCode') {
        LIBRARY_VERSION = CORE_LIB_VERSION;
        const isSafariFileAlwaysExpected = librariesConfigsExternal[libraryName].files[file].safari;
        /* for user agent in core lib */
        if (text.includes('VWO._.jar') && !skipUserAgentCheck) {
            if (endpoint.includes('safari') || endpoint.includes('_cj') || IS_CLOUDFLARE_CACHING || isSafariFileAlwaysExpected) {
                //should not include VWO._.jar=null
                userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) === -1;
                cookieJarShouldBePresent = true;
            } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
                const IOSversion = parseFloat(
                    userAgent.substring(userAgent.indexOf('OS') + 3, userAgent.indexOf('like') - 1)
                );
                if (IOSversion >= 14 || !userAgent.includes('CriOS/')) {
                    userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) === -1;
                    cookieJarShouldBePresent = true;
                } else {
                    // should include VWO._.jar =null;
                    userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) !== -1;
                }
            } else {
                if (userAgent.includes('chrome') && !IS_CLOUDFLARE_CACHING) {
                    //should include VWO._.jar=null
                    userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) !== -1;
                    cookieJarShouldBePresent = true;
                } else {
                    // In case of cloudflare we serve CookieJar file always
                    if (
                        parseFloat(
                            userAgent.substring(
                                userAgent.indexOf('n/1') + 2,
                                userAgent.indexOf('Saf')
                            )
                        ) >= 12.1
                    ) {
                        //should not include VWO._.jar=null
                        userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) === -1;
                        cookieJarShouldBePresent = true;
                    } else if (!IS_CLOUDFLARE_CACHING) {
                        //should include VWO._.jar=null
                        userAgentCheck = text.search(new RegExp(/VWO._.jar=\s*?null/)) !== -1;
                    }
                }
            }
        }
    } else if (libraryName === 'nls-jslib') {
        if (libVersion == '3.0' || libVersion == 'latest') {
            LIBRARY_VERSION = NLS_JSLIB_VERSIONFOR3;
        } else {
            LIBRARY_VERSION = NLS_JSLIB_VERSIONFOR2;
        }
    } else if (libraryName === 'on-page-surveys') {
        if (parseFloat(libVersion) <= 0.5) {
            LIBRARY_VERSION = OPS_JSLIB_VERSIONFOR05;
        } else {
            LIBRARY_VERSION = OPS_JSLIB_VERSIONFOR1;
        }
    } else if (libraryName === 'tag-manager') {
        licenseText =
            _tagType == 'critical'
                ? text.substring(text.indexOf('/**'), text.indexOf('*/'))
                : text.substring(text.indexOf('/*!'), text.indexOf('Date: 2014-12-16'));
    }
    let keyForVersionCheck;
    try {
        if (
            librariesConfigsExternal[libraryName].files &&
            librariesConfigsExternal[libraryName].files[file].keyForVersionCheck
        ) {
            keyForVersionCheck =
                librariesConfigsExternal[libraryName].files[file].keyForVersionCheck;
        } else {
            keyForVersionCheck = librariesConfigsExternal[libraryName].keyForVersionCheck;
        }
        // eslint-disable-next-line no-empty
    } catch (err) { }
    //skipping the version check for the tag-manager and the one smart code
    if (
        librariesConfigsExternal[libraryName].conductVersionCheck &&
        text.includes(keyForVersionCheck)
    ) {
        const expectedVersion = (librariesConfigsExternal[libraryName].files[file].versions && librariesConfigsExternal[libraryName].files[file].versions[libVersion]) || librariesConfigsExternal[libraryName].versions[libVersion]
        versionCheck =
            LIBRARY_VERSION.toLowerCase() !== 'na'
                ? text.search(
                    new RegExp(
                        keyForVersionCheck +
                        expectedVersion
                    )
                ) !== -1 && text.search(new RegExp(keyForVersionCheck + LIBRARY_VERSION)) !== -1
                : text.search(
                    new RegExp(
                        keyForVersionCheck +
                        expectedVersion
                    )
                ) !== -1;
    } else {
        console.log('No Version Check could be conducted');
        //return true;
    }
    if ((libVersion === '2.0' || libVersion === '1.0') && endpoint.includes('worker.js')) {
        console.log('Skipping the pako license check for the endpoint', endpoint);
        return versionCheck;
    }
    // if (endpoint.includes('va_survey_debug.js') || endpoint.includes('vis_opt_survey_debug.js')) {
    //     console.log('Skipping the license check for the endpoint ', endpoint);
    //     return false;
    // }
    let licenseArray: any = {};
    if (skipLicense !== 'skip') {
        try {
            if (
                librariesConfigsExternal[libraryName].files &&
                librariesConfigsExternal[libraryName].files[file].license
            ) {
                licenseArray = {
                    ...librariesConfigsExternal[libraryName].license,
                    ...librariesConfigsExternal[libraryName].files[file].license,
                };
            } else {
                licenseArray = librariesConfigsExternal[libraryName].license;
            }
        } catch (err) {
            licenseArray = librariesConfigsExternal[libraryName].license;
        }

        for (const licenseName in licenseArray) {
            if (text.includes(licenseName) && licenseArray[licenseName] !== null) {
                licenseCheck = licenseText.includes(licenseArray[licenseName]);
                if (!licenseCheck) {
                    console.error(
                        licenseArray[licenseName] + ' license does not exists for',
                        endpoint
                    );
                }
            }
        }
    }

    if (!versionCheck) {
        console.error(
            CONTENT_CHECK_FAIL,
            ' :Version Mismatched for ',
            endpoint,
            'expected version: ',
            LIBRARY_VERSION
        );
    }
    if (!userAgentCheck) {
        console.error(
            'CookieJar check failed for ',
            endpoint,
            ' and for userAgent',
            userAgent,
            'Expectation: Cookie Jar should  ',
            cookieJarShouldBePresent ? ' be present' : 'not be present',
            'While checking the output Cookie Jar is',
            userAgentCheck ? 'present' : 'is Not present'
        );
    }
    return versionCheck && licenseCheck && userAgentCheck;
}
export interface LibConfig {
    license?: any;
    files?: any;
    versions?: string[];
    getExpectedEncoding?: Function;
    disable?: boolean;
    only?: boolean;
    filenames: string[];
    folderName?: string;
}

export const librariesConfigs: Record<string, LibConfig> = {
    'core-lib': {
        filenames: [],
    },
    'nls-jslib': {
        filenames: [],
    },
    'on-page-surveys': {
        // @ts-ignore
        getExpectedVersion: function (libVersionInUrl: string): string {
            if (!libVersionInUrl) {
                return '1.0';
            }
        },
    },
    'tag-manager': {
        versions: [],
        files: [],
        folderName: '',
        filenames: [],
    },
    oneSmartCode: {
        filenames: [],
        versions: [],
    },
};
extend(true, librariesConfigs, librariesConfigsExternal);
export let filteredLibrariesConfigs: Record<string, LibConfig> = {};
let onlyEntryKey;

for (const [key, value] of Object.entries(librariesConfigs)) {
    value.filenames = [];
    // eslint-disable-next-line guard-for-in
    for (const i in value.files) {
        if (value.files[i].only) {
            // If ONLY is found anywhere only that file should be tested
            value.filenames = [i];
            break;
        } else if (!value.files[i].disable) {
            value.filenames.push(i);
        }
    }

    if (value.only) {
        onlyEntryKey = key;
        break;
    }
}

if (onlyEntryKey) {
    filteredLibrariesConfigs = {
        [onlyEntryKey]: librariesConfigs[onlyEntryKey],
    };
} else {
    for (const [key, value] of Object.entries(librariesConfigs)) {
        if (!value.disable) {
            filteredLibrariesConfigs[key] = value;
        }
    }
}
export const combinationsOfUserAgent = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.2 Safari/605.1.152',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36', // iPhone Os  => 14.0 version => safari
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/85.0.4183.109 Mobile/15E148 Safari/604.1', // iPhone Os  => 14.0 version => chrome
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', // iPhone Os  => 13.2 version => safari
    'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', // iPhone Os  => 13.2 version => safari
    'Mozilla/5.0 (iPad; CPU OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/80.0.3987.95 Mobile/15E148 Safari/605.1', // iPad Os - 13.4 version => chrome
    'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/85.0.4183.109 Mobile/15E148 Safari/605.1', // iPad Os - 14.0 version => chrome
];

export const combinationsOfAcceptEncoding = {
    null: 'gzip',
    gzip: 'gzip',
    br: 'br',
    'gzip,br': 'br',
    'br,gzip': 'br',
    '': 'gzip',
    'deflate, gzip': 'gzip',
    'deflate, gzip, br': 'br',
    // Wrong Expectation - Change it to br once issue is fixed.
    'gzip;q=1.0,br;q=0.6,identity;q=0.3': 'gzip',
};

export * from '../env'