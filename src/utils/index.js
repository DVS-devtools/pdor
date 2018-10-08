const fs = require('fs-extra');
const { execSync } = require('child_process');
const isArray = require('lodash.isarray');
const upperFirst = require('lodash.upperfirst');
const camelCase = require('lodash.camelcase');
const log = require('../logger');

/**
 * Convert the given string to an upper camel case string
 * @param text
 */
function upperCamelcase(text) {
    return upperFirst(camelCase(text));
}

/**
 * From a given string (url), remove all extra slashes (/foo//bar/ => /foo/bar/)
 * @param string
 * @returns {string}
 */
function removeExtraSlashes(string) {
    return string.replace(/([^:]\/)\/+/g, '$1');
}

/**
 * From a dependency object (package: version) return an array of depencencies,
 * joinable as string (package@version)
 * @param dependencies
 * @returns {string[]}
 */
function formatDependencies(dependencies) {
    if (isArray(dependencies)) {
        return dependencies;
    }
    return Object.keys(dependencies).map(dependency => (
        `${dependency}@${dependencies[dependency]}`
    ));
}

/**
 * Check if the given dir is empty
 * @param dir
 * @returns {boolean}
 */
function isEmptyDir(dir) {
    try {
        const d = fs.readdirSync(dir);
        return d.length === 0;
    } catch (e) {
        fs.mkdirSync(dir);
        return true;
    }
}

/**
 * Check if yarn is installed in the system
 * @param flag
 * @returns {boolean}
 */
function canUseYarn(flag = false) {
    try {
        execSync('yarnpkg --version', { stdio: 'ignore' });
        return flag;
    } catch (e) {
        log.debug('Yarn is not installed, force npm usage');
        return false;
    }
}

/**
 * Check if git is installed in the system
 * @returns {boolean}
 */
function canUseGit() {
    try {
        execSync('git --version', { stdio: 'ignore' });
        return true;
    } catch (e) {
        log.debug('Git is not installed');
        return false;
    }
}

module.exports = {
    upperCamelcase,
    removeExtraSlashes,
    formatDependencies,
    isEmptyDir,
    canUseYarn,
    canUseGit,
};
