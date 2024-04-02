import { LOG_LEVEL } from './env';
const chalk = require('chalk');


export const log = {
    fail: function (...args) {
        if (LOG_LEVEL >= 1) {
            args.unshift(chalk.red('FAILED:'));
            console.error.apply(console, args);
        }
    },
    success: function (...args) {
        if (LOG_LEVEL >= 1) {
            args.unshift(chalk.green('SUCCESS:'));
            console.log.apply(console, args);
        }
    },
    warn: function (...args) {
        if (LOG_LEVEL >= 1) {
            args.unshift(chalk.yellow('WARN:'));
            console.warn.apply(console, args);
        }
    },
    log: function (...args) {
        if (LOG_LEVEL >= 2) {
            args.unshift('LOG:');
            console.log.apply(console, args);
        }
    },
    verbose: function (...args) {
        if (LOG_LEVEL >= 3) {
            args.unshift('VERBOSE:');
            console.log.apply(console, args);
        }
    },
    debug: function (...args) {
        if (LOG_LEVEL >= 4) {
            args.unshift('DEBUG:');
            console.log.apply(console, args);
        }
    },
};
