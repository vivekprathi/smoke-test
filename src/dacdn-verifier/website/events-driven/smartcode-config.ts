import { SmartCodesEnum } from "../SmartCodesEnum";
import { UrlsEnum } from "../UrlsEnum";

export const smartCodesConfigs = {
    [SmartCodesEnum.async]: {
        /* It decides what calls are required by the SmartCode and thus only those calls are sent */
        // FIXME: As there would be duplicate calls in SmartCodes, we can try to not send those duplicate calls. It should save build time
        urls: [UrlsEnum.jPhp/*, UrlsEnum.settingsType1, UrlsEnum.settingsType2UrlChange*/],
        disable: false,
        only: false
    },
    [SmartCodesEnum.osc]: {
        urls: [UrlsEnum.oscLib],
        disable: false,
        only: false
        //  checkFeaturesInCall: [UrlsEnum.oscLib],
    },
    /*asyncPreview: {
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
    },*/
};