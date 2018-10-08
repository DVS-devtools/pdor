const inquirer = require('inquirer');
const chalk = require('chalk');
const { program } = require('../program');
const config = require('../config');
const { defaultBoilerplates, boilerplateresolver } = require('../defaults/boilerplateTypes');
const { InstallError } = require('../errors');

/**
 * @module steps/selectBoilerplate
 * @name SelectBoilerplate
 * Check if a boilerplate type is passed (as the --type option) and if is valid.
 * Else ask the user to choose from one of the prebuilt boilerplates or to type a github repo url
 * @returns {Promise<any>}
 */
module.exports = function selectBoilerplate() {
    return new Promise((resolve, reject) => {
        let { type } = program;
        let returnPromise;
        if (!type) {
            // --type is not defined
            if (!program.interaction) {
                return reject(new InstallError({ code: 1, message: chalk.red('Project type required') }));
            }
            // Ask the user to choose from one of the prebuild boilerplates
            returnPromise = inquirer.prompt([
                {
                    name: 'boilerplateType',
                    type: 'list',
                    message: 'Please select a boilerplate type',
                    choices: Object.keys(defaultBoilerplates).map(value => ({
                        value,
                        name: defaultBoilerplates[value]
                    }))
                }
            ]).then(({ boilerplateType }) => {
                if (boilerplateType === 'custom') {
                    return inquirer.prompt([
                        {
                            name: 'boilerplateType',
                            type: 'input',
                            message: 'Please paste the github repo url (ex: https://github.com/foo/bar.git)'
                        }
                    ]);
                }
                return Promise.resolve({ boilerplateType });
            }).then(({ boilerplateType }) => type = boilerplateType);
        } else {
            returnPromise = Promise.resolve(boilerplateresolver(type));
        }
        return returnPromise
            .then(promptedType => config.resolveConfig(promptedType))
            .then(conf => resolve(conf))
            .catch((error) => {
                if (error instanceof InstallError) {
                    return reject(error);
                }
                return reject(new InstallError({ error, code: 1, message: chalk.red('Cannot use the selected boilerplate type') }));
            });
    });
};
