/**
 * This runs other type of tests as well currently. As there are many DaCDN jobs using this exact same command, it allows us to keep adding more types of tests without modifying those configurations of so many servers.
 */

import { automationTests } from "./index";
import { doDacdnVerifier } from "./config";
import { IS_TESTAPP, ONLY_EVENTS_ARCH_DACDN_VERIFIER } from "../env";
const shell = require('shelljs');
let testSuccess = true;
function markTestsFailureIfCodeIsNonZero(code) {
    if (code !== 0) {
        testSuccess = false;
    }
}
async function allJenkinsTests() {
    if (!ONLY_EVENTS_ARCH_DACDN_VERIFIER) {
        //shell.exec(`git submodule init && git submodule update && cd ../../dacdn && git submodule init && git submodule update`);
        await automationTests();
    }
    if (doDacdnVerifier) {
        try {
            if (!IS_TESTAPP) {
                if (!ONLY_EVENTS_ARCH_DACDN_VERIFIER) {
                    markTestsFailureIfCodeIsNonZero(shell.exec('yarn dacdn-verifier:website ' + process.argv.slice(2).join(' ')).code);
                    markTestsFailureIfCodeIsNonZero(shell.exec('yarn dacdn-verifier:server ' + process.argv.slice(2).join(' ')).code);
                    markTestsFailureIfCodeIsNonZero(shell.exec('yarn dacdn-verifier:website:events ' + process.argv.slice(2).join(' ')).code);
                } else {
                    markTestsFailureIfCodeIsNonZero(shell.exec('yarn dacdn-verifier:website:events ' + process.argv.slice(2).join(' ')).code);
                }

                if (testSuccess) {
                    console.log(`[SUCCESS]. All Test cases passed.`);
                } else {
                    console.log(`[FAILED]. Test cases failed. Search [FAILED] key in the complete logs to know about the failures.`);
                    process.exit(1);
                }
            }
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
}

allJenkinsTests();