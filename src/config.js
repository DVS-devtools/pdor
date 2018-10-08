/* eslint-disable global-require,import/no-dynamic-require */
const fspath = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const fetch = require('node-fetch');
const gitUrlParse = require('git-url-parse');
const { InstallError } = require('./errors');
const log = require('./logger');
const defaultPackageJson = require('./defaults/package');
const { defaultBoilerplates, defaultBoilerplatesBasePath } = require('./defaults/boilerplateTypes');
const { removeExtraSlashes, formatDependencies } = require('./utils');

/**
 * Try to get the local config file
 * @param path
 * @param absoulte
 * @returns {*}
 */
function getConfigFile(path, absoulte = false) {
    try {
        let configPath = !absoulte ? fspath.join(path, 'boilerplate-config.json') : path;
        if (fs.existsSync(configPath)) {
            return require(configPath);
        }
        configPath = fspath.join(path, 'config.json');
        if (fs.existsSync(configPath)) {
            return require(configPath);
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
function getRawContentUrl(repoUrl, file = 'package.json') {
    const githubRawBaseUrl = 'https://raw.githubusercontent.com';
    try {
        const parsed = gitUrlParse(repoUrl);
        const path = parsed.pathname.replace('.git', '');
        const branch = parsed.hash || 'master';

        return removeExtraSlashes(`${githubRawBaseUrl}/${path}/${branch}/${file}`);
    } catch (error) {
        if (error instanceof InstallError) {
            throw error;
        }
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
     * Given type is a local reference (absolute path or prebuilt boilerplate name)
     * Try to get the config
     * @param type
     * @returns {Promise<any>}
     */
    resolveLocalConfig(type) {
        return new Promise((resolve, reject) => {
            let config;
            try {
                if (!fspath.isAbsolute(type)) {
                    if (!Object.keys(defaultBoilerplates).includes(type)) {
                        log.debug(`${type} is not a valid boilerplate, available boilerplates:`);
                        log.debug(Object.keys(defaultBoilerplates).join('\n'));
                        throw new InstallError({ code: 1, message: chalk.red('Selected boilerplate not valid') });
                    }
                    this.type = defaultBoilerplates[type];
                    this.boilerplatePath = fspath.join(defaultBoilerplatesBasePath, type);
                    config = getConfigFile(this.boilerplatePath);
                } else {
                    this.boilerplatePath = fspath.resolve(fspath.dirname(type));
                    this.type = type.split('/').reverse()[1]; // eslint-disable-line prefer-destructuring
                    config = getConfigFile(type, true);
                }
                return resolve(config);
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
                    repoUrl = getRawContentUrl(type, 'boilerplate-config.json');
                    log.debug(`Try to fetch config from ${repoUrl}`);
                    return fetch(repoUrl)
                        .then((res) => {
                            if (!res.ok) {
                                throw new InstallError({ code: 1, message: chalk.red('Remote repository not found') });
                            }
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
                this.packageJson = Object.assign(this.packageJson, config);
                delete this.packageJson.boilerplate;
                this.dependencies = formatDependencies(config.dependencies || []);
                this.devDependencies = formatDependencies(config.devDependencies || []);
                if (config.boilerplate) {
                    this.type = config.boilerplate.type || this.type;
                    this.renameOptions = config.boilerplate.renameOptions || null;
                }
                return this;
            });
    }
};
