const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const validateNpmPackageName = require('validate-npm-package-name');
const { program } = require('../program');
const { InstallError } = require('../errors');
const log = require('../logger');
let { name } = require('../program');

/**
 * @module steps/validatePackagename
 * @name ValidatePackagename
 * Validate the given name.
 * If no name is given, ask for it
 * @param config
 * @returns {Promise<any>}
 */
module.exports = function validatePackagename(config) {
    return new Promise((resolve, reject) => {
        log.debug('Validating project name');
        let returnPromise;
        if (!name) {
            log.debug('Project name not specified');
            if (!program.interaction) {
                return reject(new InstallError({ code: 1, message: chalk.red('Project name required') }));
            }
            returnPromise = inquirer.prompt([
                {
                    name: 'promptedName',
                    type: 'input',
                    message: 'What is the project name?'
                }
            ]).then(({ promptedName }) => name = promptedName);
        } else {
            returnPromise = new Promise(res => res(name));
        }
        return returnPromise
            .then((promptedName) => {
                log.debug(`Given project name: ${promptedName}`);
                const validation = validateNpmPackageName(promptedName);
                if (!validation.validForNewPackages) {
                    log.debug('validateNpmPackageName fails, project name NOT VALID');
                    return reject(new InstallError({
                        code: 1,
                        message: chalk.red(`Cannot create a project called ${promptedName}, the name is not valid`)
                    }));
                }

                if (config.devDependencies.includes(promptedName)
                    || config.dependencies.includes(promptedName)) {
                    return reject(new InstallError({
                        code: 1,
                        message: chalk.red(`Cannot create a project called ${promptedName}, the name conflicts with some required dependencies`)
                    }));
                }
                log.debug('Project name VALID');

                return resolve(Object.assign({
                    name: promptedName,
                    path: path.resolve(promptedName)
                }, config));
            });
    });
};
