/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable guard-for-in */
/* eslint-disable no-console */
import {
    BASE_URL,
    BATCH_SIZE,
    IS_CLOUDFLARE_CACHING,
    LIBRARY_NAMES,
    combinationsOfAcceptEncoding,
    combinationsOfUserAgent,
    commonContentChecker,
    doNonTags,
    doTags,
    filteredLibrariesConfigs,
    msgs,
    productionServerBaseUrl,
    getTags,
} from './config';
import { TestResults, asyncForEach, concatObjectForTags, concatenationCheck, getFile } from '../test-utils';
import { Response } from 'node-fetch';
require('colors');
export const testSuiteConfig: any = [];
const process = require('process');
const testResults: TestResults = {};
interface EndpointConfig {
    skipLicense?: string;
    keyForCheckingFileConcatenation?: Record<string, string>[];
    expectedEncodingForFile?: string | null;
    endpoint?: string;
    encoding?: string;
    libVersion?: string;
    libraryName?: string;
    file?: string;
    tagtype?: string | null;
    userAgent?: string;
}
let testSuccess = true;
let repsonseTextsArray: any = [];
const __error = console.error;
console.error = function (...args: string[]): void {
    if (args && args[0].includes("Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' ")) {
        return __error.apply(this, args);
    }
    testSuccess = false;
    // eslint-disable-next-line prefer-rest-params
    args[0] = '[FAILED]' + arguments[0].red;
    // @ts-ignore
    return __error.apply(this, args);
};
function getExpectedEncoding(
    library: string,
    libVersion: string,
    endpoint: string,
    expectedEncoding: string
): string | null {
    if (library === 'on-page-surveys') {
        // Cloudflare right compresses svgs
        if (endpoint.endsWith('.svg') && !IS_CLOUDFLARE_CACHING) {
            return null;
        }

        // PNGs shouldn't be compressed and aren't being compressed
        if (endpoint.endsWith('.png')) {
            return null;
        }

        // 4. Certain endpoints serve latest version from static with no libVersion.
        // These endpoints also include those that serve latest content without static also.
        if (!libVersion) {
            if (!endpoint.includes('static')) {
                if (
                    endpoint.includes('va_survey.js') ||
                    endpoint.includes('vis_opt_survey.js') ||
                    endpoint.includes('va_survey_debug.js') ||
                    endpoint.includes('vis_opt_survey_debug.js')
                ) {
                    //Serves Latest
                    return expectedEncoding;
                } else {
                    return 'gzip';
                }
            } else {
                if (
                    endpoint.includes('cross_store_inject.js') ||
                    endpoint.includes('survey_debugger.html') ||
                    endpoint.includes('proxy.html') ||
                    IS_CLOUDFLARE_CACHING
                ) {
                    //Serves Latest
                    return expectedEncoding;
                } else {
                    return 'gzip';
                }
            }
        }
        // 3. No support of br below 0.5 version.
        if (
            !IS_CLOUDFLARE_CACHING &&
            (!libVersion || parseFloat(libVersion) < 0.5) &&
            endpoint.includes('static')
        ) {
            expectedEncoding = 'gzip';
        }
    } else if (library === 'oneSmartCode') {
        if (!IS_CLOUDFLARE_CACHING) {
            expectedEncoding = 'gzip';
        }
    }
    return expectedEncoding;
}
function check(
    libraryName: string,
    libVersion: string,
    filename: string,
    encoding: string
): void | boolean | string {
    if (libraryName === 'on-page-surveys') {
        if (
            filename.includes('va_survey.js') ||
            filename.includes('vis_opt_survey.js') ||
            filename.includes('va_survey_debug.js') ||
            filename.includes('vis_opt_survey_debug.js')
        ) {
            if (libVersion === '') {
                return msgs.TRY_WITHOUT_FOLDER_PREFIX;
            }
        }
        if (filename.includes('survey-lib')) {
            if (
                encoding === 'br' ||
                encoding === 'br,gzip' ||
                encoding === 'gzip,br' ||
                encoding === 'deflate'
            ) {
                return false;
            }
        }
        return true;
    } else if (libraryName === 'core-lib' || libraryName === 'tag-manager') {
        return;
    } else {
        return true;
    }
}

function delay(ms: number): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function shouldWait(time: number): Promise<void> {
    if (!IS_CLOUDFLARE_CACHING) {
        return;
    }
    await delay(time);
}


async function batchWiseCall(subTestSuiteConfig: any): Promise<void> {
    // console.log(subTestSuiteConfig);
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const promises = subTestSuiteConfig.map((subArray: any) =>
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, implicit-arrow-linebreak
        getFile(
            subArray.endpoint,
            subArray.encoding,
            subArray.userAgent,
            subArray.libraryName,
            testResults
        )
    );
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    await Promise.all(promises).then(text => {
        repsonseTextsArray = text;
    });
    await asyncForEach(
        subTestSuiteConfig,
        async (
            config: {
                libraryName: string;
                libVersion: string;
                endpoint: string;
                expectedEncodingForFile: string;
                encoding: string;
                file: string;
                userAgent: string;
                keyForCheckingFileConcatenation?: Record<string, string>;
            },
            index: number
        ): Promise<void> => {
            subTestSuiteConfig[index].serverResponse = repsonseTextsArray[index];
            const contentChecker = commonContentChecker;
            let expectedEncoding = subTestSuiteConfig[index].expectedEncodingForFile;
            // Cloudflare fixes this bug. So, expect right in this case
            if (
                IS_CLOUDFLARE_CACHING &&
                expectedEncoding && // if it's null, then it means that it might be png case
                subTestSuiteConfig[index].encoding === 'gzip;q=1.0,br;q=0.6,identity;q=0.3'
            ) {
                expectedEncoding = 'br';
            }

            // For empty accept-encoding, cloudflare does no encoding
            if (IS_CLOUDFLARE_CACHING && subTestSuiteConfig[index].encoding === '') {
                expectedEncoding = null;
            }

            // eslint-disable-next-line no-await-in-loop
            await checkOutput(
                subTestSuiteConfig[index].libraryName,
                subTestSuiteConfig[index].serverResponse,
                subTestSuiteConfig[index].encoding,
                subTestSuiteConfig[index].endpoint,
                subTestSuiteConfig[index].file,
                subTestSuiteConfig[index].libVersion,
                expectedEncoding,
                contentChecker,
                subTestSuiteConfig[index].tagtype,
                subTestSuiteConfig[index].userAgent,
                subTestSuiteConfig[index].keyForCheckingFileConcatenation,
                subTestSuiteConfig[index].skipLicense
            );
        }
    );
}

export async function verifyTags(): Promise<void> {
    const critical = getTags().critical;
    const noncritical = getTags().nonCritical;

    //console.group('Verifying Tags');
    const ret = await asyncForEach(
        combinationsOfAcceptEncoding,
        async (expectedEncoding: string, encoding: string): Promise<void> => {
            //console.group('Critical-' + encoding);
            let tagUrl: string;
            let tagType: string;
            const criticalKeys = Object.keys(critical),
                noncriticalKeys = Object.keys(noncritical);

            await asyncForEach(
                criticalKeys,
                async (key: string | number): Promise<void> => {
                    const endpointConfig: EndpointConfig = {};
                    const concatKeyArr: Record<string, string>[] = [];
                    //@ts-ignore
                    if (key.includes('te:')) {
                        //@ts-ignore
                        if (!key.includes('debug_survey')) {
                            //@ts-ignore
                            concatKeyArr.push({
                                'error-logger':
                                    // # is a special symbol which will split the belo string.
                                    'd5phz18u4wuww.cloudfront.net#cdn-cn.vwo-analytics.com#VWO._.customError=',
                            });
                        }
                        let splitKey = key;
                        //@ts-ignore
                        if (!key.includes('async') && key.includes('sync')) {
                            //@ts-ignore
                            const version = key.includes('6.0') ? '6.0' : '7.0';
                            //@ts-ignore
                            splitKey = key.split(`te:${version}:`)[1];
                        }
                        //@ts-ignore
                        const splitArray: Record<string>[] = splitKey.split('%');
                        for (let index = 0; index < splitArray.length; index++) {
                            //@ts-ignore
                            if (
                                !splitArray.includes('async') &&
                                concatObjectForTags[splitArray[index]]
                            ) {
                                if (splitArray[index] === 'debug_survey') {
                                    concatKeyArr.push({
                                        [splitArray[index]]: concatObjectForTags[splitArray[index]],
                                    });
                                    concatKeyArr.push({
                                        'error-logger':
                                            // # is a special symbol which will split the belo string.
                                            'd5phz18u4wuww.cloudfront.net#cdn-cn.vwo-analytics.com#VWO._.customError=',
                                    });
                                    concatKeyArr.push({
                                        //@ts-ignore
                                        jquery: concatObjectForTags['jquery'],
                                    });
                                    break;
                                    //@ts-ignore
                                } else {
                                    concatKeyArr.push({
                                        [splitArray[index]]: concatObjectForTags[splitArray[index]],
                                    });
                                }
                            }
                        }
                    }
                    //@ts-ignore
                    if (key.includes('async')) {
                        concatKeyArr.push({
                            va: 'VWO.v="',
                        });
                    }
                    //@ts-ignore
                    if (key.includes('debug')) {
                        endpointConfig.skipLicense = 'skip';
                    }
                    tagUrl = `${BASE_URL}/web/${critical[key].b64Encoding}/${critical[key].path}`;
                    tagType = 'critical';
                    endpointConfig.keyForCheckingFileConcatenation = concatKeyArr;
                    endpointConfig.expectedEncodingForFile = expectedEncoding;
                    endpointConfig.endpoint = tagUrl;
                    endpointConfig.encoding = encoding;
                    endpointConfig.libVersion = '';
                    endpointConfig.libraryName = LIBRARY_NAMES['tag-manager'];
                    endpointConfig.file = critical[key].path;
                    endpointConfig.tagtype = tagType;
                    await testSuiteConfig.push(endpointConfig);
                }
            );
            // console.groupEnd();

            // console.group('NonCritical-' + encoding);

            await asyncForEach(
                noncriticalKeys,
                async (key: string | number): Promise<void> => {
                    const endpointConfig: EndpointConfig = {};
                    tagUrl = `${BASE_URL}/web/${noncritical[key].b64Encoding}/${noncritical[key].path}`;
                    tagType = 'noncriticals';
                    endpointConfig.expectedEncodingForFile = expectedEncoding;
                    endpointConfig.endpoint = tagUrl;
                    endpointConfig.encoding = encoding;
                    endpointConfig.libVersion = '';
                    endpointConfig.libraryName = LIBRARY_NAMES['tag-manager'];
                    endpointConfig.file = noncritical[key].path;
                    endpointConfig.tagtype = tagType;
                    await testSuiteConfig.push(endpointConfig);
                }
            );
            // console.groupEnd();
        }
    );
    //console.groupEnd();
    return ret;
}

export const checkOutput = async function checkOutput(
    libraryName: LIBRARY_NAMES,
    serverResponse: Response,
    acceptEncoding: string,
    endpoint: string,
    prefixPath: string,
    libVersion: string,
    expectedEncoding: string | null,
    contentChecker: Function,
    tagType: string | null,
    userAgent?: string,
    keyForCheckingFileConcatenation?: Record<string, string>[],
    skipLicense?: string
): Promise<void> {
    if (libraryName == 'core-lib') {
        console.log(
            '\nChecking endpoint ',
            endpoint,
            'for accept-encoding',
            acceptEncoding,
            'for user agent',
            userAgent
        );
    } else {
        console.log('\nChecking endpoint ', endpoint, 'for accept-encoding', acceptEncoding);
    }
    let description: string,
        isItGivingNon200OnProdAsWell = false;
    if (serverResponse.status === 200) {
        const responseVaryHeader = serverResponse.headers.get('vary'),
            responseContentEncodingHeader = serverResponse.headers.get('content-encoding');
        if (
            endpoint.includes('.js') &&
            serverResponse.headers.get('access-control-allow-origin') !== '*'
        ) {
            console.log('Access-control-origin-header missing for the endpoint', endpoint);
            description = 'Access-control-origin-header does not exists for the  ' + endpoint;
            testResults[endpoint + ' ' + acceptEncoding] = {
                err: 'Accesscontroloriginmissing',
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
        }
        if (responseVaryHeader && responseVaryHeader.split(',').indexOf('Accept-Encoding') < 0) {
            description =
                'vary header does not matched for  ' +
                endpoint +
                ' Expected is "Accept-Encoding" and received is ' +
                responseVaryHeader;
            testResults[endpoint + ' ' + acceptEncoding] = {
                err: msgs.VARY_HEADER_MISSING,
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
            console.error(description);
        }

        if (responseContentEncodingHeader !== expectedEncoding) {
            description = `Expected encoding: ${expectedEncoding}, Accept-Encoding Header: ${acceptEncoding}. Got encoding: ${responseContentEncodingHeader}`;

            testResults[endpoint + ' ' + acceptEncoding] = {
                err: msgs.CONTENT_ENCODING_WRONG,
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
            console.error(description);
        }

        if (!responseVaryHeader) {
            description = 'vary header does not exist for the ' + endpoint;
            testResults[endpoint + ' ' + acceptEncoding] = {
                err: msgs.VARY_HEADER_MISSING,
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
            console.error(description);
        }
    } else {
        const productionBaseUrl = endpoint.replace(BASE_URL, productionServerBaseUrl);
        const productionServerResponse = await getFile(
            productionBaseUrl,
            acceptEncoding,
            null,
            null,
            testResults
        );
        if (serverResponse.status !== productionServerResponse.status) {
            description =
                `Status code for ${endpoint} : (${serverResponse.status}) does not match with ` +
                ' that of production ' +
                `${productionBaseUrl} : (${productionServerResponse.status})`;

            testResults[endpoint + ' ' + acceptEncoding] = {
                err: msgs.STATUS_CODE_MISMATCH_WITH_PRODUCTION,
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
            console.error(description);
        } else {
            isItGivingNon200OnProdAsWell = true;
        }
    }
    // Handles the case when endpoints is failing on target as well as prod.
    if (isItGivingNon200OnProdAsWell) {
        console.log(
            `Endpoint gave ${serverResponse.status}. Verified the same on Production. Its a normal situation.`
        );
        return;
    }
    let uglificationVerified = false;
    try {
        const responseContent = await serverResponse.text();
        const numberOfNewLines = responseContent.split('\n').length;
        if (libraryName == 'core-lib') {
            uglificationVerified = true;
            if (numberOfNewLines > 300) {
                // Due to licenses and uglifier's auto splitting to ne wlines if lines are too big, there can be around 300 new lines
                // TODO: We need to add a better uglifier test.
                description = `Response has ${numberOfNewLines} newlines. The file is not uglified. Threshold is 300 newlines.`;
                testResults[endpoint + ' ' + acceptEncoding] = {
                    err: msgs.NOT_UGLIFIED,
                    description: description,
                    debuggingInfo: {
                        serverResponse: serverResponse,
                    },
                };
                console.error(description);
            }
        }
        if (responseContent.length < 50) {
            description =
                'Content is not readable  for   ' +
                endpoint +
                ' accept encoding for ' +
                acceptEncoding;
            testResults[endpoint + ' ' + acceptEncoding] = {
                err: msgs.SIZE_TOO_SMALL,
                description: description,
                debuggingInfo: {
                    serverResponse: serverResponse,
                },
            };
            console.error(description);
        }
        if (endpoint.includes('.js')) {
            if (
                contentChecker(
                    libraryName,
                    responseContent,
                    libVersion,
                    endpoint,
                    tagType,
                    userAgent,
                    prefixPath,
                    skipLicense
                )
            ) {
                if (uglificationVerified) {
                    console.log(
                        'license, Version, User Agent and uglification Verified for the',
                        endpoint
                    );
                } else {
                    console.log('license, Version, User Agent Verified for the', endpoint);
                }
            }
        } else {
            if (uglificationVerified) {
                console.log(
                    'No license verification for the endpoint. But uglification verified: ',
                    endpoint
                );
            } else {
                console.log('No license verification for the endpoint: ', endpoint);
            }
        }
        let concatenationSucces = true;
        // checking whether the file concatenation is done correct or not.
        if (keyForCheckingFileConcatenation) {
            concatenationSucces = concatenationCheck(
                responseContent,
                endpoint,
                keyForCheckingFileConcatenation
            );
        }
        if (!concatenationSucces) {
            testSuccess = false;
        }
    } catch (err) {
        console.error('ERROR :', err);
        description =
            'Content is not readable  for   ' + endpoint + ' accept encoding for ' + acceptEncoding;
        testResults[endpoint + ' ' + acceptEncoding] = {
            err: msgs.CONTENT_NOT_READABLE,
            description: description,
            debuggingInfo: {
                serverResponse: serverResponse,
            },
        };
        console.error(description);
    }
    if (testSuccess) {
        testResults[endpoint + ' ' + acceptEncoding] = {
            err: 'NO ERROR',
            description: 'No Error Found. Normal Situation',
            debuggingInfo: {},
        };
    }

    return;
};

export async function verify(
    expectedEncoding: string,
    endpoint: string,
    encoding: string,
    libVersion: string,
    libraryName: LIBRARY_NAMES,
    file: string,
    keyForCheckingFileConcatenation?: Record<string, string>[]
): Promise<void> {
    let endpointConfig: EndpointConfig = {};
    if (libraryName === 'core-lib' || libraryName == 'oneSmartCode') {
        //console.group('Endpoint- ', `${endpoint}`);
        await asyncForEach(
            combinationsOfUserAgent,
            async (userAgent: string): Promise<void> => {
                //console.group('User-Agent ', userAgent);
                endpointConfig.expectedEncodingForFile = expectedEncoding;
                endpointConfig.endpoint = endpoint;
                endpointConfig.encoding = encoding;
                endpointConfig.libVersion = libVersion;
                endpointConfig.libraryName = libraryName;
                endpointConfig.file = file;
                endpointConfig.tagtype = null;
                endpointConfig.userAgent = userAgent;
                endpointConfig.keyForCheckingFileConcatenation = keyForCheckingFileConcatenation;
                let expectedEncodingForFile: string | null = expectedEncoding;
                expectedEncodingForFile = getExpectedEncoding(
                    libraryName,
                    libVersion,
                    endpoint,
                    expectedEncodingForFile
                );
                endpointConfig.expectedEncodingForFile = expectedEncodingForFile;
                await testSuiteConfig.push(endpointConfig);
                endpointConfig = {};
                //console.groupEnd();
            }
        );
        //console.groupEnd();
    } else {
        endpointConfig.expectedEncodingForFile = expectedEncoding;
        endpointConfig.endpoint = endpoint;
        endpointConfig.encoding = encoding;
        endpointConfig.libVersion = libVersion;
        endpointConfig.libraryName = libraryName;
        endpointConfig.file = file;
        endpointConfig.tagtype = null;
        endpointConfig.keyForCheckingFileConcatenation = keyForCheckingFileConcatenation;
        let expectedEncodingForFile: string | null = expectedEncoding;
        expectedEncodingForFile = getExpectedEncoding(
            libraryName,
            libVersion,
            endpoint,
            expectedEncodingForFile
        );
        endpointConfig.expectedEncodingForFile = expectedEncodingForFile;
        await testSuiteConfig.push(endpointConfig);
    }
}
//FIXME:  Merge methods verifyNonTags and verifyTags in one. They are almost similar and should be handled the same way.
export async function verifyNonTags(): Promise<void> {
    let prefixPath: string;
    await asyncForEach(
        combinationsOfAcceptEncoding,
        async (expectedEncoding: string, encoding: string): Promise<void> => {
            //console.group('Encoding: ' + encoding);
            await asyncForEach(
                filteredLibrariesConfigs,
                async (
                    config: {
                        disable: boolean;
                        filenames: string[];
                        versions: string[];
                        folderName: string;
                        files: any;
                        check: (arg0: string, arg1: string, arg2: string) => boolean | string;
                    },
                    libraryName: LIBRARY_NAMES
                ): Promise<void> => {
                    //console.group('JSLIB: ' + libraryName);
                    // eslint-disable-next-line no-await-in-loop
                    await asyncForEach(
                        config.filenames,
                        async (file: string): Promise<void> => {
                            const versionsArray = config.files[file].versions || config.versions;
                            //console.group('File: ' + file);
                            await asyncForEach(
                                versionsArray,
                                async (
                                    expectedLibVersion: string,
                                    libVersion: string
                                ): Promise<void> => {
                                    const folderName = config.files[file].folderName || config.folderName;

                                    if (libVersion !== '') {
                                        prefixPath = `${folderName}/${libVersion}`;
                                    } else {
                                        prefixPath = folderName;
                                    }
                                    let filePath = `/${prefixPath}/${file}`;
                                    filePath = filePath.replace(/\/\//g, '/');
                                    let endpoint = `${BASE_URL}${filePath}`;
                                    const checkResult = check(
                                        libraryName,
                                        libVersion,
                                        file,
                                        encoding
                                    );

                                    if (
                                        !checkResult &&
                                        libraryName !== 'core-lib' &&
                                        libraryName !== 'oneSmartCode'
                                    ) {
                                        console.log(
                                            'Skipping endpoint ',
                                            endpoint,
                                            'for ',
                                            encoding
                                        );
                                        return;
                                    }
                                    if (
                                        libraryName == 'oneSmartCode' &&
                                        (encoding === 'br' ||
                                            encoding === 'null' ||
                                            encoding === '')
                                    ) {
                                        console.log(
                                            'Skipping endpoint ',
                                            endpoint,
                                            'as encoding is ',
                                            encoding
                                        );
                                        return;
                                    }

                                    await verify(
                                        expectedEncoding,
                                        endpoint,
                                        encoding,
                                        libVersion,
                                        libraryName,
                                        file,
                                        config.files[file].keyForCheckingFileConcatenation
                                    );

                                    if (checkResult === msgs.TRY_WITHOUT_FOLDER_PREFIX) {
                                        endpoint = endpoint.replace('/' + folderName, '');
                                        await verify(
                                            expectedEncoding,
                                            endpoint,
                                            encoding,
                                            libVersion,
                                            libraryName,
                                            file,
                                            config.files[file].keyForCheckingFileConcatenation
                                        );
                                    }
                                }
                            );
                            // console.groupEnd();
                        }
                    );
                    //console.groupEnd();
                }
            );
            //console.groupEnd();
        }
    );
}

export async function automationTests() {
    if (doTags) {
        try {
            await verifyTags();
        } catch (e) {
            console.error('Unhandled Error', e);
        }
    }

    if (doNonTags) {
        try {
            await verifyNonTags();
        } catch (e) {
            console.error('Unhandled Error', e);
        }
    }
    let i = 1;
    while (testSuiteConfig.length > 0) {
        console.log('Processing batch ', i);
        const batchArray = testSuiteConfig.splice(0, BATCH_SIZE);
        // eslint-disable-next-line no-await-in-loop
        await batchWiseCall(batchArray);
        // eslint-disable-next-line no-await-in-loop
        await shouldWait(100);
        console.log('Batch ', i, 'ended');
        i = i + 1;
    }

    if (!testSuccess) {
        process.exit(1);
    }
}
