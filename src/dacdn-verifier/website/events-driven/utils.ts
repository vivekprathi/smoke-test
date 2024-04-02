import { extend, getFile, isEmpty } from "../../../test-utils";
import { log } from "../../../log";
import { FAILED } from "../../../strings";
import { BASE_URL } from "../../../env";
import { UrlsEnum } from "../UrlsEnum";
import crypto = require('crypto');

const chalk = require('chalk');

const md5 = function (str: string): string {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
};

export function getFileUrls(accountId, inputConfig) {
    function createPreviewModeObj(
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
    }

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
            createPreviewModeObj('preview', inputConfig[accountId].surveyPreviewObject, accountId)
        )
        : '';

    // TODO: previewmode obj
    const previewModeUrlForAsync = inputConfig[accountId].previewObject
        ? encodeURIComponent(
            createPreviewModeObj('preview', inputConfig[accountId].previewObject, accountId)
        )
        : '';
    const heatmapModeUrlForAsync = inputConfig[accountId].heatmapObject
        ? encodeURIComponent(
            createPreviewModeObj('heatmap', inputConfig[accountId].heatmapObject, accountId)
        )
        : '';
    const heatmapModeUrlForSync = inputConfig[accountId].heatmapObject
        ? encodeURIComponent(
            createPreviewModeObj('heatmap', inputConfig[accountId].heatmapObject, accountId)
        )
        : '';
    const previewModeUrlForSync = inputConfig[accountId].previewObject
        ? encodeURIComponent(
            createPreviewModeObj(
                'preview',
                inputConfig[accountId].previewObject,
                accountId,
                urlEncodedForSync,
                inputConfig[accountId].campaignId
            )
        )
        : '';
    const fileUrls: Record<string, string> = {
        [UrlsEnum.jPhp]: `${BASE_URL}/j.php?a=${accountId}&u=${urlEncodedForAsync}&f=1&eventArch=1`,
        [UrlsEnum.oldSync]: `${BASE_URL}/deploy/js_visitor_settings.php?a=${accountId}&url=${urlEncodedForOldSync}`,
        [UrlsEnum.asyncPreview]: `${BASE_URL}/j.php?mode=${previewModeUrlForAsync}&a=${accountId}&f=1&u=${urlEncodedForAsync}`,
        [UrlsEnum.surveyPreview]: `${BASE_URL}/j.php?mode=${surveyPreviewModeForAsync}&a=${accountId}&u=${urlEncodedForAsync}&f=1`,
        [UrlsEnum.asyncSharedPreviewLink]: `${BASE_URL}/j.php?a=${accountId}&u=${asyncPreviwSharedLinkUrlEncoded}`,
        [UrlsEnum.asyncSharedPreviewLinkWithHashParam]: `${BASE_URL}/j.php?a=${accountId}&u=${asyncPreviwSharedLinkUrlEncodedWitHashParam}`,
        // special case : In this particular scenario while fetching the response we pass the referer in header.
        [UrlsEnum.oscSharedPreviewLink]: `${BASE_URL}/lib/${accountId}.js`,
        [UrlsEnum.oscSharedPreviewLinkWithHashParam]: `${BASE_URL}/lib/${accountId}.js`,
        [UrlsEnum.heatmapAsync]: `${BASE_URL}/j.php?mode=${heatmapModeUrlForAsync}&a=${accountId}&u=${urlEncodedForAsync}&f=1`,
        [UrlsEnum[UrlsEnum.oscLib]]: `${BASE_URL}/lib/${accountId}.js?eventArch=1`,
        [UrlsEnum.syncPreview]: `${BASE_URL}/lib/${accountId}.js?mode=${previewModeUrlForSync}&u=${urlEncodedForSync}&a=${accountId}&f=1`,
        // special case in which the code is osc but the mode call in heatmap goes to j,php
        [UrlsEnum.heatmapSync]: `${BASE_URL}/lib/${accountId}.js?mode=${heatmapModeUrlForSync}&u=${urlEncodedForOldSync}`,
        [UrlsEnum.settingsType1]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=1&r=${Math.random()}`,
        [UrlsEnum.settingsType2]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=2&u=${urlEncodedForSync}&r=${Math.random()}`,
        [UrlsEnum.settingsType2UrlChange]: `${BASE_URL}/settings.js?a=${accountId}&settings_type=2&r=${Math.random()}&u=${changedUrlEncoded}`,
    };
    return [fileUrls, sharedPreviewLinkSuffix];
}
//FIXME: make it more clear and and fix the statement for error


export async function matchWithAccountCache(filteredInputConfig, accountId: string): Promise<boolean> {
    let matchingPassed = true;

    log.verbose(
        `Checking the account features like: dtc, ast and others for accountId: ${accountId} present in the get_cache_core with those present in the input config  `
    );

    console.log(chalk.cyanBright(`Generating account cache for account id: ${accountId}`));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line no-unused-vars
    const getAccCacheUrl = BASE_URL + '/get_cache_core?k=' + accountId + '&c=accountsettings&u=sparshgupta&p=121285';
    //@ts-ignore
    log.log(`Getting account cache for account id: ${accountId}`);
    const response = await getFile(getAccCacheUrl, 'null', 'null', 'null', {});
    let serverResponse = '';

    try {
        serverResponse = await response.text();
    } catch (err) {
        log.fail(
            `Error is ${err}, content is not readable for endpoint: ${getAccCacheUrl}. Status code is ${response.status}`
        );
        matchingPassed = false;
        return false;
    }
    let parsedServerResponse = await JSON.parse(serverResponse)

    var isParsedResponseEmpty = isEmpty(parsedServerResponse)
    var isAcNotInMemcache = false
    var isAcNotInNginx = false

    if(!isParsedResponseEmpty){
        if((parsedServerResponse['memc']) && !(JSON.parse(parsedServerResponse['memc']).ac)){
            isAcNotInMemcache = true
        }
        if((parsedServerResponse['nginx']) && !(JSON.parse(parsedServerResponse['nginx']).ac)){
            isAcNotInNginx = true
        }
    }
   
    if(isParsedResponseEmpty || (isAcNotInMemcache && isAcNotInNginx)) {
        const md5sECRET = md5('R3dCh3rry08'+ accountId +'_@R3dCh3rry08')
        const purgeAccCacheUrl =  BASE_URL + '/purge_account_settings?s=' + md5sECRET + '&a=' + accountId;
        console.log(
            chalk.blue(
                `Account settings is empty for accountId: ${accountId}. Purging the account cache and retrying to get the account settings: ${purgeAccCacheUrl}`
            )
        )
        const success  = await getFile(purgeAccCacheUrl, 'null', 'null', 'null', {});
        if (success) {
            const reFetchAccountSettings = await getFile(getAccCacheUrl, 'null', 'null', 'null', {});
            const textReFetchAccountSettings = await reFetchAccountSettings.text()
            parsedServerResponse = JSON.parse(textReFetchAccountSettings)
        }
    }

    var accConfig: any = {};
    const memcache = parsedServerResponse['memc'];
    try {
        if (memcache) {
            accConfig = JSON.parse(memcache).ac;
        } else {
            const nginxValueFromCall = parsedServerResponse['nginx']
            if (nginxValueFromCall) {
                accConfig = JSON.parse(nginxValueFromCall).ac;
            }
        }
    } catch (err) {
        log.fail(`${FAILED}. Something went wrong. Error is ${err}`);
        return false;
    }
    if (isEmpty(accConfig)) {
        log.fail(
            `${FAILED}. AccConfig object is empty for accountId: ${accountId}. Cannot iterate furthur. Please check the url: ${getAccCacheUrl}`
        );
        return false;
    }
    //@ts-ignore
    //@ts-ignore
    const inputConfigAccWise = filteredInputConfig[accountId].features;
    // eslint-disable-next-line guard-for-in
    for (const key in inputConfigAccWise) {
        // eslint-disable-next-line guard-for-in
        if (accConfig[key] != undefined) {
            if (accConfig[key] !== inputConfigAccWise[key]) {
                // throw error
                log.fail(
                    `Features: key value mismatch and key is ${key} for accountId: ${accountId}. Key Value Expectation is ${inputConfigAccWise[key]} and value received is ${accConfig[key]} `
                );
                matchingPassed = false;
            }
        } else {
            log.fail(`key: ${key} does not exist on the prod`);
            matchingPassed = false;
        }
    }
    if (matchingPassed) {
        log.success(
            `Checked the account Id features for the accountId: ${accountId}. `
        );
    }
    return matchingPassed;
}
/**
 * @description: Filtering the config on basis of only and disable present in the input config.
 */
export function filterConfigOnBasisOfOnlyandDisable(
    config: Record<string, any>
): Record<string, any> {
    /*const args = minimist(process.argv);

    if (!args.localRun) {
        //@ts-ignore
        return config;
    }*/
    let tempConfig: Record<string, any> = {};
    for (const prop in config) {
        if (config[prop].only) {
            tempConfig = {};
            extend(true, tempConfig, { [prop]: config[prop] });
            break;
        } else if (!config[prop].disable) {
            extend(true, tempConfig, { [prop]: config[prop] });
        }
    }
    return tempConfig;
}


export function generateUrls(inputConfig: Record<string, any>, smartCodesConfigs, accountId) {
    const filteredSmartCodesConfig = filterConfigOnBasisOfOnlyandDisable(smartCodesConfigs);
    const [fileUrls] = getFileUrls(accountId, inputConfig);
    // eslint-disable-next-line guard-for-in
    for (const smartCodeName in filteredSmartCodesConfig) {
        const smartCodeConfig = filteredSmartCodesConfig[smartCodeName];
        const urls: string[] = smartCodeConfig.urls;
        smartCodeConfig.urls = {};
        for (let index = 0; index < urls.length; index++) {
            smartCodeConfig.urls[urls[index]] = fileUrls[urls[index]];
        }
    }
    return filteredSmartCodesConfig;
}
/**
 * It is the main function that takes care of `only` and `disable` flags and provides a callback per account per SmartCode configured
 * @param inputConfig
 * @param perAccountPerSmartCodeCallBack
 */

export async function main(tests, smartCodesConfigs, perAccountPerSmartCodeCallBack): Promise<boolean> {
    let testSuccess = true;
    const filteredInputConfig: Record<string, any> = filterConfigOnBasisOfOnlyandDisable(tests);
    log.log(`Verifying various smart codes with various features enabled.`);
    function ensureAllProperties(smartCodesConfigs, testConfigs, accountId, codeType) {
        const smartCodeConfig = smartCodesConfigs[codeType];
        const testConfig = testConfigs[accountId];
        smartCodeConfig._codeType = codeType;
        testConfig._accountId = accountId;
        testConfig.urls = testConfig.urls || {};
    }
    const allResults: any[] = [];
    for (const accountId in filteredInputConfig) {
        log.log(`\n\nRunning test cases for account ${accountId}`);

        // eslint-disable-next-line no-await-in-loop
        const matchSuccess = await matchWithAccountCache(filteredInputConfig, accountId);
        if (!matchSuccess) {
            log.fail('Account Cache doesnt match expectations');
            testSuccess = false;
            break;
        }
        //@ts-ignore
        const smartCodeConfigAccountWise: Record<string, any> = generateUrls(tests, smartCodesConfigs, accountId);
        if (!smartCodeConfigAccountWise) {
            log.fail('No Smart Code Config could be found');
            testSuccess = false;
            break;
        }
        for (const codeType in smartCodeConfigAccountWise) {
            log.log(`Testing SmartCode ${codeType}`);
            ensureAllProperties(smartCodeConfigAccountWise, tests, accountId, codeType);
            // eslint-disable-next-line no-await-in-loop
            allResults.push(await perAccountPerSmartCodeCallBack(tests[accountId], smartCodeConfigAccountWise[codeType]));

            /*const attributesAccToCodeType = await generator(
                filteredInputConfig,
                accountId,
                codeType,
                smartCodeConfigAccountWise[codeType]
            );*/
            //if (attributesAccToCodeType) {
            //testLibraryExists(filteredInputConfig, accountId, attributesAccToCodeType, codeType);
            //}
            //await shouldWait(0);
        }
    }
    log.verbose('All Results in Boolean', allResults);
    allResults.forEach(function (result) {
        testSuccess = testSuccess && result;
    });

    if (!testSuccess) {
        log.warn(`Test cases failed`);
    } else {
        log.success('All test cases passed');
    }
    return testSuccess;
}
