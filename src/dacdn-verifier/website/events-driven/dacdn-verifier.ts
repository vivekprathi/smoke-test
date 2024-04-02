/* eslint-disable no-await-in-loop */

import {inputConfig as testConfigs, TestConfig, UrlsTestConfig, UrlTestConfig} from './tests';
import {main} from './utils';
import {checkOrderOfKeysInContent, getFile} from '../../../test-utils';
import {log} from '../../../log';
import {smartCodesConfigs} from './smartcode-config';
import * as Mocha from 'mocha';
class UrlTest {
    // Contains the entire urlTestConfig for the given account
    // FIXME: It should stay confined to SmartCodeTest class.
    urlsTestConfig: UrlsTestConfig;

    // Response of the URL
    responseText!: string;

    // Mocha Tests Support File Path. This file is included in all specs files automatically.
    mochaSupportFilePath = './mocha-tests/support.ts';

    // URL that is being tested.
    url: string;

    // After evaluating responseText, the updated window context of JSDOM
    jsDomWindow!: Window;

    // Outgoing URLs UrlTest instances identified in the current URL.
    outgoingUrlsTests: UrlTest[] = [];

    // Matching urlTestConfig for the current URL
    // It is identified by matching the URL with urlsTestConfig patterns.RegexMatch
    urlTestConfig!: UrlTestConfig;

    constructor(url, urlsTestConfig: UrlsTestConfig) {
        this.urlsTestConfig = urlsTestConfig;
        this.url = url;
        this.setConfig();
        //@ts-ignore
        delete global.jsDomWindow;
    }

    static extractUrls(content): any {
        // https://regexr.com/57hke // test your reg-Ex here
        // contains the file url of the file present in j.php
        // let filesUrl: any = response.match(/(https?:\/|web|([0-9].[0-9]))\/[.a-zA-Z0-9_\/=:-]*\.js/g);
        const urlExtractorRegExp = /["']([^"']+?.js)['"]/g;
        const results: any[] = [];
        let matches;
        // eslint-disable-next-line no-cond-assign
        while ((matches = urlExtractorRegExp.exec(content))) {
            results.push(matches[1]);
        }
        return results;
    }

    /**
     * Identifies a UrlTestConfig matching the URL and sets it.
     */
    setConfig() {
        log.verbose('Looking for URL Test Config for', this.url);
        for (var urlRegex in this.urlsTestConfig) {
            if (new RegExp(urlRegex).test(this.url)) {
                const urlTestConfig = this.urlsTestConfig[urlRegex];
                this.urlTestConfig = urlTestConfig;
                this.urlTestConfig._pattern = urlRegex;
                return;
            }
        }
        log.warn(`No CheckerConfig available for ${this.url}`);
        return;
    }

    evalJs() {
        const {JSDOM} = require('jsdom');

        if (this.urlTestConfig.preJs) {
            log.verbose(
                'Adding PreJS before execution of content as javascript',
                this.urlTestConfig.preJs,
                ''
            );
        } else {
            log.verbose(
                'No PreJS to be added before execution of content as javascript',
                this.urlTestConfig.preJs
            );
        }

        const {window} = new JSDOM(`<body><script>${this.urlTestConfig.preJs}</script></body>`, {
            runScripts: 'dangerously',
        });
        try {
            window.eval(this.responseText);
            this.jsDomWindow = window;
            log.warn('The error present DOMException {} before this line is irrelevant');
            return true;
            // eslint-disable-next-line no-empty
        } catch (err) {
            // eslint-disable-next-line no-debugger
            debugger;
            log.fail('Error executing JS', JSON.stringify(err));
            return false;
        }
    }

    contentCheck() {
        let inOrderCheckResult = true;
        let unOrderedCheckResult = true;
        if (this.urlTestConfig.content) {
            inOrderCheckResult = checkOrderOfKeysInContent(
                this.responseText,
                this.urlTestConfig.content
            ).status;
        } else if (this.urlTestConfig.unorderedContent) {
            unOrderedCheckResult = this.urlTestConfig.unorderedContent.every((lookupText) =>
                this.responseText.includes(lookupText)
            );
        } else {
            throw new Error('Neither `content` nor `unorderedContent` check provided');
        }

        if (!inOrderCheckResult && this.urlTestConfig.content) {
            log.fail(
                'Content, when checked in-order, not found. Lookup keys:',
                this.urlTestConfig.content,
                this.urlTestConfig._pattern
            );
        }

        if (!unOrderedCheckResult && this.urlTestConfig.content) {
            log.fail(
                'Content, when checked out-of order, not found. Lookup keys:',
                this.urlTestConfig.content,
                this.urlTestConfig._pattern
            );
        }
        if (inOrderCheckResult && this.urlTestConfig.content) {
            log.success(
                'Content found in-order',
                this.urlTestConfig.content,
                this.urlTestConfig._pattern
            );
        }
        if (unOrderedCheckResult && this.urlTestConfig.unorderedContent) {
            log.success(
                'Content found when searched out of order',
                this.urlTestConfig.unorderedContent,
                this.urlTestConfig._pattern
            );
        }
        return inOrderCheckResult && unOrderedCheckResult;
    }

    validateContentType() {
        let jsRunTimeCheckResult;
        if (this.urlTestConfig.contentType === 'javascript') {
            log.verbose('Evaluating content as Javascript for', this.url);

            jsRunTimeCheckResult = this.evalJs();
            if (!jsRunTimeCheckResult) {
                log.fail(`Error evaluating JS for `, this.url);
            } else {
                log.success('JS Evaluated Successfully', this.url);
            }
        }
        return jsRunTimeCheckResult;
    }

    static async javascriptAssertions(window, mochaFiles: string[], supportFilePath) {
        const path = require('path');

        // Allow typescript files
        process.env.TS_NODE_PROJECT = '../../../../tsconfig.json';
        require('ts-mocha');
        // Instantiate a Mocha instance.
        var mocha = new Mocha();

        log.verbose('Adding mocha support file:', supportFilePath);
        mocha.addFile(path.resolve(supportFilePath));

        log.verbose('Adding specs file:', mochaFiles);
        mochaFiles.forEach(function (mochaFile) {
            mocha.addFile(
                // This .resolve is compulsory as .dispose() has a bug where if Full path is not provided, it is not able to clear require cache
                path.resolve(mochaFile)
            );
        });

        mocha.reporter('spec');

        // Set it here to be shared with Mocha Specs
        //@ts-ignore
        global.jsDomWindow = window;

        const myPromise = new Promise(function (resolve) {
            // Run the tests.
            mocha.run(function (failures) {
                // See why it's needed https://github.com/mochajs/mocha/issues/2783
                mocha.dispose();
                resolve(failures);
            });
        });
        return await myPromise;
    }

    async checkoutgoingUrls() {
        const outgoingUrls = UrlTest.extractUrls(this.responseText);
        if (!outgoingUrls || !outgoingUrls.length) {
            log.verbose('No Outgoing Urls found in:', this.url);
            return;
        }

        log.verbose('Outgoing Urls found in:', this.url, 'are ', JSON.stringify(outgoingUrls));

        let success = true;
        for (let i = 1; i < outgoingUrls.length; i++) {
            const url = outgoingUrls[i];
            const urlTest = new UrlTest(url, this.urlsTestConfig);
            log.verbose(`Found URL ${url} in response of ${this.url}`);
            this.outgoingUrlsTests.push(urlTest);
            const status = await urlTest.test();
            success = success && status;
        }
        return success;
    }

    async test() {
        let javascriptAssertions;
        if (!this.urlTestConfig) {
            log.warn('Skipping Tests for ', this.url, 'as no matching urlTestConfig found');
            return true;
        }
        let url = this.url;

        log.log('Testing URL', url);

        if (this.urlTestConfig.assumedBaseUrl) {
            url = this.urlTestConfig.assumedBaseUrl + url;
            // Update to full URL
            this.url = url;
            log.log('Converting to full URL', url);
        }
        const response = await getFile(url);
        const responseText = await response.text();

        this.responseText = responseText;

        log.verbose('Got Response for ', url);
        log.debug(`Response for ${url}:\n\t`, responseText);

        // Test-1
        const inOrderCheckResult = this.contentCheck();

        /*
         * Added a try catch block for events-driven-jslib -> init(domLib) function because it contained window.localStorage which throws an error when you eval with jsDOM window
         * Although the error has been handled by jslib end inside the catch block but we are still logging the error,
         * Hence while running the smoke tests the DOMException {} error will still be visible, but the test cases will pass
         */
        // Test-2
        const contentTypeValidation = this.validateContentType();
        // const contentTypeValidation = true;

        if (this.urlTestConfig.mochaFiles) {
            // Test-3
            javascriptAssertions = await UrlTest.javascriptAssertions(
                this.jsDomWindow,
                this.urlTestConfig.mochaFiles,
                this.mochaSupportFilePath
            );
        }

        const urlTestStatus = contentTypeValidation && inOrderCheckResult && !javascriptAssertions;

        if (urlTestStatus) {
            log.success('UrlTest Passed for', this.url);
        } else {
            log.fail(
                'UrlTest Failed.',
                {
                    contentTypeValidation,
                    inOrderCheckResult,
                    javascriptAssertions,
                },
                this.url
            );
        }

        if (javascriptAssertions) {
            log.fail(javascriptAssertions);
        }

        const outGoingUrlsStatus = await this.checkoutgoingUrls();
        return urlTestStatus && outGoingUrlsStatus;
    }
}

class SmartCodeTest {
    smartCodeConfig;

    accountId;

    urlsTestConfig: UrlsTestConfig;

    settingsUrlsTests: UrlTest[] = [];

    constructor(smartCodeConfig, urlsTestConfig: UrlsTestConfig) {
        this.accountId = smartCodeConfig.accountId;
        this.smartCodeConfig = smartCodeConfig;
        this.urlsTestConfig = urlsTestConfig;
    }

    validateIncludedIn() {
        const matchResults: boolean[] = [];

        this.settingsUrlsTests.forEach(function (urlTest) {
            let matchFound = true;
            const urlTestConfig = urlTest.urlTestConfig;
            urlTestConfig &&
                urlTestConfig.outgoingUrls &&
                urlTestConfig.outgoingUrls.forEach((expectedOutgoingUrlPattern) => {
                    let result = false;
                    let matchingOutgoingUrl;
                    // Scan all OutgoingUrls to see if an expected outgoingUrlPattern was found or not.
                    urlTest.outgoingUrlsTests.forEach(function (outgoingUrlTest) {
                        if (new RegExp(expectedOutgoingUrlPattern).test(outgoingUrlTest.url)) {
                            result = true;
                            matchingOutgoingUrl = outgoingUrlTest.url;
                        }
                    });

                    if (result) {
                        log.success(
                            `Found an outgoing URL ${matchingOutgoingUrl} for ${expectedOutgoingUrlPattern}`
                        );
                    } else {
                        log.fail(
                            `Didn't found any outgoing URL matching ${expectedOutgoingUrlPattern}`
                        );
                    }
                    matchFound = matchFound && result;
                });

            matchResults.push(matchFound);
        });
        return matchResults;
    }

    async testUrls() {
        const smartCodeConfig = this.smartCodeConfig;
        let success = true;
        for (var urlName in smartCodeConfig.urls) {
            const url = smartCodeConfig.urls[urlName];

            const urlTest = new UrlTest(url, this.urlsTestConfig);
            this.settingsUrlsTests.push(urlTest);

            const status = await urlTest.test();
            const matchResults = this.validateIncludedIn();
            if (
                matchResults.every(function (match) {
                    return match;
                })
            ) {
                log.success('Outgoing Requests expectation met');
            }
            success = success && status;
        }
        return success;
    }

    async test() {
        log.debug(
            '\n\ttestConfig:',
            JSON.stringify(this.urlsTestConfig, null, 4),
            '\n\n\tsmartCodeConfig:',
            JSON.stringify(this.smartCodeConfig, null, 4)
        );

        // Test All URLs individually
        return await this.testUrls();
    }
}

try {
    // Get filtered testConfigs and smartCodesConfigs
    main(testConfigs, smartCodesConfigs, async function (testConfig: TestConfig, smartCodeConfig) {
        Object.entries(testConfig.urls).forEach(function ([pattern, urlTestConfig]) {
            if (urlTestConfig.outgoingUrls && !urlTestConfig.isSettingsRequest) {
                log.warn(
                    'Outgoing Urls specified in a non settings urlTestConfig:',
                    pattern,
                    '.This would be ignored'
                );
            }
        });
        const smartCodeTest = new SmartCodeTest(smartCodeConfig, testConfig.urls);
        const status = await smartCodeTest.test();
        return status;
    }).then(function (status) {
        log.verbose('Main Ended');

        // Explicitly Exit as there seems to be some issue with JSDOM when executing va.js causing nodejs process to stuck
        if (status) process.exit(0);
        else process.exit(1);
    });
} catch (error) {
    log.fail(`Something went wrong.Error is ${error}`);
    process.exit(1);
}
