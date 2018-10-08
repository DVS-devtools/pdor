const chalk = require('chalk');
const fs = require('fs-extra');
const { program } = require('../program');
const log = require('../logger');

/**
 * @module steps/clearOutputAndExit
 * @name ClearOutputAndExit
 * Called when an error occurs, stop the generation process
 * If the Project was already copyied, remove it to clean everything up.
 * @param error
 */
module.exports = function clearOutputAndExit(error) {
    if (error.project && fs.existsSync(error.project.path)) {
        fs.removeSync(error.project.path);
    }
    log.log('');
    if (error instanceof Error) {
        if (program.verbose) {
            log.debug(error.stack);
        } else {
            log.log(error.message);
        }
        if (error.error) {
            log.debug(error.error);
        }
    }
    log.log(`${chalk.red('Exiting...')}`);
    log.debug(`Exiting with code ${error.code || 1}`);
    process.exit(error.code || 1);
};
