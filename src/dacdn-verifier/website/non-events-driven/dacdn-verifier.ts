/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable sort-imports */
import { concatenationCheck, getFile, isEmpty, doKeyExistInArr } from '../../../test-utils';
import { inputConfig, protocol } from './tests';
import crypto = require('crypto');
import {
    generateEndpointsConfig,
    checkIfTagManagerIsEnabledForThisCodeTypeAndAcc,
    filterConfigForAccount,
    generateUrls,
} from './utils';
import { CHECKED, CHECKING, FAILED, PASSED, SKIPPING, WARNING } from '../../../strings';
import { checkFeatureInResponse, evaluateResponseUsingJSDOM, extractUrlFromResponse } from '../website-utils';
import { filterConfigOnBasisOfOnlyandDisable } from '../../utils';
import { BASE_URL, HOSTNAME } from '../../../env';
import { UrlsEnum } from '../UrlsEnum';
import { log } from '../../../log';
const extend = require('extend');

const chalk = require('chalk');
let testSuccess = true;

const md5 = function (str: string): string {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
};

function delay(ms: number): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function shouldWait(time: number): Promise<void> {
    await delay(time);
}

const improvedDescForExpectationMismatch = function improvedDescForExpectationMismatch(
    // what is our expectation
    expectationAccToInputConfig: any,
    // what we got in the code
    valueGotInCode: any
): Record<string, any> {
    // this present key is set according to expectation written in the input config.
    const expectationPresentKey = expectationAccToInputConfig ? 'be present' : 'not be present';
    // this present key is calculated from the code while evaluating the responses.
    const presentKey = valueGotInCode ? 'is present' : 'is not present';
    return {
        presentKey: presentKey,
        expectationPresentKey: expectationPresentKey,
    };
};

const doCspCompCodeExist = function (accessWindowObject: any, expId: string): boolean {
    let cspCompCodeExist = true;
    const expObject = accessWindowObject.accessWindow && accessWindowObject.accessWindow._vwo_exp;
    if (!(expObject && expObject[expId])) {
        return false;
    }
    let expGlobalCode = expObject[expId].globalCode;
    // SPECIAL CASE: WILL CONFIRM THIS FROM HARIOM SIR.
    if (isEmpty(expGlobalCode)) {
        expGlobalCode = false;
    }
    if (!!expGlobalCode !== !!expObject[expId].cspCompGlobalCode) {
        const descObject = improvedDescForExpectationMismatch(
            !!expGlobalCode,
            !!expObject[expId].cspCompGlobalCode
        );
        console.log(
            `${FAILED}. Expectation mismatch. Csp Global code do not match with  global Code. Csp comp Global code should ${descObject.expectationPresentKey}. As global Code ${descObject.presentKey} `
        );
        cspCompCodeExist = false;
    } else {
        console.log(
            `${PASSED}. Expectation passed for global Code and csp Compatible global code. GLobal code is ${expGlobalCode ? 'present' : 'not present'
            } and cspGlobalCode is also ${expObject[expId].cspCompGlobalCode ? 'present' : 'not present'
            }`
        );
    }
    const segment_code = !!expObject[expId].segment_code;
    const cspSegmentCode = !!expObject[expId].cspCompSegmentCode;
    if (segment_code !== cspSegmentCode) {
        const descObject = improvedDescForExpectationMismatch(segment_code, cspSegmentCode);
        console.log(
            `${FAILED}. Expectation mismatch. Csp Segment code do not match with  segment Code. Csp comp segment code should ${descObject.expectationPresentKey}. As segment Code ${descObject.presentKey} `
        );
        cspCompCodeExist = false;
    } else {
        console.log(
            `${PASSED}. Expectation passed for segment Code and csp Compatible segment code. Segment code is ${segment_code ? 'present' : 'not present'
            } and  csp Compatible segment code is also ${cspSegmentCode ? 'present' : 'not present'
            }`
        );
    }
    const variationCode = !!expObject[expId].sections[1].variations;
    const cspCompVarCode = !!expObject[expId].sections[1].cspCompVariations;
    if (variationCode !== cspCompVarCode) {
        const descObject = improvedDescForExpectationMismatch(variationCode, cspCompVarCode);
        console.log(
            `${FAILED}. Expectation mismatch. Csp variation code do not match with  variation Code. Csp comp variation code should  ${descObject.expectationPresentKey}. As variation Code ${descObject.presentKey} `
        );
        cspCompCodeExist = false;
    } else {
        console.log(
            `${PASSED}. Expectation passed for variation Code and csp Compatible variation code. variation code is ${variationCode ? 'present' : 'not present'
            } and  csp Compatible variation code is also ${cspCompVarCode ? 'present' : 'not present'
            }`
        );
    }
    return cspCompCodeExist;
};

function checkOutput(endpointsConfig: Record<string, any>): void {
    const keyForCheckingFileConcatenation = endpointsConfig.keyForCheckingConcatenation;
    const endpoint = endpointsConfig.endpoint;
    let concatenationSuccess = true;
    let concatenationVersionSuccess = true;
    if (keyForCheckingFileConcatenation) {
        concatenationSuccess = concatenationCheck(
            endpointsConfig.responseContent,
            endpoint,
            keyForCheckingFileConcatenation
        );
    }
    if (!isEmpty(endpointsConfig.versions)) {
        concatenationVersionSuccess = concatenationCheck(
            endpointsConfig.responseContent,
            endpoint,
            endpointsConfig.versions
        );
    }
    if (!concatenationSuccess || !concatenationVersionSuccess) {
        testSuccess = false;
    }
}
// eslint-disable-next-line require-await
async function feedConfigToCheckOutput(
    accountId: string,
    endpointsConfig: Record<string, any>
): Promise<void> {
    // eslint-disable-next-line guard-for-in
    for (const callType in endpointsConfig) {
        console.log(chalk.blue(`${CHECKING}. Content Checking for callType: ${callType}`));
        const filesUrl = endpointsConfig[callType];
        if (!isEmpty(filesUrl)) {
            // eslint-disable-next-line guard-for-in
            for (const fileUrl in filesUrl) {
                filesUrl[fileUrl].accountId = accountId;
                // Please add endpoint as "present in the BASE_URL"
                if (!fileUrl.includes(HOSTNAME)) {
                    let tempfileUrl = fileUrl;
                    // special case in case of old sync
                    if (fileUrl.includes('dev.visualwebsiteoptimizer.com')) {
                        tempfileUrl = fileUrl.split('dev.visualwebsiteoptimizer.com/')[1];
                    }
                    filesUrl[fileUrl].endpoint = BASE_URL + '/' + tempfileUrl;
                } else {
                    const httpPattern = fileUrl.match(/https?/g);
                    if (!httpPattern) {
                        filesUrl[fileUrl].endpoint = protocol + fileUrl;
                    } else {
                        filesUrl[fileUrl].endpoint = fileUrl;
                    }
                }
                // eslint-disable-next-line no-await-in-loop
                filesUrl[fileUrl].response = await getFile(
                    filesUrl[fileUrl].endpoint,
                    'null',
                    'null',
                    'null',
                    {}
                );
                try {
                    // eslint-disable-next-line no-await-in-loop
                    filesUrl[fileUrl].responseContent = await filesUrl[fileUrl].response.text();
                } catch (err) {
                    console.error(
                        `${FAILED} Error is ${err}. Content is not readable for endpoint fileUrl. Status code is ${filesUrl[fileUrl].response.status}`
                    );
                    testSuccess = false;
                }
                checkOutput(filesUrl[fileUrl]);
            }
        }
        console.log(chalk.blue(`${CHECKED}. Content CHECKED for callType: ${callType}`));
    }
}
async function getResponseAndExtractTagsCall(
    filteredInputConfig,
    accountId: string,
    callType: string,
    filesUrls: Record<string, any>,
    codeType: string,
    smartCodeConfigCodeTypeWise: Record<string, any>
): Promise<void> {
    const url = filesUrls[callType];
    let referrer;
    if (smartCodeConfigCodeTypeWise.addReferrer) {
        referrer = {
            url: smartCodeConfigCodeTypeWise.refererUrl,
        };
    }
    //@ts-ignore
    const response = await getFile(url, null, null, null, {}, referrer);
    let responseContent = '';
    try {
        responseContent = await response.text();
    } catch (err) {
        console.error(
            `${FAILED} Error is  ${err}  Content is not readable for endpoint: ${url}  Status code is ${response.status}`
        );
        testSuccess = false;
    }
    const tagsCall = extractUrlFromResponse(responseContent, codeType, smartCodeConfigCodeTypeWise);
    if (doKeyExistInArr(smartCodeConfigCodeTypeWise.checkFeaturesInCall, callType)) {
        const accessWindowObject: Record<string, any> = {};
        evaluateResponseUsingJSDOM(url, responseContent, accountId, accessWindowObject, true);
        if (!accessWindowObject.evaluatingLibrarySuccess) {
            testSuccess = false;
            console.error(
                chalk.magenta(
                    `${SKIPPING}. Skipping the further feature checking as due to error occured while evaluating the window object using jsdom`
                )
            );
        } else {
            const featureCheckSuccess = checkFeatureInResponse(
                filteredInputConfig,
                accessWindowObject.accessWindow,
                accountId,
                codeType,
                callType
            );
            if (!featureCheckSuccess) {
                testSuccess = false;
            } else {
                console.log(
                    `${CHECKED}. Checked the features in the call: ${callType}. It ${PASSED} according to the expectation present in the input config `
                );
            }
            if (!tagsCall) {
                console.error(
                    `${WARNING} There is no tagsCall in codetype: ${callType} and endpoint is ${url}`
                );
                testSuccess = false;
            }
        }
    }
    // checking the debug in _vwo_exp for heatmap and preview
    //FIXMEE: remove this hardcoded check and instead do it from config.
    //@ts-ignore
    const accessWindowObject: Record<string, any> = {};
    evaluateResponseUsingJSDOM(url, responseContent, accountId, accessWindowObject);
    if (!accessWindowObject.evaluatingLibrarySuccess) {
        testSuccess = false;
        console.error(
            chalk.magenta(
                `${FAILED}.  error occurred while evaluating the window object using jsdom`
            )
        );
    }
    const isNewPreview =
        accessWindowObject.accessWindow && accessWindowObject.accessWindow._vwo_isNewPreview;
    const expObject = accessWindowObject.accessWindow && accessWindowObject.accessWindow._vwo_exp;
    const ABcampaignId = inputConfig[accountId]['a/bCampaignId'];
    const splitCampaignId = inputConfig[accountId].splitCampaignId;
    const checkCspCompCode = doKeyExistInArr(
        smartCodeConfigCodeTypeWise.checkCspCompCode,
        callType
    );
    if (ABcampaignId) {
        if (
            inputConfig[accountId].features['csp'] &&
            checkCspCompCode &&
            !!checkCspCompCode !== !!doCspCompCodeExist(accessWindowObject, ABcampaignId)
        ) {
            console.error(
                `${FAILED}. Failed. CSP compatible Code do not exist in callType ${callType} for accountId: ${accountId} and for campaign: A/B`
            );
        } else {
            console.log(
                `${CHECKED}. Checked the Csp compatible expectation in call: ${callType} and for accountId: ${accountId} and for campaign: A/B. It should ${checkCspCompCode ? 'be present' : 'not be present'
                }`
            );
        }
    }
    if (splitCampaignId) {
        if (
            inputConfig[accountId].features['csp'] &&
            checkCspCompCode &&
            !!checkCspCompCode !== !!doCspCompCodeExist(accessWindowObject, splitCampaignId)
        ) {
            console.error(
                `${FAILED}. Failed. CSP compatible Code do not exist in callType ${callType} for accountId: ${accountId} and for campaign: SPLIT`
            );
        } else {
            console.log(
                `${CHECKED}. Checked the Csp compatible expectation in call: ${callType} and for accountId: ${accountId} and for campaign: SPLIT. It should ${checkCspCompCode ? 'be present' : 'not be present'
                }`
            );
        }
    }

    // const splitCampaignId = inputConfig[accountId]['splitCampaignId'];
    // will add this check afterwards
    // if (ABcampaignId && !expObject[ABcampaignId]) {
    //     console.error(
    //         chalk.red(
    //             `${failed}. Failed. Campaign Id: ${ABcampaignId}  do not exist in the _Vwo_Exp for callType: ${callType} and for codeType: ${codeType}`
    //         )
    //     );
    // }
    // const splitCampaignDebugObjFromVwoExp =
    //     expObject && expObject[splitCampaignId] && expObject[splitCampaignId].debug;
    const surveycampaignId = inputConfig[accountId].surveyCampaignId;
    const surveyCampdebugObjfromVwoExp =
        expObject && expObject[surveycampaignId] && expObject[surveycampaignId].debug;
    const ABCAMPdebugObjfromVwoExp =
        expObject && expObject[ABcampaignId] && expObject[ABcampaignId].debug;
    const surveyCampdebugObjfrominputConfig = doKeyExistInArr(
        smartCodeConfigCodeTypeWise.checkSurveyCampDebugObjInVwoExp,
        callType
    );
    if (!!surveyCampdebugObjfromVwoExp !== !!surveyCampdebugObjfrominputConfig) {
        const descObj = improvedDescForExpectationMismatch(
            surveyCampdebugObjfrominputConfig,
            surveyCampdebugObjfromVwoExp
        );
        console.error(
            chalk.red(
                `${FAILED} .{SURVEY-CAMAPIGN} Expectation did not match for checking the debug obj for call: ${callType}. Expectation: Debug Object should ${descObj.expectationPresentKey} but while checking in the code debug object ${descObj.presentKey}`
            )
        );
        testSuccess = false;
    } else if (surveyCampdebugObjfromVwoExp) {
        console.log(
            chalk.magenta(
                `${CHECKED}.{SURVEY-CAMAPIGN} Debug object exist in the url: ${url} for call : ${callType} and for code: ${codeType}`
            )
        );
    }
    const checkCallShouldComeFromNewPreview = doKeyExistInArr(
        smartCodeConfigCodeTypeWise.checkPreviewCallShouldComeFromNewPreview,
        callType
    );
    if (!!isNewPreview !== !!checkCallShouldComeFromNewPreview) {
        const descObj = improvedDescForExpectationMismatch(
            checkCallShouldComeFromNewPreview,
            isNewPreview
        );
        console.error(
            chalk.red(
                `${FAILED} . Expectation did not match for checking the new Preview key i.e. {_vwo_isNewPreview} for call: ${callType}. Expectation: New Preview key should ${descObj.expectationPresentKey} but while checking in the code new preview key ${descObj.presentKey}`
            )
        );
        testSuccess = false;
    } else {
        const descObj = improvedDescForExpectationMismatch(
            checkCallShouldComeFromNewPreview,
            isNewPreview
        );
        console.log(
            `${CHECKED}. Checked the new preview key for callType: ${callType} and for codeType: ${codeType} .Expectation: key should ${descObj.expectationPresentKey}. Actual[Mentioned in the input config]: ${descObj.presentKey}  `
        );
    }
    const debugObjExpFromInputConf = doKeyExistInArr(
        smartCodeConfigCodeTypeWise.checkABCampDebugObjInVwoExp,
        callType
    );
    if (!!ABCAMPdebugObjfromVwoExp !== !!debugObjExpFromInputConf) {
        const descObj = improvedDescForExpectationMismatch(
            debugObjExpFromInputConf,
            ABCAMPdebugObjfromVwoExp
        );
        console.error(
            chalk.red(
                `${FAILED} . {A/B-CAMAPIGN} Expectation did not match for checking the debug obj for call: ${callType}. Expectation: Debug Object should ${descObj.expectationPresentKey} but while checking in the code debug object ${descObj.presentKey}`
            )
        );
        testSuccess = false;
    } else if (ABCAMPdebugObjfromVwoExp) {
        console.log(
            chalk.magenta(
                `${CHECKED}. {A/B-CAMAPIGN} Debug object exist in the url: ${url} for call : ${callType} and for code: ${codeType}`
            )
        );
    }
    //special case for osc preview and heatmap call
    if (
        url.includes(`lib/${accountId}.js?mode=`) ||
        smartCodeConfigCodeTypeWise.addUrlForChecking
    ) {
        tagsCall.push(url);
    }
    filesUrls[callType] = {};
    filesUrls[callType].endpoint = url;
    filesUrls[callType].tagsCall = tagsCall;
}
//@ts-ignore
function checkLibrayComingIsAsPerExpectation(
    filteredInputConfig,
    accountId: string,
    codeType: string,
    configCallWise: Record<string, any>
): void {
    // first preference would be from the smartCodeConfig. Specially handled for the old sync. Second preference would be the input config account wise.
    const tagManagerEnabled = filteredInputConfig[accountId].tagManagerEnabled;
    // eslint-disable-next-line guard-for-in
    for (const callType in configCallWise) {
        const tagsCall = configCallWise[callType].tagsCall;
        if (tagsCall && tagsCall.length) {
            for (let index = 0; index < tagsCall.length; index++) {
                if (
                    !tagsCall[index].includes('worker') &&
                    !tagsCall[index].includes(`lib/${accountId}`)
                ) {
                    if (tagManagerEnabled && tagsCall[index].indexOf('web/') == -1) {
                        console.error(
                            `${FAILED} Error: for endpoint ${tagsCall[index]} As Tag manager is enabled and endpoint is not in tha tag manager format for accountId ${accountId} and for codeType ${codeType}`
                        );
                        testSuccess = false;
                    } else if (!tagManagerEnabled && tagsCall[index].indexOf('web/') != -1) {
                        console.error(
                            `${FAILED} Error: for endpoint ${tagsCall[index]} As Tag manager is disabled and endpoint is not in tha non tag manager format for accountId ${accountId} and for codeType ${codeType} `
                        );
                        testSuccess = false;
                    }
                } else {
                    const typeOfCall = tagsCall[index].includes('worker')
                        ? 'worker'
                        : `lib/${accountId}.js`;
                    console.log(
                        chalk.magenta(`${SKIPPING} the above tag manager checks for ${typeOfCall}`)
                    );
                }
            }
        }
    }
}
//feature: key mapping
async function generator(
    filteredInputConfig,
    accountId: string,
    codeType: string,
    smartCodeConfigCodeTypeWise: Record<string, any>
): Promise<any> {
    const configCallWise: Record<string, any> = {};
    // this smartCodeConfig is acc wise and Code TYpe Wise.
    const filesUrls = smartCodeConfigCodeTypeWise.urls;
    for (const callType in filesUrls) {
        await getResponseAndExtractTagsCall(
            filteredInputConfig,
            accountId,
            callType,
            filesUrls,
            codeType,
            smartCodeConfigCodeTypeWise
        );
    }
    extend(true, configCallWise, filesUrls);
    // will check and set the prop : tagManagerEnable
    filteredInputConfig[
        accountId
    ].tagManagerEnabled = checkIfTagManagerIsEnabledForThisCodeTypeAndAcc(
        smartCodeConfigCodeTypeWise,
        accountId
    );
    checkLibrayComingIsAsPerExpectation(filteredInputConfig, accountId, codeType, configCallWise);
    const attributesAccToCodeType: Record<string, boolean> = {};
    const endpointsConfig: Record<string, any> = {};
    generateEndpointsConfig(
        filteredInputConfig,
        configCallWise,
        accountId,
        endpointsConfig,
        attributesAccToCodeType,
        smartCodeConfigCodeTypeWise
    );
    await feedConfigToCheckOutput(accountId, endpointsConfig);
    return attributesAccToCodeType;
}

// FIXME: fix this function in a proper way. This function only compares
function testLibraryExists(
    filteredInputConfig,
    accountId: string,
    attributesAccToCodeTypeFromCode: Record<string, any>,
    codeType: string
): void {
    let libraryTestingSucces = true;
    const accountFeaturesForCodeTypeFromInputConfig = filterConfigForAccount(inputConfig, accountId, codeType);
    for (const callType in attributesAccToCodeTypeFromCode) {
        if (typeof accountFeaturesForCodeTypeFromInputConfig[callType] != 'undefined') {
            for (const libraryName in accountFeaturesForCodeTypeFromInputConfig[callType]) {
                if (
                    (libraryName === 'track' || libraryName === 'survey') &&
                    !filteredInputConfig[accountId].tagManagerEnabled &&
                    (codeType.includes('osc') || callType.includes(UrlsEnum.settingsType2UrlChange))
                ) {
                    console.log(
                        chalk.magenta(
                            `${SKIPPING}Skipping the ${libraryName} file for callType: ${callType} and codeType ${codeType}. Tag manager is disabled. `
                        )
                    );
                } else if (libraryName === 'debuggerUi') {
                    console.log(
                        chalk.magenta(
                            `${SKIPPING}Skipping the get_debugger_ui file for codeType: ${codeType}. `
                        )
                    );
                } else {
                    const libraryExistForCodeTypeAccToConfig = !!accountFeaturesForCodeTypeFromInputConfig[
                        callType
                    ][libraryName];
                    const libraryExistForCodeType = !!attributesAccToCodeTypeFromCode[callType][
                        libraryName
                    ];
                    if (libraryExistForCodeType !== libraryExistForCodeTypeAccToConfig) {
                        const descObj = improvedDescForExpectationMismatch(
                            libraryExistForCodeTypeAccToConfig,
                            libraryExistForCodeType
                        );
                        console.error(
                            chalk.red(
                                `${FAILED} Expectation did not match for Library : ${libraryName}. Expectation: This library should ${descObj.expectationPresentKey} but while checking in the code this library ${descObj.presentKey} `
                            )
                        );
                        testSuccess = false;
                        libraryTestingSucces = false;
                    } else {
                        console.log(
                            `${CHECKED}. Library: ${libraryName} exist in the callType: ${callType}`
                        );
                    }
                }
            }
            // for (const libraryName in attributesAccToCodeTypeFromCode[callType]) {
            //     if (!accountFeaturesForCodeTypeFromInputConfig[callType][libraryName]) {
            //         console.error(
            //             `${failed}. Failed the expectation. library: ${libraryName} exist in the code but not in the input config for call: ${callType} `
            //         );
            //     }
            // }
        } else {
            console.error(
                chalk.red(
                    `${FAILED} expectation mismatch. The callType: ${callType} exist in the code but not in the input config for accountId:${accountId} `
                )
            );
            libraryTestingSucces = false;
        }
    }
    if (libraryTestingSucces) {
        console.log(
            chalk.green(
                `${PASSED}. Library Expectation Passed for codeType: ${codeType} and for accountId: ${accountId}`
            )
        );
    } else {
        console.error(
            chalk.red(
                `${FAILED}. Failed test cases for codeType: ${codeType}. Check above for the errors.`
            )
        );
        testSuccess = false;
    }
}

//FIXME: make it more clear and and fix the statement for error
export async function matchWithAccountCache(filteredInputConfig, accountId: string): Promise<boolean> {
    let matchingPassed = true;

    console.log(
        `${CHECKING}. CHECKING the account features like: dtc, ast and others for accountId: ${accountId} present in the get_cache_core with those present in the input config  `
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line no-unused-vars
    const getAccCacheUrl =
        BASE_URL + '/get_cache_core?k=' + accountId + '&c=accountsettings&u=sparshgupta&p=121285';
    //@ts-ignore
    log.verbose(`Getting account cache for account id: ${accountId}`);
    const response = await getFile(getAccCacheUrl, 'null', 'null', 'null', {});
    let serverResponse = '';

    try {
        serverResponse = await response.text();
    } catch (err) {
        console.error(
            `${FAILED} Error is ${err}, content is not readable for endpoint: ${getAccCacheUrl}. Status code is ${response.status}`
        );
        matchingPassed = false;
        return false;
    }
    
    var parsedServerResponse = await JSON.parse(serverResponse)
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
        } else {
            console.log(
                chalk.red(
                `${FAILED}. Failed to purge account settings for accountId: ${accountId}.`
                )
            )
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
        console.log(chalk.red(`${FAILED}. Something went wrong. Error is ${err}`));
        return false;
    }
    if (isEmpty(accConfig)) {
        console.log(
            chalk.red(
                `${FAILED}. AccConfig object is empty for accountId: ${accountId}. Cannot iterate furthur. Please check the url: ${getAccCacheUrl}`
            )
        );
        return false;
    }
    //@ts-ignore
    if (filteredInputConfig[accountId].tagManagerEnabled === undefined) {
        if (accConfig['dt'].toLowerCase() != 'off') {
            filteredInputConfig[accountId].tagManagerEnabled = true;
        }
        if (accConfig['gab']) {
            filteredInputConfig[accountId].tagManagerEnabled = true;
        }
    }
    //@ts-ignore
    const inputConfigAccWise = filteredInputConfig[accountId].features;
    // eslint-disable-next-line guard-for-in
    for (const key in inputConfigAccWise) {
        // eslint-disable-next-line guard-for-in
        if (accConfig[key] != undefined) {
            if (accConfig[key] !== inputConfigAccWise[key]) {
                // throw error
                console.error(
                    `${FAILED} Features: key value mismatch and key is ${key} for accountId: ${accountId}. Key Value Expectation is ${inputConfigAccWise[key]} and value received is ${accConfig[key]} `
                );
                matchingPassed = false;
            }
        } else {
            console.error(`${FAILED} key: ${key} does not exist on the prod`);
            matchingPassed = false;
        }
    }
    if (matchingPassed) {
        console.log(
            `${CHECKED}. Checked the account Id features for the accountId: ${accountId}. `
        );
    }
    return matchingPassed;
}

async function execute(): Promise<void> {
    const filteredInputConfig: Record<string, any> = {};
    extend(true, filteredInputConfig, filterConfigOnBasisOfOnlyandDisable(inputConfig));
    // const filteredInputConfig = filterConfigOnBasisOfOnlyandDisable(inputConfig);
    console.log(`Verifying various smart codes with various features enabled.`);
    // eslint-disable-next-line guard-for-in
    for (const accountId in filteredInputConfig) {
        console.group(accountId);
        console.log(`Running test cases for account ${accountId}`);

        // eslint-disable-next-line no-await-in-loop
        const matchSuccess = await matchWithAccountCache(filteredInputConfig, accountId);
        if (!matchSuccess) {
            testSuccess = false;
            break;
        }
        const smartCodeConfigAccountWise = generateUrls(inputConfig, accountId);
        if (!smartCodeConfigAccountWise) {
            testSuccess = false;
            break;
        }
        for (const codeType in smartCodeConfigAccountWise) {
            console.group(codeType);
            const attributesAccToCodeType = await generator(
                filteredInputConfig,
                accountId,
                codeType,
                smartCodeConfigAccountWise[codeType]
            );
            if (attributesAccToCodeType) {
                testLibraryExists(filteredInputConfig, accountId, attributesAccToCodeType, codeType);
            }
            console.groupEnd();
            await shouldWait(0);
        }
        console.groupEnd();
    }
    if (!testSuccess) {
        console.log(chalk.red(`${FAILED} Test cases failed`));
        process.exit(1);
    } else {
        console.log(chalk.green('All test cases passed'));
        process.exit();
    }
}

try {
    execute();
} catch (error) {
    console.log(chalk.red(`${FAILED} Something went wrong. Error is ${error}`));
    process.exit(1);
}

// Make unhandled rejections fail the script.
process.on('unhandledRejection', (up): void => {
    throw up;
});
