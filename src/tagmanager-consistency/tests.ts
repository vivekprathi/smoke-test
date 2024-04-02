/* eslint-disable guard-for-in */
/* eslint-disable no-console */
/**
 * README.md explains what this file does
 */
import fs = require('fs');
import child_process = require('child_process');
import {BASE_URL, DEBUG_MODE, HOSTNAME, IS_TESTAPP} from '../env';
const minimist = require('minimist');
const execSync = child_process.execSync;
const config = minimist(process.argv);
const path = require('path');
import request from 'node-fetch';
const chalk = require('chalk');
import crypto = require('crypto');
import {PrivatePublicMap} from '../DaCDNNodeEnum';

const tagsRepoPath = path.join(__dirname, '../../dacdn/tags/tagsConfig.json');
const oldTagsConfig = JSON.parse(
    fs.readFileSync(path.join(__dirname, './tagsConfigOld.json')).toString()
);

let criticalTagsMapper: Record<string, string> = {};
let nonCriticalTagsMapper: Record<string, string> = {};

let critical: Record<string, any> = {};
let nonCritical: Record<string, any> = {};
let criticalOld: Record<string, any> = {};
let nonCriticalOld: Record<string, any> = {};
console.log(chalk.red(`Hostname is ${BASE_URL}`));
console.log(chalk.red(`debug mode flag is ${DEBUG_MODE}`));

function getFile(url: string, name?: string, mapper?: Record<string, string>): Promise<string> {
    if (!url.includes('?')) {
        url += '?__r=' + Math.random();
    } else {
        url += '&__r=' + Math.random();
    }
    console.log(`getting ${name ? name : ''} from ${url}`);
    return (
        request(url)
            .then((response): Promise<string> => response.text())
            .then((body): string => {
                if (DEBUG_MODE) console.log(`Response received is ${body}`);
                if (mapper && name) return (mapper[name] = body);
                else return body;
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .catch((err): any => err)
    );
}
interface TagConfig {
    b64Encoding: string;
    path: string;
}

async function getTags(
    tagType: Record<string, TagConfig>,
    mapper: Record<string, string>
): Promise<string | void> {
    for (const tag in tagType) {
        const tagUrl = `${BASE_URL}/web/${tagType[tag].b64Encoding}/tag-${Math.floor(
            Math.random() * 1000
        )}.js`;
        try {
            if (
                tag.includes('pc') ||
                tag.includes('s:0.2') ||
                tag.includes('s:0.3') ||
                tag.includes('s:0.4')
                // eslint-disable-next-line no-empty
            ) {
            } else {
                // eslint-disable-next-line no-await-in-loop
                await getFile(tagUrl, tag, mapper);
            }
        } catch (error) {
            console.error(error);
        }
    }
}

async function identifyNonCriticalFiles(): Promise<string | void> {
    console.log(chalk.yellow('Testing all the non critical tags'));
    console.log('===================================================');
    for (const tag in nonCritical) {
        const filesUrl: string[] = [];
        console.log(chalk.cyan(`current tag being tested is ${tag}`));
        if (tag.includes('pc')) {
            //skip tag in case it has pc
            console.log(chalk.red(`Skipping tag ${tag} as it has pushcrew bundled with it`));
            continue;
        }
        if (tag.includes('s:0.2') || tag.includes('s:0.3') || tag.includes('s:0.4')) {
            console.log(
                chalk.red(`Skipping tag ${tag} as it uses an older version of survey library`)
            );
            continue;
        }
        if (tag.includes('a:1.0')) {
            console.log(
                chalk.red(`Skipping tag ${tag} as it uses an older version of analyze library`)
            );
            continue;
        }
        const fileNames = tag.split(',');
        for (let i = 0; i < fileNames.length; i++) {
            const feature = fileNames[i].split(':')[0];
            const version = fileNames[i].split(':')[1];
            const fileName = fileNames[i].split(':')[2];
            switch (feature) {
                case 's':
                    if (version === '0.5' || version === 'latest') {
                        filesUrl.push(`${BASE_URL}/va_survey.js`);
                    } else {
                        console.log(
                            chalk.red(
                                `Skipping tag ${tag} as it serves older version of survey library`
                            )
                        );
                    }
                    break;
                case 'a':
                    if (fileName) {
                        if (fileName === 'gquery')
                            filesUrl.push(`${BASE_URL}/analysis/${version}/opa.js`);
                        else if (fileName === 'jquery')
                            filesUrl.push(`${BASE_URL}/analysis/${version}/opajq.js`);
                        else filesUrl.push(`${BASE_URL}/analysis/${version}/opanj.js`);
                    } else {
                        filesUrl.push(`${BASE_URL}/analysis/${version}/opa.js`);
                    }
                    break;
                case 'tr':
                    filesUrl.push(`${BASE_URL}/${version}/track.js`);
                    break;

                default:
                    break;
            }
        }
        let filesData = ``;
        for (let i = 0; i < filesUrl.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            filesData += await getFile(filesUrl[i]);
        }
        const tagData = nonCriticalTagsMapper[tag].replace(`///id=${tag}\n`, '');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (md5(filesData) === md5(tagData)) console.log(chalk.cyan(`${tag} passed the test`));
        else {
            // FIXME: WHY these tests are not failing the build. There are cases of a:1.0 tags, those can fail and should be skipped
            console.log(chalk.red(`${tag} failed the tests`));
            // const diff = jsdiff.diffChars(filesData, tagData);
            // diff.forEach(function(part: any): void {
            //     // green for additions, red for deletions
            //     // grey for common parts
            //     // eslint-disable-next-line no-unused-vars
            //     const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
            //     console.log(part);
            // });
            throw new Error(`Test failed for tag ${tag}`);
        }
    }
}

const md5 = function (str: string): string {
    return crypto.createHash('md5').update(str, 'utf8').digest('hex');
};

async function identifyCriticalFiles(): Promise<string | void> {
    console.log(chalk.red('Testing all the critical tags'));
    console.log('================================================================================');
    for (const tag in critical) {
        console.log(chalk.cyan(`Current tag being tested is ${tag}`));
        if (tag.includes('gquery')) {
            console.log(
                chalk.red(
                    `Skipping tag: ${tag} as it has gquery and gQuery files don't exist without tags`
                )
            );
            continue;
        }
        if (tag.includes('debug')) {
            console.log(
                chalk.red(
                    `Skipping tag[TEMPORARY]: ${tag} as it has debug files. This test needs to be done later`
                )
            );
            continue;
        }
        const files = tag.split(':')[2].split('%');
        const version = tag.split(':')[1];
        let fileName = ``;
        for (let i = 0; i < files.length; i++) {
            if (files.indexOf('sync') > -1) fileName = `vis_opt_no_jquery`;
            if (files.indexOf('sync') > -1 && files.indexOf('jquery') > -1) fileName = `vis_opt`;
            if (files.indexOf('async') > -1) fileName = `vanj`;
            if (files.indexOf('async') > -1 && files.indexOf('jquery') > -1) fileName = `va`;
            if (files.indexOf('safari') > -1) fileName += `_safari`;
        }
        const url = `${BASE_URL}/${version}/${fileName}.js`;

        // eslint-disable-next-line no-await-in-loop
        const data = await getFile(url);
        const tagData = criticalTagsMapper[tag].replace(`///id=${tag}\n`, '');
        if (md5(data) === md5(tagData)) {
            console.log(chalk.cyan(`${tag} passed the test`));
        } else {
            console.log(chalk.red(`${tag} failed the test`));
            throw new Error(`Test failed for tag ${tag}`);
        }
    }
}

async function identifyCriticalFilesOld(): Promise<string | void> {
    console.log(chalk.red('Testing all the critical tags v1 version'));
    console.log('================================================================================');
    for (const tag in criticalOld) {
        console.log(chalk.cyan(`Current tag being tested is ${tag}`));
        if (tag.includes('gquery')) {
            console.log(
                chalk.red(
                    `Skipping tag: ${tag} as it has gquery and gQuery files don't exist without tags`
                )
            );
            continue;
        }
        if (tag.includes('debug')) {
            console.log(
                chalk.red(
                    `Skipping tag[TEMPORARY]: ${tag} as it has debug files. This test needs to be done later`
                )
            );
            continue;
        }
        const files = tag.split(':')[2].split('%');
        const version = tag.split(':')[1];
        let fileName = ``;
        for (let i = 0; i < files.length; i++) {
            if (files.indexOf('sync') > -1) fileName = `vis_opt_no_jquery`;
            if (files.indexOf('sync') > -1 && files.indexOf('jquery') > -1) fileName = `vis_opt`;
            if (files.indexOf('async') > -1) fileName = `vanj`;
            if (files.indexOf('async') > -1 && files.indexOf('jquery') > -1) fileName = `va`;
            if (files.indexOf('safari') > -1) fileName += `_safari`;
        }
        const url = `${BASE_URL}/${version}/${fileName}.js`;
        // eslint-disable-next-line no-await-in-loop
        const data = await getFile(url);
        const lines = criticalTagsMapper[tag].split('\n');
        lines.splice(0, 1);
        const tagData = lines.join('\n');
        if (md5(data) === md5(tagData)) {
            console.log(chalk.cyan(`${tag} passed the test`));
        } else {
            console.log(chalk.red(`${tag} failed the test`));
            throw new Error(`Test failed for tag ${tag}`);
        }
    }
}

async function identifyNonCriticalFilesOld(): Promise<string | void> {
    console.log(chalk.yellow('Testing all the non critical tags v1 version'));
    console.log('===================================================');
    for (const tag in nonCriticalOld) {
        const filesUrl: string[] = [];
        console.log(chalk.cyan(`current tag being tested is ${tag}`));
        if (tag.includes('pc')) {
            //skip tag in case it has pc
            console.log(chalk.red(`Skipping tag ${tag} as it has pushcrew bundled with it`));
            continue;
        }
        if (tag.includes('s:0.2') || tag.includes('s:0.3') || tag.includes('s:0.4')) {
            console.log(
                chalk.red(`Skipping tag ${tag} as it uses an older version of survey library`)
            );
            continue;
        }
        if (tag.includes('a:1.0')) {
            console.log(
                chalk.red(`Skipping tag ${tag} as it uses an older version of analyze library`)
            );
            continue;
        }
        const fileNames = tag.split(',');
        for (let i = 0; i < fileNames.length; i++) {
            const feature = fileNames[i].split(':')[0];
            const version = fileNames[i].split(':')[1];
            const fileName = fileNames[i].split(':')[2];
            switch (feature) {
                case 's':
                    if (version === '0.5' || version === 'latest') {
                        filesUrl.push(`${BASE_URL}/va_survey.js`);
                    } else {
                        console.log(
                            chalk.red(
                                `Skipping tag ${tag} as it serves older version of survey library`
                            )
                        );
                    }
                    break;
                case 'a':
                    if (fileName) {
                        if (fileName === 'gquery')
                            filesUrl.push(`${BASE_URL}/analysis/${version}/opa.js`);
                        else if (fileName === 'jquery')
                            filesUrl.push(`${BASE_URL}/analysis/${version}/opajq.js`);
                        else filesUrl.push(`${BASE_URL}/analysis/${version}/opanj.js`);
                    } else {
                        filesUrl.push(`${BASE_URL}/analysis/${version}/opa.js`);
                    }
                    break;
                case 'tr':
                    filesUrl.push(`${BASE_URL}/${version}/track.js`);
                    break;

                default:
                    break;
            }
        }
        let filesData = ``;
        for (let i = 0; i < filesUrl.length; i++) {
            // eslint-disable-next-line no-await-in-loop
            filesData += await getFile(filesUrl[i]);
        }
        const tagData = nonCriticalTagsMapper[tag].replace(`///id=${tag}\n`, '');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (md5(filesData) === md5(tagData)) console.log(chalk.cyan(`${tag} passed the test`));
        else {
            // FIXME: WHY these tests are not failing the build. There are cases of a:1.0 tags, those can fail and should be skipped
            console.log(chalk.red(`${tag} failed the tests`));
            throw new Error(`Test failed for tag ${tag}`);
        }
    }
}

function geocheck(): Promise<void> {
    // Specifially use the public IP to do geocheck. Private IP traffic would go through VPN which has different location.
    return getFile(`http://${PrivatePublicMap[HOSTNAME]}/geocheck`).then(function (body): void {
        console.log('GEOCHECK RESULT', body);
        if (!body.includes('Washington, DC, US') && !IS_TESTAPP) {
            throw new Error('GeoCheck Failed. Expected "DC, US". Got ' + body);
        }
    });
}

function main(): void {
    // Skip tests fpr vwo-analytics.com for now as va.js would have jar content but not the corresponding tag file.
    if (BASE_URL.includes('vwo-analytics.com')) {
        return;
    }
    getTags(critical, criticalTagsMapper)
        .then((): Promise<string | void> => identifyCriticalFiles())
        .then((): Promise<string | void> => getTags(nonCritical, nonCriticalTagsMapper))
        .then((): Promise<string | void> => identifyNonCriticalFiles())
        .then((): Promise<string | void> => {
            criticalTagsMapper = {};
            nonCriticalTagsMapper = {};
            return getTags(criticalOld, criticalTagsMapper);
        })
        .then((): Promise<string | void> => identifyCriticalFilesOld())
        .then((): Promise<string | void> => getTags(nonCriticalOld, nonCriticalTagsMapper))
        .then((): Promise<string | void> => identifyNonCriticalFilesOld())
        .then((): Promise<string | void> => geocheck())
        .then((): void => {
            console.log('All tests passed');
        })
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        .catch((err) => {
            console.error(err);
            process.exit(1);
            //throw new Error(err)
        });
}
async function fetchingDacdnVersion(baseUrl: string): Promise<string> {
    let response: any;
    try {
        // endpoint url for fetching the dacdn version.
        const dacdnEndpoint = baseUrl + '/version';
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        response = await getFile(dacdnEndpoint);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
    }
    // eslint-disable-next-line no-console
    return JSON.parse(response).dacdn;
}
async function setupForTestCases(): Promise<void> {
    const dacdnBranchName =
        config.dacdnBranch && config.dacdnBranch.toLowerCase() !== 'na'
            ? config.dacdnBranch
            : await fetchingDacdnVersion(BASE_URL);
    console.log(chalk.green('Dacdn Branch/Tag:', dacdnBranchName));
    //ensure latest version of jslib-tests
    execSync(
        `git submodule init && git submodule update && cd ../dacdn && git checkout ${dacdnBranchName} && git submodule init && git submodule update `
    );

    const tagsConfig = JSON.parse(fs.readFileSync(tagsRepoPath).toString());
    critical = tagsConfig.critical;
    nonCritical = tagsConfig.nonCritical;
    // const BASE_URL = `http://ams5dev.visualwebsiteoptimizer.com`
    criticalOld = oldTagsConfig.critical;
    nonCriticalOld = oldTagsConfig.nonCritical;

    //Remove unused tags
    for (const tag in nonCritical) {
        if (
            tag.includes('pc') ||
            tag.includes('s:0.2') ||
            tag.includes('s:0.3') ||
            tag.includes('s:0.4')
        )
            delete nonCritical[tag];
    }
    main();
}
setupForTestCases();
