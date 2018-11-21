const chalk = require('chalk');
const kebabcase = require('lodash.kebabcase');
const { upperCamelcase, replaceInObject } = require('../utils');
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
            if (!packageJson) {
                resolve(project);
            }
            log.debug(`Setting the package.json name as the project name: ${name}`);
            packageJson.name = name;

            log.debug(`Replacing package.json stub placeholders with upper kebab case project name: ${kebabcase(name)}`);
            packageJson.scripts = replaceInObject(packageJson.scripts, ':libNameKebab', kebabcase(name));
            log.debug(`Replacing package.json stub placeholders with upper camel case project name: ${upperCamelcase(name)}`);
            packageJson.scripts = replaceInObject(packageJson.scripts, ':libName', upperCamelcase(name));

            return resolve(Object.assign(project, { name, packageJson }));
        } catch (error) {
            return reject(new InstallError({ error, code: 1, message: chalk.red('Cannot name the package.json!') }));
        }
    });
};
