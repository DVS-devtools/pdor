const chalk = require('chalk');
const camelCase = require('lodash.camelcase');
const upperFirst = require('lodash.upperfirst');
const { InstallError } = require('../errors');
const log = require('../logger');

/**
 * @module steps/namePackageJson
 * @name NamePackageJson
 * Set the given name as the package.json name
 * Some scripts commands should need the project name to run properly,
 * replace the placeholder (:libName) with the project name
 * @param project
 * @returns {Promise<any>}
 */
module.exports = function namePackageJson(project) {
    return new Promise((resolve, reject) => {
        try {
            const { name, packageJson } = project;
            log.debug(`Setting the package.json name as the project name: ${name}`);
            packageJson.name = name;
            const { scripts } = packageJson;
            log.debug(`Replacing package.json stub placeholders with upper camel case project name: ${upperFirst(camelCase(name))}`);
            packageJson.scripts = Object.keys(scripts).reduce((obj, k) => {
                if (scripts[k].indexOf(':libName') > -1) {
                    log.debug(`Placeholder found on script ${k}, replacing...`);
                    obj[k] = scripts[k].replace(':libName', upperFirst(camelCase(name)));
                } else {
                    obj[k] = scripts[k];
                }
                return obj;
            }, {});

            return resolve(Object.assign(project, { name, packageJson }));
        } catch (error) {
            return reject(new InstallError({ error, code: 1, message: chalk.red('Cannot name the package.json!') }));
        }
    });
};
