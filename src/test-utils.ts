import fetch, { Response } from 'node-fetch';
import _extend = require('extend');
import { CHECKED, CHECKING } from './strings';
import { log } from './log';
export const extend = _extend;
const chalk = require('chalk');
//@ts-ignore
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
/* eslint-disable no-console */
export interface TestResult {
    err: string;
    description: string;
    debuggingInfo: {
        serverResponse?: Response;
    };
}

export interface TestResults {
    [str: string]: TestResult;
}

// check if callType exist in the propCheck array .
export const doKeyExistInArr = function doKeyExistInArr(
    propCheckArray: string[] | boolean,
    key: string,
    checkInReverseManner?: boolean
): boolean {
    if (typeof propCheckArray === 'boolean') {
        return propCheckArray;
    }
    if (!propCheckArray) {
        return false;
    }
    let keyExist = false;
    //@ts-ignore
    for (let index = 0; index < propCheckArray.length; index++) {
        if (checkInReverseManner) {
            if (key.includes(propCheckArray[index])) {
                keyExist = true;
                break;
            }
        } else {
            if (propCheckArray[index].includes(key)) {
                keyExist = true;
                break;
            }
        }
    }
    return keyExist;
};

export const concatObjectForTags: Record<string, string> = {
    // debug is for debugger.js
    debug: 'VWO_d._.keys',
    debug_heatmap: 'heatmap-inject',
    heatmap: 'heatmap-inject',
    survey: 'VWO.v_s=',
    jquery: 'expando',
    jqueryOpa: 'jquery:"2.1.3"',
    gquery: 'gQVersion:"0.0.1"',
    safari: '!VWO._.jar=null',
    debug_survey: 'VWO_d._.keys',
    track: 'VWO.v_t=',
    analyze: 'VWO.v_o =',
    pushcrew: 'pushcrewHash',
    worker: 'Z_STREAM_END',
    sync: 'VWO.v="',
};

export const isEmpty = function isEmpty(obj: any): boolean {
    for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
};

export const concatenationCheck = function concatenationCheck(
    responseContent: string,
    endpoint: string,
    keyForCheckingFileConcatenation: Record<string, string>[]
): boolean {
    let index = 0;
    let description = '';
    let concatenationSuccess = true;
    let keyToBeCheckedInFile = '';
    let keyChecked = '';
    for (let count = 0; count < keyForCheckingFileConcatenation.length; count++) {
        const fileObject = keyForCheckingFileConcatenation[count];
        // eslint-disable-next-line guard-for-in
        for (const file in fileObject) {
            // eslint-disable-next-line no-prototype-builtins
            if (fileObject.hasOwnProperty(file)) {
                // FIXME: It shouldn't be this method's respondibility to split on '#' as # is a way to specify just another key to check in the content.
                // # has a special meaning to have multiple keys for a single file to be specified in a single string.
                const prop = fileObject[file].split('#');
                for (let i = 0; i < prop.length; i++) {
                    keyToBeCheckedInFile += `${prop[i]} , `;
                    // Special case passing ! i.e. this key should not be present in the code .
                    if (prop[i].includes('!')) {
                        const searchParamIndex = responseContent.search(
                            new RegExp(prop[i].split('!')[1])
                        );

                        if (searchParamIndex !== -1) {
                            description = `[FAILED] Expectation does not match as the key passed is ${prop[i]} and it is present in the response of the endpoint ${endpoint} and it's index is ${searchParamIndex}`;
                            console.error(chalk.red(description));
                            concatenationSuccess = false;
                        } else {
                            keyChecked += `${prop[i]} , `;
                        }
                    } else {
                        const searchParamIndex = responseContent.search(new RegExp(prop[i]));

                        if (searchParamIndex > index) {
                            index = searchParamIndex;
                            keyChecked += `${prop[i]} , `;
                        } else {
                            description = `[FAILED] Expectation does not match for ${file} in endpoint.Parameter to be searched for endpoint is ${prop[i]}  .it might be not present in the content. params index in the file is ${searchParamIndex} for endpoint ${endpoint}`;
                            console.error(chalk.red(description));
                            concatenationSuccess = false;
                        }
                    }
                }
            }
        }
    }
    if (keyToBeCheckedInFile || keyChecked) {
        console.log(
            `${CHECKING}. Checking the following keys in the file: ${keyToBeCheckedInFile}.`
        );
        console.log(`${CHECKED}. Checked the following keys in the file: ${keyChecked}`);
    }

    return concatenationSuccess;
};

export function checkOrderOfKeysInContent(
    content: string,
    keys: string[]
) {
    log.verbose('Checking for keys', keys, ' in given content');
    let index = 0;
    let success = true;
    const keysToBeChecked: string[] = [];
    const keysMatched: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        // eslint-disable-next-line guard-for-in
        keysToBeChecked.push(keys[i]);
        // Special case passing ! i.e. this key should not be present in the code .
        if (keys[i].includes('!')) {
            const searchParamIndex = content.search(
                new RegExp(keys[i].split('!')[1])
            );

            if (searchParamIndex !== -1) {
                success = false;
            } else {
                keysMatched.push(keys[i]);
            }
        } else {
            const searchParamIndex = content.search(new RegExp(keys[i]));

            if (searchParamIndex > index) {
                index = searchParamIndex;
                keysMatched.push(keys[i]);
            } else {
                success = false;
            }
        }
    }

    return { status: success, keysMatched };
}

export const asyncForEach = async function asyncForEach<T>(
    array: string[] | Record<string, T>,
    callback: Function
): Promise<void> {
    let index;
    if (array instanceof Array) {
        for (index = 0; index < array.length; index++) {
            // eslint-disable-next-line no-await-in-loop
            await callback(array[index], index, array);
        }
    } else {
        // eslint-disable-next-line guard-for-in
        for (index in array) {
            // eslint-disable-next-line no-await-in-loop
            await callback(array[index], index, array);
        }
    }
};

export const forEach = function asyncForEach<T>(
    array: string[] | Record<string, T>,
    callback: Function
): void {
    let index;
    if (array instanceof Array) {
        for (index = 0; index < array.length; index++) {
            // eslint-disable-next-line no-await-in-loop
            callback(array[index], index, array);
        }
    } else {
        // eslint-disable-next-line guard-for-in
        for (index in array) {
            // eslint-disable-next-line no-await-in-loop
            callback(array[index], index, array);
        }
    }
};

export const getFile = async function getFile(
    url: string,
    acceptencoding?: string,
    userAgent?: string | null,
    libraryName?: string | null,
    testResults?: TestResults,
    appendReferrer?: Record<string, any>
): Promise<Response> {
    if (!url.includes('?')) {
        url += '?__r=' + Math.random();
    } else {
        url += '&__r=' + Math.random();
    }
    userAgent = userAgent || '';
    const headers = {
        'Content-Type': 'text/plain',
    };
    if (libraryName === 'core-lib' || libraryName === 'oneSmartCode') {
        if (acceptencoding !== 'null') {
            // Doesn't support sending the header twice. It was tested manually by Shubham
            // DaCDN was throwing error in this case and was handled.
            headers['accept-encoding'] = acceptencoding;
            headers['user-agent'] = userAgent;
        } else {
            headers['user-agent'] = userAgent;
        }
    } else {
        if (acceptencoding !== 'null') {
            // Doesn't support sending the header twice. It was tested manually by Shubham
            // DaCDN was throwing error in this case and was handled.
            headers['accept-encoding'] = acceptencoding;
        }
    }
    if (appendReferrer) {
        headers['referer'] = appendReferrer.url;
    }
    try {
        log.verbose(`Sending Request to ${url}`)
        const response = await fetch(url, {
            headers: headers,
        });
        log.verbose(`Got Response from ${response.headers.get('server')} for request ${url}`)
        return response;
    } catch (err) {
        console.error(err);
        return err;
    }
};