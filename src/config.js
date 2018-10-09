/* eslint-disable global-require,import/no-dynamic-require */
const fspath = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const fetch = require('node-fetch');
const gitUrlParse = require('git-url-parse');
const { InstallError } = require('./errors');
const log = require('./logger');
const defaultPackageJson = require('./defaults/package');
const { removeExtraSlashes, formatDependencies } = require('./utils');

/**
 * Try to get the local config file
 * @param path
 * @returns {*}
 */
function getConfigFile(path) {
    try {
        const packageJson = fspath.basename(path) === 'package.json';
        if (fs.existsSync(path)) {
            return {
                packageJson,
                configFile: require(path),
            };
        }
        throw new Error('Config boilerplate not found');
    } catch (error) {
        throw new InstallError({ error, code: 1, message: chalk.red('Cannot get boilerplate config') });
    }
}

/**
 * Get the url to the raw config file on github
 * @param repoUrl
 * @param file
 * @returns {*}
 */
function getRawContentUrl(repoUrl, file = 'pdor.config.json') {
    const githubRawBaseUrl = 'https://raw.githubusercontent.com';
    try {
        const parsed = gitUrlParse(repoUrl);
        const path = parsed.pathname.replace('.git', '');
        const branch = parsed.hash || 'master';

        return removeExtraSlashes(`${githubRawBaseUrl}/${path}/${branch}/${file}`);
    } catch (error) {
        throw new InstallError({ error, code: 1, message: chalk.red('Cannot get boilerplate config') });
    }
}

/**
 * @module config
 * @name Config
 * The config object/parser
 * Based on the given boilerplate type, try to get the config file (remote or locally)
 * and parse it
 * @type {{
 * type: null,
 * config: {},
 * packageJson: ({name, version, description, main, license, scripts}|*),
 * dependencies: Array,
 * devDependencies: Array,
 * renameOptions: null,
 * boilerplatePath: null,
 * isRemote: boolean,
 * repoUrl: null,
 * resolveLocalConfig(*=): Promise<any>,
 * resolveRemoteConfig(*=): PromiseLike<T|never>,
 * resolveConfig(*=): *
 * }}
 */
module.exports = {
    /**
     * @string the type name
     */
    type: null,
    /**
     * @object the raw config
     */
    config: {},
    /**
     * @object metadata to build the package json
     */
    packageJson: defaultPackageJson,
    /**
     * @object dependencies to install
     */
    dependencies: [],
    /**
     * @object devDependencies to install
     */
    devDependencies: [],
    /**
     * @objects file and file contents renaming rules
     */
    renameOptions: null,
    /**
     * @string path to the folder containing the config file
     */
    boilerplatePath: null,
    /**
     * @boolean flag to check if the boilerplate is hosted remotely (github)
     */
    isRemote: false,
    /**
     * @string if the boilerplate is remote, we need the full url to the repository
     */
    repoUrl: null,
    /**
     * @boolean true if the config file is the package.json
     */
    isPackageJson: false,
    /**
     * Given type is a local reference (absolute path or prebuilt boilerplate name)
     * Try to get the config
     * @param type
     * @returns {Promise<any>}
     */
    resolveLocalConfig(type) {
        return new Promise((resolve, reject) => {
            try {
                this.boilerplatePath = fspath.resolve(fspath.dirname(type));
                this.type = type.split('/').reverse()[1]; // eslint-disable-line prefer-destructuring
                const { configFile, packageJson } = getConfigFile(type);
                this.isPackageJson = packageJson;
                return resolve(configFile);
            } catch (error) {
                return reject(error);
            }
        });
    },
    /**
     * Given type is an url of a github.com repo
     * Try to get its contents
     * @param type
     * @returns {PromiseLike<T | never>}
     */
    resolveRemoteConfig(type) {
        const typeObj = gitUrlParse(type);
        if (!['github.com'].includes(typeObj.source)) {
            throw new InstallError({ code: 1, message: chalk.red('Only git repository are supported as remote boilerplates') });
        }
        let repoUrl = getRawContentUrl(type);
        log.debug(`Try to fetch config from ${repoUrl}`);
        return fetch(repoUrl)
            .then((response) => {
                if (!response.ok) {
                    log.debug('package.json not found');
                    repoUrl = getRawContentUrl(type, 'package.json');
                    log.debug(`Try to fetch config from ${repoUrl}`);
                    return fetch(repoUrl)
                        .then((res) => {
                            if (!res.ok) {
                                throw new InstallError({ code: 1, message: chalk.red('Remote repository not found') });
                            }
                            this.isPackageJson = true;
                            return Promise.resolve(res);
                        });
                }
                return Promise.resolve(response);
            })
            .then(re => re.json())
            .then((conf) => {
                this.type = 'remote';
                this.repoUrl = type;
                this.config = conf;

                return conf;
            });
    },

    resolveConfig(type) {
        const typeObj = gitUrlParse(type);
        type = typeObj.href;
        this.isRemote = ['https', 'http', 'ssh'].includes(typeObj.protocol);
        const getConfig = this.isRemote ? this.resolveRemoteConfig(type)
            : this.resolveLocalConfig(type);

        return getConfig
            .then((config) => {
                if (this.isPackageJson) {
                    this.packageJson = Object.assign(this.packageJson, config);
                    delete this.packageJson.pdor;
                }
                this.dependencies = formatDependencies(config.dependencies || []);
                this.devDependencies = formatDependencies(config.devDependencies || []);
                const boilerplate = this.isPackageJson ? config.pdor : config;
                if (boilerplate) {
                    this.type = boilerplate.type || this.type;
                    this.renameOptions = boilerplate.renameOptions || null;
                    if (!boilerplate.generatePackageJson && !this.isPackageJson) {
                        delete this.packageJson;
                    }
                }
                return this;
            });
    }
};
