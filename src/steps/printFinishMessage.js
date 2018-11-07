const fs = require('fs-extra');
const fspath = require('path');
const figlet = require('figlet');
const chalk = require('chalk');
const log = require('../logger');
const { removeExtraSlashes } = require('../utils');

function logCommands({ path, repoUrl, branch }) {
    const contributing = fspath.join(path, 'CONTRIBUTING.md');
    if (fs.existsSync(contributing) && repoUrl) {
        const contributingUrl = removeExtraSlashes(`${repoUrl.replace('.git', '')}/blob/${branch}/CONTRIBUTING.md`);
        log.log('For a list of available commands, please see:');
        log.log(`${chalk.cyan(contributingUrl)}`);
    }
}

/**
 * @module steps/printFinishMessage
 * @name PrintFinishMessage
 * Print a message to confirm the successful finish of the generation process
 * @param project
 */
module.exports = function printFinishMessage(project) {
    const { name, path, type } = project;
    figlet(name, (err, data) => {
        log.log(data);

        log.log(`${chalk.green(`${type} boilerplate installed successfully in ${path}`)}
What now?
        
${chalk.cyan(`$ cd ${path} and start coding!`)}
`);
        logCommands(project);
        log.debug('All done, exiting with code 0');
        process.exit(0);
    });
};
