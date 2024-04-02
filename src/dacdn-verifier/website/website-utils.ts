import { FAILED, SKIPPING } from "../../strings";
import { doKeyExistInArr } from '../../test-utils'
import { SmartCodesEnum } from "./SmartCodesEnum";
import { UrlsEnum } from "./UrlsEnum";
const extend = require('extend')
const chalk = require('chalk');
const atob = require('atob');
export const keyForVersionMatching: Record<string, string> = {
    coreLib: 'VWO.v="',
    analyze4: 'VWO.v_o="',
    analyze3: 'VWO.v_o ="',
    track: 'VWO.v_t="',
    survey: 'VWO.v_s="v',
    //debug is for debugger file
    debug: 'VWO_d.v="',
    get_debugger_ui: 'expando',
};

/**
 *
 * @param accessWindow : accessWindow provided by jsdom.
 * @description: will return an object in which there will be a value for a particular feature coming from window object. This will help in CHECKING the features present in the input config for the particular account.
 */
export const getFeatureKeyObject = function (
    accessWindow: Record<string, any>
): Record<string, any> {
    const featureKeyMapping: Record<string, any> = {
        ast: accessWindow.VWO._.ast || false,
        it: accessWindow.VWO._.ac.it ? accessWindow.VWO._.ac.it.toString() : '',
        uct: accessWindow.VWO._.ac.uct ? accessWindow.VWO._.ac.uct.toString() : '',
        dtc: accessWindow.VWO._.dtc || undefined,
        sst: accessWindow.VWO.data.sst || undefined,
        cj: accessWindow.VWO.data.cj || undefined,
    };
    if (typeof featureKeyMapping['sst'] !== 'undefined') {
        featureKeyMapping['sstd'] = accessWindow.VWO.data.sstd;
    }
    return featureKeyMapping;
};

/**
 *
 * @param url : Url to be evaluated
 * @param responseContent : Response content of the particular url
 * @param accountId : current accountID
 * @param accessWindowObject : contains accessWindow and a librarySuccess check to test whether the jsdom evaluation is done correctly or not.
 * @description: It will evaluate the response content of library like j,php or osc. and will pass on a accessWindow which can be used to check the features and values present in VWO._ or VWO.data
 */
export const evaluateResponseUsingJSDOM = (function () {
    //@ts-ignore
    const jsdom = require('jsdom');
    const { JSDOM } = jsdom;
    const smartCode = `<script type='text/javascript'>
    window._vwo_code = window._vwo_code || (function(){
    var settings_tolerance=2000,
    library_tolerance=2500,
    use_existing_jquery=false,
    is_spa=1,
    hide_element='body',
    
    /* DO NOT EDIT BELOW THIS LINE */
    f=false,d=document,code={use_existing_jquery:function(){return use_existing_jquery;},library_tolerance:function(){return library_tolerance;},finish:function(){window.codeFinished=true; if(!f){f=true;var a=d.getElementById('_vis_opt_path_hides');if(a)a.parentNode.removeChild(a);}},finished:function(){return f;},load:function(a){var b=d.createElement('script');b.src=a;b.type='text/javascript';b.innerText;b.onerror=function(){_vwo_code.finish();};d.getElementsByTagName('head')[0].appendChild(b);},init:function(){
    window.settings_timer=setTimeout('_vwo_code.finish()',settings_tolerance);var a=d.createElement('style'),b=hide_element?hide_element+'{opacity:0 !important;filter:alpha(opacity=0) !important;background:none !important;}':'',h=d.getElementsByTagName('head')[0];a.setAttribute('id','_vis_opt_path_hides');a.setAttribute('type','text/css');if(a.styleSheet)a.styleSheet.cssText=b;else a.appendChild(d.createTextNode(b));h.appendChild(a);return settings_timer; }};window._vwo_settings_timer = code.init(); return code; }());
    </script>`;
    return function evaluateResponseUsingJSDOM(
        url: string,
        responseContent: string,
        accountId: string,
        accessWindowObject: Record<string, any>,
        shouldCheckforCodeFinish?: boolean
    ): void {
        let evaluatingLibrarySuccess = true;
        const dom = new JSDOM(`<body>${smartCode}</body>`, { runScripts: 'dangerously' });
        let accessWindow = dom.window;
        if (url.includes(`lib/${accountId}.js`)) {
            const { window } = new JSDOM(``, { runScripts: 'outside-only', url: 'http://localhost' });
            accessWindow = window;
        }
        try {
            accessWindow.eval(responseContent);
        } catch (err) {
            console.error(
                `${FAILED} Error occured in evaluating the responseContent for Endpoint ${url}. Error is : ${err}`
            );
            evaluatingLibrarySuccess = false;
        }
        if (shouldCheckforCodeFinish && accessWindow.window.codeFinished) {
            console.error(
                `${FAILED}. VWO Code finished while executing the url : ${url} for account Id : ${accountId}. `
            );
            evaluatingLibrarySuccess = false;
        }
        if (responseContent && responseContent.length < 100) {
            console.error(
                `${FAILED}. Response Content length was not greater than 100 for url : ${url} for account Id: ${accountId}. Please check the url. There might be an issue.`
            );
            evaluatingLibrarySuccess = false;
        }
        extend(true, accessWindowObject, {
            evaluatingLibrarySuccess: evaluatingLibrarySuccess,
            accessWindow: accessWindow,
        });
    };
})();


/**
 *
 * @param accessWindow JSDOM access Window
 * @param accountId : account ID
 * @param codeType : i.e. it can be async, osc, async heatmap, osc heatmap, osc preview, osc heatmap
 * @param callType : type of the call i.e. it can be j.php, osc-library call, setting.js type 1 , setting.js type2 and others.
 * @description : It will check all the features present in the input config for particular account Id with those present in accessWindow.VWO. accessWindow is available from JSDOM while passing the j.php or osc content.
 */
export const checkFeatureInResponse = function (
    filteredInputConfig,
    accessWindow: Record<string, any>,
    accountId: string,
    codeType: string,
    callType: string
): boolean {
    let featureCheckSuccess = true;
    const featureKeyMapping = getFeatureKeyObject(accessWindow);
    const accountIdAttributes = filteredInputConfig[accountId].features;
    const cjVal = filteredInputConfig[accountId].cj_val;
    // ignoring the case for dtc i.e. dt and dtd
    for (const featureName in accountIdAttributes) {
        if (Object.hasOwnProperty.call(featureKeyMapping, featureName)) {
            const featureValue = featureKeyMapping[featureName];
            const featureValueFromInputConfig = accountIdAttributes[featureName];
            if (!!featureValue !== !!featureValueFromInputConfig) {
                console.error(
                    chalk.red(
                        `${FAILED} Feature value do not match for the feature name : ${featureName}. Expected Value: ${featureValueFromInputConfig}, Value Received:${featureValue} `
                    )
                );
                featureCheckSuccess = false;
            }
        }
    }
    //CHECKING for cj value
    if (accountIdAttributes['cj']) {
        if (JSON.stringify(featureKeyMapping['cj']) !== JSON.stringify(cjVal)) {
            console.error(
                chalk.red(
                    `${FAILED} Third party cookie jar config does not match: Expected Value: ${cjVal}, Value Received:${featureKeyMapping['cj']} `
                )
            );
            featureCheckSuccess = false;
        }
    }
    // CHECKING for dtc
    if (accountIdAttributes['dt'].toLowerCase() === 'off') {
        if (featureKeyMapping['dtc']) {
            console.error(
                `${FAILED} Dtc object exist in callType: ${callType}, codeType: ${codeType} and for accountid: ${accountId}`
            );
            featureCheckSuccess = false;
        }
    } else {
        const dtcObject = featureKeyMapping['dtc'];
        if (callType.includes(UrlsEnum.oscLib)) {
            console.log(
                chalk.magenta(
                    `${SKIPPING} Skipping the dtc check for callType: ${callType} and codeType ${codeType} and for accountID : ${accountId}`
                )
            );
        } else if (!dtcObject) {
            console.error(
                `${FAILED}. DTC object does not exist for accountID: ${accountId} and for codeType: ${codeType} and for callType: ${callType}`
            );
            featureCheckSuccess = false;
        } else {
            const dtcJsFunction =
                dtcObject.js[dtcObject.ctId] && dtcObject.js[dtcObject.ctId].toString();
            const dtcSegmentCode = dtcObject.sC && dtcObject.sC.toString();
            if (!dtcJsFunction.includes(accountIdAttributes['dtd'])) {
                console.error(
                    chalk.red(
                        `${FAILED}. Failed dtc expectation for accountId: ${accountId} and for codeType ${codeType} and for callType: ${callType}`
                    )
                );
                featureCheckSuccess = false;
            }
            if (!dtcSegmentCode.includes(accountIdAttributes['dt'])) {
                console.error(
                    chalk.red(
                        `${FAILED}. Failed dtc expectation for accountId: ${accountId} and for codeType ${codeType}.`
                    )
                );
                featureCheckSuccess = false;
            }
        }
    }
    return featureCheckSuccess;
};

export const extractUrlFromResponse = function extractUrlFromResponse(
    response: string,
    codeType: string,
    smartCodeConfigCodeTypeWise: Record<string, any>
): any {
    // https://regexr.com/57hke // test your reg-Ex here
    // contains the file url of the file present in j.php
    // let filesUrl: any = response.match(/(https?:\/|web|([0-9].[0-9]))\/[.a-zA-Z0-9_\/=:-]*\.js/g);
    let filesUrl: any = response.match(
        /(https?:\/|web|((dev\.visualwebsiteoptimizer\.com\/[.a-zA-Z]*)|([0-9].[0-9])))\/[.a-zA-Z0-9_\/=:-]*\.js/g
    );
    if (filesUrl) {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        filesUrl = filesUrl.filter((key: string) => {
            let removeKey = false;
            if (key.includes('vanj')) {
                removeKey = true;
            }
            const skipCallWhenExtractCallFromResponse =
                smartCodeConfigCodeTypeWise.skipCallWhenExtractCallFromResponse;
            if (skipCallWhenExtractCallFromResponse) {
                removeKey = doKeyExistInArr(skipCallWhenExtractCallFromResponse, key, true);
                if (removeKey) {
                    console.log(
                        chalk.magenta(
                            `${SKIPPING}. SKipping the key : ${key} for codeType: ${codeType}. `
                        )
                    );
                }
            }
            // if (key.includes('vanj') && !inputConfig[accountId].attributes.use_existing_jquery) {
            //     removeKey = true;
            // }
            // if (key.includes('va') && inputConfig[accountId].attributes.use_existing_jquery) {
            //     removeKey = true;
            // }
            const decodedFileName = atob(
                key.substring(key.indexOf('web/' + 4), key.lastIndexOf('/'))
            );
            if (decodedFileName.includes('te:')) {
                if (!decodedFileName.includes('gquery') && !decodedFileName.includes('jquery')) {
                    removeKey = true;
                }
            }
            if (key.includes('app.vwo.com')) {
                removeKey = true;
            }
            return !removeKey;
        });
    }
    if (codeType === SmartCodesEnum.oldSync) {
        //@ts-ignore
        const tempFileurl: any = response.match(
            /(dev.visualwebsiteoptimizer.com\/vis_opt_survey-[a-zA-Z0-9]*.js)/g
        );
        filesUrl = filesUrl || [];
        if (tempFileurl) {
            filesUrl.push(tempFileurl[0]);
        }
        //@ts-ignore
    }
    if (codeType === SmartCodesEnum.surveyPreview) {
        const tempFileurl = response.match(/(va_survey_debug-[0-9]*.js)/g);
        filesUrl = filesUrl || [];
        if (tempFileurl) {
            filesUrl.push(tempFileurl[0]);
        }
    }
    return filesUrl;
};