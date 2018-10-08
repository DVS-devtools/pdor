const figlet = require('figlet');
const chalk = require('chalk');
const log = require('../logger');

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
        log.debug('All done, exiting with code 0');
        process.exit(0);
    });
};
