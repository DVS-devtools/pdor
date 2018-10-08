/* eslint-disable no-console */
const { program } = require('./program');

/**
 * @module logger
 * @name Logger
 * Print message on the console
 * @type {{log(*=): void, debug(*=): void}}
 */
module.exports = {
    /**
     * Print info message
     * @param args
     */
    log(args) {
        console.log(args);
    },
    /**
     * Print only if the program is running with the --verbose option
     * @param args
     */
    debug(args) {
        if (program.verbose) {
            console.log(args);
        }
    }
};
