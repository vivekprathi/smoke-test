/* eslint-disable no-console */
/* eslint-disable guard-for-in */
import { BASE_URL } from '../../../env';
import { concatObjectForTags } from '../../../test-utils';
import { filterConfigOnBasisOfOnlyandDisable } from '../../utils';
import { UrlsEnum } from '../UrlsEnum';
import { keyForVersionMatching } from '../website-utils';
// eslint-disable-next-line sort-imports
import { inputConfig, IS_CLOUDFLARE_CACHING } from './tests';
const specialBugException = `[SPECIAL_BUG_EXCEPTION]`;
const atob = require('atob');
const extend = require('extend');

/**
 * Returns the new SmartCodeConfig with only those parameters that are to be tested.
 * It is a time optimization.
 * e.g. If a particular test doesn't want to verify heatmaps, then heatmaps requests shouldn't go
 * @param inputConfig 
 * @param smartCodesConfigs 
 * @param accountId 
 */
function filterSmartCodeConfigAccWise(
    inputConfig,
    smartCodesConfigs,
    accountId: string
): Record<string, any> {
    const smartCodeConfig = smartCodesConfigs
    const smartCodeConfigAccWise: Record<string, any> = {};
    smartCodeConfigAccWise['async'] = smartCodeConfig['async'];
    smartCodeConfigAccWise[UrlsEnum.oldSync] = smartCodeConfig[UrlsEnum.oldSync];
    smartCodeConfigAccWise['osc'] = smartCodeConfig['osc'];
    if (inputConfig[accountId].previewObject) {
        smartCodeConfigAccWise[UrlsEnum.asyncPreview] = smartCodeConfig[UrlsEnum.asyncPreview];
        smartCodeConfigAccWise[UrlsEnum.syncPreview] = smartCodeConfig[UrlsEnum.syncPreview];
    }
    if (inputConfig[accountId].heatmapObject) {
        smartCodeConfigAccWise[UrlsEnum.heatmapAsync] = smartCodeConfig[UrlsEnum.heatmapAsync];
        smartCodeConfigAccWise[UrlsEnum.heatmapSync] = smartCodeConfig[UrlsEnum.heatmapSync];
    }
    if (inputConfig[accountId].sharedPreviewLinkSuffix) {
        smartCodeConfigAccWise[UrlsEnum.asyncSharedPreviewLink] =
            smartCodeConfig[UrlsEnum.asyncSharedPreviewLink];
        smartCodeConfigAccWise[UrlsEnum.asyncSharedPreviewLinkWithHashParam] =
            smartCodeConfig[UrlsEnum.asyncSharedPreviewLinkWithHashParam];
        smartCodeConfigAccWise[UrlsEnum.oscSharedPreviewLink] = smartCodeConfig[UrlsEnum.oscSharedPreviewLink];
        smartCodeConfigAccWise[UrlsEnum.oscSharedPreviewLinkWithHashParam] =
            smartCodeConfig[UrlsEnum.oscSharedPreviewLinkWithHashParam];
    }
    if (inputConfig[accountId].surveyPreviewObject) {
        smartCodeConfigAccWise[UrlsEnum.surveyPreview] = smartCodeConfig[UrlsEnum.surveyPreview];
    }
    return smartCodeConfigAccWise;
}

const createObject = function createObject(
    mode: string,
    value: string,
    accountId: string,
    url?: string,
    campaingId?: string
): string {
    const modeObjectKey = `_vis_${mode.toLowerCase()}_${accountId}`;
    if (campaingId && url && url.includes('osc')) {
        const modeObject = JSON.parse(value);
        modeObject.e[campaingId].url = url;
        value = JSON.stringify(modeObject);
    }
    const modeObj = {
        [modeObjectKey]: JSON.stringify(JSON.parse(value)),
    };
    return JSON.stringify(modeObj);
};

export function getFileUrls(accountId, inputConfig) {
    const sharedPreviewLinkSuffix = inputConfig[accountId].sharedPreviewLinkSuffix;
    const testPage = inputConfig[accountId].testPage;
    const urlEncodedForAsync = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}`
    );
    const asyncPreviwSharedLinkUrlEncoded = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&${sharedPreviewLinkSuffix}`
    );

    const asyncPreviwSharedLinkUrlEncodedWitHashParam = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}#${sharedPreviewLinkSuffix}`
    );
    const urlEncodedForSync = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&osc`
    );
    const urlEncodedForOldSync = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&sync`
    );
    const changedUrlEncoded = encodeURIComponent(
        testPage || `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&urlchangetesting`
    );
    // if (!inputConfig[accountId].previewObject || !inputConfig[accountId].heatmapObject) {
    //     console.error(
    //         `${failed}. Preview or heatmap Object do not exist in input config for accountId: ${accountId}`
    //     );
    //     return;
    // }
    const surveyPreviewModeForAsync = inputConfig[accountId].surveyPreviewObject
        ? encodeURIComponent(
            createObject('preview', inputConfig[accountId].surveyPreviewObject, accountId)
        )
        : '';

    // TODO: previewmode obj
    const previewModeUrlForAsync = inputConfig[accountId].previewObject
        ? encodeURIComponent(
            createObject('preview', inputConfig[accountId].previewObject, accountId)
        )
        : '';
    const heatmapModeUrlForAsync = inputConfig[accountId].heatmapObject
        ? encodeURIComponent(
            createObject('heatmap', inputConfig[accountId].heatmapObject, accountId)
        )
        : '';
    const heatmapModeUrlForSync = inputConfig[accountId].heatmapObject
        ? encodeURIComponent(
            createObject('heatmap', inputConfig[accountId].heatmapObject, accountId)
        )
        : '';
    const previewModeUrlForSync = inputConfig[accountId].previewObject
        ? encodeURIComponent(
            createObject(
                'preview',
                inputConfig[accountId].previewObject,
                accountId,
                urlEncodedForSync,
                inputConfig[accountId].campaignId
            )
        )
        : '';
    const fileUrls: Record<string, string> = {
        [UrlsEnum.jPhp]: `${BASE_URL}/j.php?a=${accountId}&u=${urlEncodedForAsync}&f=1`,
        [UrlsEnum.oldSync]: `${BASE_URL}/deploy/js_visitor_settings.php?a=${accountId}&url=${urlEncodedForOldSync}`,
        [UrlsEnum.asyncPreview]: `${BASE_URL}/j.php?mode=${previewModeUrlForAsync}&a=${accountId}&f=1&u=${urlEncodedForAsync}`,
        [UrlsEnum.surveyPreview]: `${BASE_URL}/j.php?mode=${surveyPreviewModeForAsync}&a=${accountId}&u=${urlEncodedForAsync}&f=1`,
        [UrlsEnum.asyncSharedPreviewLink]: `${BASE_URL}/j.php?a=${accountId}&u=${asyncPreviwSharedLinkUrlEncoded}`,
        [UrlsEnum.asyncSharedPreviewLinkWithHashParam]: `${BASE_URL}/j.php?a=${accountId}&u=${asyncPreviwSharedLinkUrlEncodedWitHashParam}`,
        // special case : In this particular scenario while fetching the response we pass the referer in header.
        [UrlsEnum.oscSharedPreviewLink]: `${BASE_URL}/lib/${accountId}.js`,
        [UrlsEnum.oscSharedPreviewLinkWithHashParam]: `${BASE_URL}/lib/${accountId}.js`,
        [UrlsEnum.heatmapAsync]: `${BASE_URL}/j.php?mode=${heatmapModeUrlForAsync}&a=${accountId}&u=${urlEncodedForAsync}&f=1`,
        [UrlsEnum[UrlsEnum.oscLib]]: `${BASE_URL}/lib/${accountId}.js`,
        [UrlsEnum.syncPreview]: `${BASE_URL}/lib/${accountId}.js?mode=${previewModeUrlForSync}&u=${urlEncodedForSync}&a=${accountId}&f=1`,
        // special case in which the code is osc but the mode call in heatmap goes to j,php
        [UrlsEnum.heatmapSync]: `${BASE_URL}/lib/${accountId}.js?mode=${heatmapModeUrlForSync}&u=${urlEncodedForOldSync}`,
        [UrlsEnum.settingsType1]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=1&r=${Math.random()}`,
        [UrlsEnum.settingsType2]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=2&u=${urlEncodedForSync}&r=${Math.random()}`,
        [UrlsEnum.settingsType2UrlChange]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=2&r=${Math.random()}&u=${changedUrlEncoded}`,
    };
    return [fileUrls, sharedPreviewLinkSuffix];
}


/**
 *
 * @param configCallWise : it contains a config according to the call: {UrlsEnum.jPhp: {},UrlsEnum.settingsType1: {}}
 * @param accountId
 * @param endpointsConfig: contains the contectCheck Array and version array call wise.Will help to check the content of the particular call.
 * @param accountIdAttributes: will contains the account Id attributes callWise. Attributes holds for corelib, analyze, track, survey .
 */
//TODO: need to simplify this logic
export const generateEndpointsConfig = function generateEndpointsConfig(
    filteredInputConfig,
    configCallWise: Record<string, any>,
    accountId: string,
    endpointsConfig: Record<string, any>,
    accountIdAttributes: Record<string, any>,
    smartCodeConfigCodeTypeWise: Record<string, any>
): void {
    for (const calltype in configCallWise) {
        const attributesFromInputConfig = JSON.parse(
            JSON.stringify(filteredInputConfig[accountId].attributes)
        );
        // it is done to add the exceptions present in the smartCodeConfig
        extend(true, attributesFromInputConfig, smartCodeConfigCodeTypeWise.exceptions);
        const endpointsConfigCallWise: Record<string, any> = {};
        const accountIdAttributesCallWise: Record<string, any> = {};
        const tagsCall = configCallWise[calltype].tagsCall;
        if (tagsCall && tagsCall.length) {
            for (let count = 0; count < tagsCall.length; count++) {
                let baseDecoding = '';
                const tagManagerEnabled = filteredInputConfig[accountId].tagManagerEnabled;
                endpointsConfigCallWise[tagsCall[count]] = {};
                if (tagsCall[count].includes('web/')) {
                    //extracting out the base 64 encoding
                    const baseEncoding = tagsCall[count].substring(
                        tagsCall[count].indexOf('web/') + 4,
                        tagsCall[count].lastIndexOf('/')
                    );
                    // checking out whether it is critical tag or non critical tag
                    baseDecoding = atob(baseEncoding);
                }
                const keyConcatArray: Record<string, string> = {};
                const keyForCheckingConcatenation: Record<string, string>[] = [];
                const libWiseVersionKey: Record<string, string>[] = [];
                // Expecting that the debug library would be coming with va only.
                if (
                    (baseDecoding.includes('debug') && !baseDecoding.includes('debug_heatmap')) ||
                    (tagsCall[count].includes('debug') && !tagManagerEnabled)
                ) {
                    extend(true, keyConcatArray, { debug: true });
                    accountIdAttributesCallWise['debug'] = true;
                }
                if (
                    baseDecoding.includes('heatmap') ||
                    (tagsCall[count].includes('heatmap') &&
                        !tagManagerEnabled &&
                        !tagsCall.includes(`lib/${accountId}.js`))
                ) {
                    extend(true, keyConcatArray, { heatmap: true });
                    accountIdAttributesCallWise['heatmap'] = true;
                }
                // critical tags
                if (
                    baseDecoding.includes('te:') ||
                    (tagsCall[count].includes('va') &&
                        !tagsCall[count].includes('va_survey') &&
                        !tagManagerEnabled) ||
                    tagsCall[count].includes(`lib/${accountId}.js`) ||
                    tagsCall[count].includes('vis_opt-')
                ) {
                    // add debug for the preview mode.
                    if (tagsCall[count].includes(`_vis_preview_${accountId}`)) {
                        extend(true, keyConcatArray, { debug: true });
                        accountIdAttributesCallWise['debug'] = true;
                    }
                    if (tagsCall[count].includes(`_vis_heatmap_${accountId}`)) {
                        extend(true, keyConcatArray, { heatmap: true });
                        accountIdAttributesCallWise['heatmap'] = true;
                    }
                    libWiseVersionKey.push({
                        coreLib:
                            keyForVersionMatching['coreLib'] + baseDecoding.includes('debug_survey')
                                ? '7.0'
                                : attributesFromInputConfig.coreLib.version,
                    });
                    accountIdAttributesCallWise['coreLib'] = true;
                    extend(true, keyConcatArray, attributesFromInputConfig.coreLib.fileConf);
                    if (baseDecoding.includes('debug_survey')) {
                        libWiseVersionKey.push({
                            survey:
                                keyForVersionMatching['survey'] +
                                attributesFromInputConfig.survey.version,
                        });
                        console.log(
                            `${specialBugException}. Ignoring the safari check in case of va_Survey_debug for cloudflare smart code.`
                        );
                        //@ts-ignore
                        keyConcatArray['safari'] = false;
                        accountIdAttributesCallWise['survey'] = true;
                        extend(true, keyConcatArray, { survey: true });
                    }
                }
                if (
                    baseDecoding.includes('a:') ||
                    (tagsCall[count].includes('opa') && !tagManagerEnabled)
                ) {
                    extend(true, keyConcatArray, attributesFromInputConfig.analyze.fileConf);
                    let analyzeKey;
                    if (attributesFromInputConfig.analyze.version.includes('4.0')) {
                        analyzeKey =
                            keyForVersionMatching['analyze4'] +
                            attributesFromInputConfig.analyze.version;
                    } else {
                        analyzeKey =
                            keyForVersionMatching['analyze3'] +
                            attributesFromInputConfig.analyze.version;
                    }
                    libWiseVersionKey.push({
                        analyze: analyzeKey,
                    });
                    accountIdAttributesCallWise['analyze'] = true;
                }
                if (
                    baseDecoding.includes('s:') ||
                    (tagsCall[count].includes('survey') && !tagManagerEnabled)
                ) {
                    if (tagsCall[count].includes('va_survey_debug') && !tagManagerEnabled) {
                        libWiseVersionKey.push({
                            coreLib:
                                keyForVersionMatching['coreLib'] +
                                //FIXME:  this hardcoded version of js-library will be removed once we fix the survey
                                '7.0',
                        });
                        accountIdAttributesCallWise['coreLib'] = true;
                        extend(true, keyConcatArray, attributesFromInputConfig.coreLib.fileConf);
                        console.log(
                            `${specialBugException}. Ignoring the safari check in case of va_Survey_debug for cloudflare smart code.`
                        );
                        //@ts-ignore
                        keyConcatArray['safari'] = false;
                    }
                    libWiseVersionKey.push({
                        survey:
                            keyForVersionMatching['survey'] +
                            attributesFromInputConfig.survey.version,
                    });
                    accountIdAttributesCallWise['survey'] = true;
                    extend(true, keyConcatArray, { survey: true });
                }
                if (
                    baseDecoding.includes('tr:') ||
                    (tagsCall[count].includes('track') && !tagManagerEnabled)
                ) {
                    libWiseVersionKey.push({
                        track:
                            keyForVersionMatching['track'] +
                            attributesFromInputConfig.track.version,
                    });
                    accountIdAttributesCallWise['track'] = true;
                    extend(true, keyConcatArray, { track: true });
                }
                if (baseDecoding.includes('pc')) {
                    extend(true, keyConcatArray, { pushcrew: true });
                    accountIdAttributesCallWise['pushcrew'] = true;
                }
                if (baseDecoding.includes('worker') || tagsCall[count].includes('worker')) {
                    extend(true, keyConcatArray, { worker: true });
                    //TODO: confirm this with hariom Sir to add this below Line. adding this below line will have to make changes in input config and add the worker library in input config.
                    //accountIdAttributesCallWise['worker'] = true;
                }
                endpointsConfigCallWise[tagsCall[count]].versions = libWiseVersionKey;
                for (const key in keyConcatArray) {
                    if (!key.includes('safari')) {
                        if (keyConcatArray[key]) {
                            keyForCheckingConcatenation.push({ [key]: concatObjectForTags[key] });
                        } else {
                            keyForCheckingConcatenation.push({
                                [key]: '!' + concatObjectForTags[key],
                            });
                        }
                    } else {
                        // ! is a special character of smoke-tests.
                        const keyValue = keyConcatArray[key] ? '!VWO._.jar=null' : 'VWO._.jar=null';
                        keyForCheckingConcatenation.push({ [key]: keyValue });
                    }
                }
                endpointsConfigCallWise[
                    tagsCall[count]
                ].keyForCheckingConcatenation = keyForCheckingConcatenation;
            }
        }
        extend(true, accountIdAttributes, { [calltype]: accountIdAttributesCallWise });
        extend(true, endpointsConfig, { [calltype]: endpointsConfigCallWise });
    }
};


/**
 *
 * @param smartCodeConfigCodeTypeWise : config accordint to the account and codeType wise
 * @param accountId
 * @description: this will return a boolean to check whether the tag manager is enabled for that particualr accountId and for that particular codeType for which the smartCodeConfigCodeTypeWise belongs to.s
 */
export const checkIfTagManagerIsEnabledForThisCodeTypeAndAcc = function (
    smartCodeConfigCodeTypeWise: Record<string, any>,
    accountId: string
): boolean {
    return typeof smartCodeConfigCodeTypeWise.tagManagerEnabled !== 'undefined'
        ? smartCodeConfigCodeTypeWise.tagManagerEnabled
        : inputConfig[accountId].tagManagerEnabled;
};

const gensmartCodeConfig = function gensmartCodeConfig(
    inputConfig,
    accountId: string
): Record<string, any> {
    const anaylseFileConf = inputConfig[accountId].attributes.analyze.fileConf;
    const isOpaNjExpected = !anaylseFileConf.gquery && !anaylseFileConf.jqueryOpa
    return {
        async: {
            urls: [UrlsEnum.jPhp, UrlsEnum.settingsType1, UrlsEnum.settingsType2UrlChange],
            disable: false,
            only: false,
            //TODO: what is this property for ?
            checkFeaturesInCall: [UrlsEnum.jPhp],
            checkCspCompCode: [UrlsEnum.jPhp],
        },
        oldSync: {
            //only: true,
            urls: [UrlsEnum.oldSync],
            // Old Sync doesn't support tag-manager
            tagManagerEnabled: false,
            disable: false,
            exceptions: {
                analyze: {
                    fileConf: {
                        // Old Sync Smart Code doesn't have a case where opanj.js is served(i.e. it never assumes that CoreLib would have gQuery(as gQuery is available in Corelib along with tag-manager only))
                        // This is intentionally not done and won't be done in future as this Smart Code is deprecated.
                        gquery: isOpaNjExpected ? true : anaylseFileConf.gquery,
                    },
                },
            },
        },
        osc: {
            urls: [UrlsEnum.oscLib, UrlsEnum.settingsType2, UrlsEnum.settingsType2UrlChange],
            disable: false,
            only: false,
            checkFeaturesInCall: [UrlsEnum.oscLib],
        },
        asyncPreview: {
            urls: [UrlsEnum.asyncPreview],
            additions: {
                debug: true,
                debuggerUi: true,
            },
            exceptions: {
                coreLib: {
                    // (Missing-Functionality): Async Smart Code Preview Mode doesn't have gQuery support. It is planned to be done very soon.
                    // (Missing-Test): The test framework currently only checks for jQuery version of CoreLib in response.
                    fileConf: {
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            disable: false,
            only: false,
            checkABCampDebugObjInVwoExp: [UrlsEnum.asyncPreview],
            // checkCspCompCode: [UrlsEnum.asyncPreview],
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.asyncPreview],
        },
        surveyPreview: {
            urls: [UrlsEnum.surveyPreview],
            additions: {
                debug: true,
                debuggerUi: true,
            },
            exceptions: {
                coreLib: {
                    // (Missing-Functionality): Async Smart Code Preview Mode doesn't have gQuery support. It is planned to be done very soon.
                    // (Missing-Test): The test framework currently only checks for jQuery version of CoreLib in response.
                    fileConf: {
                        gquery: false,
                        jquery: true,
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            disable: false,
            only: false,
            checkSurveyCampDebugObjInVwoExp: [UrlsEnum.surveyPreview],
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.surveyPreview],
        },
        asyncSharedPreviewLink: {
            urls: [UrlsEnum.asyncSharedPreviewLink],
            additions: {
                debug: false,
                debuggerUi: false,
            },
            exceptions: {
                coreLib: {
                    fileConf: {
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.asyncSharedPreviewLink],
            // checkCspCompCode: [UrlsEnum.asyncSharedPreviewLink],
            disable: false,
            only: false,
        },
        asyncSharedPreviewLinkWithHashParam: {
            urls: [UrlsEnum.asyncSharedPreviewLinkWithHashParam],
            additions: {
                debug: false,
                debuggerUi: false,
            },
            exceptions: {
                coreLib: {
                    fileConf: {
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.asyncSharedPreviewLinkWithHashParam],
            disable: false,
            // checkCspCompCode: [UrlsEnum.asyncSharedPreviewLinkWithHashParam],
            only: false,
        },
        syncPreview: {
            urls: [UrlsEnum.syncPreview],
            additions: {
                debug: true,
                debuggerUi: true,
            },
            exceptions: {
                coreLib: {
                    fileConf: {
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.syncPreview],
            // it will check the debug obj in the call menitoned in the urls. If there are multiple url's then mention the url name in array.
            // If there is only single value in url then please enter the boolean i.e. true, false
            checkABCampDebugObjInVwoExp: [UrlsEnum.syncPreview],
            disable: false,
            only: false,
        },
        heatmapSync: {
            urls: [UrlsEnum.heatmapSync],
            exceptions: {
                coreLib: {
                    fileConf: {
                        gquery: false,
                        jquery: true,
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            additions: {
                heatmap: true,
            },
            checkABCampDebugObjInVwoExp: [UrlsEnum.heatmapSync],
            disable: false,
            only: false,
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.heatmapSync],
            // skip the call when extracting the calls from the response
            skipCallWhenExtractCallFromResponse: ['track'],
        },
        heatmapAsync: {
            urls: [UrlsEnum.heatmapAsync],
            exceptions: {
                coreLib: {
                    fileConf: {
                        gquery: false,
                        jquery: true,
                        safari: !!IS_CLOUDFLARE_CACHING,
                    },
                },
            },
            additions: {
                heatmap: true,
            },
            checkABCampDebugObjInVwoExp: [UrlsEnum.heatmapAsync],
            // checkCspCompCode: [UrlsEnum.heatmapAsync],
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.heatmapAsync],
            disable: false,
            only: false,
        },
        oscSharedPreviewLink: {
            urls: [UrlsEnum.oscSharedPreviewLink],
            additions: {
                debug: false,
                debuggerUi: false,
            },
            addReferrer: true,
            // this key is used to add the osc call i.e. oscSharedPreviewLink in the fileUrl object [fileUrl Object can be found in dacdn-verifier.ts and function name: getResponseAndExtractTagsCall]. It is done as to check the corelib in it and it's various other checks.
            addUrlForChecking: true,
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.oscSharedPreviewLink],
            disable: false,
            only: false,
        },
        oscSharedPreviewLinkWithHashParam: {
            urls: [UrlsEnum.oscSharedPreviewLinkWithHashParam],
            additions: {
                debug: false,
                debuggerUi: false,
            },
            addUrlForChecking: true,
            addReferrer: true,
            checkPreviewCallShouldComeFromNewPreview: [UrlsEnum.oscSharedPreviewLinkWithHashParam],
            disable: false,
            only: false,
        },
    };
};


export const generateUrls = function generateUrls(inputConfig: Record<string, any>, accountId: string): Record<string, any> | void {
    const smartCodeConfAccAndCodeTypeWise: Record<
        string,
        any
    > = filterConfigOnBasisOfOnlyandDisable(filterSmartCodeConfigAccWise(inputConfig, gensmartCodeConfig(inputConfig, accountId), accountId));


    const [fileUrls, sharedPreviewLinkSuffix] = getFileUrls(accountId, inputConfig)

    if (smartCodeConfAccAndCodeTypeWise[UrlsEnum.oscSharedPreviewLink]) {
        smartCodeConfAccAndCodeTypeWise[
            UrlsEnum.oscSharedPreviewLink
        ].refererUrl = `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&osc&${sharedPreviewLinkSuffix}`;
    }
    if (smartCodeConfAccAndCodeTypeWise[UrlsEnum.oscSharedPreviewLinkWithHashParam]) {
        smartCodeConfAccAndCodeTypeWise[
            UrlsEnum.oscSharedPreviewLinkWithHashParam
        ].refererUrl = `https://vwo-jslib-test-website.glitch.me/iframe.html?accountId=${accountId}&osc#${sharedPreviewLinkSuffix}`;
    }

    // eslint-disable-next-line guard-for-in
    for (const callType in smartCodeConfAccAndCodeTypeWise) {
        const callObj = smartCodeConfAccAndCodeTypeWise[callType];
        const urls: string[] = callObj.urls;
        smartCodeConfAccAndCodeTypeWise[callType].urls = {};
        for (let index = 0; index < urls.length; index++) {
            smartCodeConfAccAndCodeTypeWise[callType].urls[urls[index]] = fileUrls[urls[index]];
        }
    }
    return smartCodeConfAccAndCodeTypeWise;
};

export const filterConfigForAccount = function filterConfigForAccount(
    inputConfig,
    accountId: string,
    codeType: string
): Record<string, any> {
    const smartCodeConfAccAndCodeTypeWise: Record<string, any> = {};
    const accountIdAttributes = inputConfig[accountId].attributes;
    const smartCodeConfig = filterSmartCodeConfigAccWise(inputConfig, gensmartCodeConfig(inputConfig, accountId), accountId);
    for (let index = 0; index < smartCodeConfig[codeType].urls.length; index++) {
        const callType = smartCodeConfig[codeType].urls[index];
        smartCodeConfAccAndCodeTypeWise[callType] = {};
        // eslint-disable-next-line guard-for-in
        for (const libraryName in inputConfig[accountId].attributes) {
            const includesArray = accountIdAttributes[libraryName].includedIn;
            for (let index = 0; index < includesArray.length; index++) {
                const callTypeInIncludesArray = includesArray[index];
                if (callType === callTypeInIncludesArray) {
                    const config: Record<string, any> = {};
                    for (const prop in accountIdAttributes[libraryName]) {
                        if (prop !== 'includes') {
                            config[prop] = accountIdAttributes[libraryName][prop];
                        }
                    }
                    const configLibraryWise: Record<string, any> = { [libraryName]: config };
                    if (smartCodeConfAccAndCodeTypeWise[callType]) {
                        extend(true, smartCodeConfAccAndCodeTypeWise[callType], configLibraryWise);
                    } else {
                        extend(true, smartCodeConfAccAndCodeTypeWise, {
                            [callType]: configLibraryWise,
                        });
                    }
                    break;
                }
            }
        }
    }
    if (smartCodeConfig[codeType].exceptions) {
        extend(
            true,
            smartCodeConfAccAndCodeTypeWise[codeType],
            smartCodeConfig[codeType].exceptions
        );
    }
    if (smartCodeConfig[codeType] && smartCodeConfig[codeType].additions) {
        extend(
            true,
            smartCodeConfAccAndCodeTypeWise[codeType],
            smartCodeConfig[codeType].additions
        );
    }
    return smartCodeConfAccAndCodeTypeWise;
};
