const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs-extra');
const fspath = require('path');
const os = require('os');
const ora = require('ora');
const replaceInFiles = require('replace-in-files');
const { InstallError } = require('../errors');
const log = require('../logger');
const { upperCamelcase, isEmptyDir, canUseGit } = require('../utils');
const { program } = require('../program');

/**
 * Replace all string occurencies of **stubName** with **targetName**
 * @param project
 */
function renameFilesContent(project) {
    const { name, path, renameOptions } = project;
    if (renameOptions) {
        const replaceInFileConfigs = renameOptions.replaceInFiles || [];
        if (replaceInFileConfigs.length) {
            const targetName = upperCamelcase(name);
            const replacePromises = replaceInFileConfigs.map((replaceConfig) => {
                const { stubName } = replaceConfig;
                let { to } = replaceConfig;
                log.debug(`Renaming every reference to "${stubName}" with the upper camel case project name`);
                log.debug(`${stubName} => ${targetName}`);
                let files = [];
                if (replaceConfig.files) {
                    files = replaceConfig.files.map(file => fspath.join(path, file));
                }
                if (!to) {
                    to = targetName;
                } else {
                    to = to.replace(':targetName', targetName);
                }
                return replaceInFiles({
                    files, to, from: new RegExp(stubName, 'gm')
                });
            });
            return Promise.all(replacePromises)
                .then((res) => {
                    log.debug('Modified files:');
                    const result = res[0];
                    result.countOfMatchesByPaths.forEach((obj) => {
                        Object.keys(obj).forEach((file) => {
                            log.debug(`${file}: found ${obj[file]} matches`);
                        });
                    });
                })
                .then(() => log.debug('Renaming file contents complete'));
        }
        return Promise.resolve()
            .then(() => log.debug('No content files to replace'));
    }
    return Promise.resolve()
        .then(() => log.debug('No content files to replace'));
}

async function moveFiles(moveObjects) {
    for (const moveObject of moveObjects) { // eslint-disable-line no-restricted-syntax
        await fs.move(moveObject.from, moveObject.to); // eslint-disable-line no-await-in-loop
    }
}

/**
 * Rename files by the renameOptions.filesToBeRenamed param
 * @param project
 * @returns {Promise<void | never>}
 */
function renameFiles(project) {
    log.debug('Renaming necessary files...');
    const { renameOptions, name, path } = project;
    if (renameOptions) {
        const { filesToBeRenamed = {} } = renameOptions;
        const targetName = upperCamelcase(name);

        const moveObjects = Object.keys(filesToBeRenamed).map((source) => {
            const from = source.replace(/:targetName/g, targetName);
            const to = filesToBeRenamed[source].replace(/:targetName/g, targetName);
            log.debug(`Renaming ${from} to ${to}`);

            return { from: fspath.join(path, from), to: fspath.join(path, to) };
        });

        return moveFiles(moveObjects).then(() => log.debug('renaming complete'));
    }
    return Promise.resolve()
        .then(() => log.debug('Nothing to rename'));
}

/**
 * Remove the unnecessary boilerplate's config files
 * @param path
 * @returns {Promise<[void , void]>}
 */
function removeConfigFiles({ path }) {
    log.debug('Removing unnecessary config files...');
    const configFilePath = fspath.join(path, 'pdor.config.json');
    const gitFolderPath = fspath.join(path, '.git');
    return Promise.all([
        fs.remove(configFilePath),
        fs.remove(gitFolderPath)
    ]);
}

/**
 * Generating the project package.json and the project README.md
 * @param path
 * @param packageJson
 * @param name
 * @returns {Promise<void>}
 */
function generateFiles({ path, packageJson, name }) {
    let packagePromise;
    const spinner = ora(chalk.cyan('Generating package.json and README.md files...'));
    if (packageJson) {
        log.debug('WriteJson package.json');
        packagePromise = fs.writeJson(fspath.join(path, 'package.json'), packageJson, {
            spaces: 2,
            EOL: os.EOL
        });
    } else {
        packagePromise = Promise.resolve();
    }
    packagePromise.then(() => {
        log.debug('WriteFile empty README.md');
        return fs.writeFile(fspath.join(path, 'README.md'), `## ${name}`);
    }).then(() => spinner.succeed(chalk.green('Files generated with success')))
        .catch((error) => {
            spinner.fail(chalk.red('Cannot generate package.json and README.md files'));
            throw error;
        });
}

/**
 * Return the correct promise to chain based on the isRemote value (remote copy, git clone)
 * @param boilerplatePath
 * @param path
 * @param isRemote
 * @param repoUrl
 * @param verbose
 * @returns {Promise<T | never>}
 */
function copyPromise({
    boilerplatePath,
    path,
    isRemote,
    repoUrl,
    branch
}, verbose = false) {
    let promise;
    if (!isRemote) {
        log.debug('Copy local boilerplate');
        promise = fs.copy(boilerplatePath, path);
    } else {
        log.debug('Copy boilerplate from a Git repo');
        if (canUseGit()) {
            const cloneCommand = `git clone ${repoUrl} ${path}`;
            promise = new Promise((resolve, reject) => {
                try {
                    execSync(cloneCommand, { stdio: verbose ? [0, 1, 2] : 'ignore' });
                    execSync(`cd ${path} && git checkout ${branch}`, { stdio: verbose ? [0, 1, 2] : 'ignore' });
                    return resolve();
                } catch (error) {
                    return reject(error);
                }
            });
        } else {
            throw new InstallError({ code: 1, message: chalk.red('Git is required to use remote boilerplates') });
        }
    }
    return promise
        .then(() => log.debug('Copy done'));
}

/**
 * @module steps/copyFiles
 * @name CopyFiles
 * Copy the files specified on the boilerplatePath property in the destination folder.
 * If the folder already exists and is not empty,stop the process
 * If the boilerplate is remote (on github), clone the repo and checkout on the given branch.
 *
 * If the boilerplate is local, simply use "fs" to recursively copy the stubs content.
 *
 * If renameOptions are provided, do the renaming process
 * (file contents first, files and folders after)
 *
 * When the copy is finished, proceed to generate a package.json and an empty README.md
 * @param project
 * @returns {Promise<any>}
 */
module.exports = function copyFiles(project) {
    return new Promise((resolve, reject) => {
        const {
            path,
        } = project;

        if (!isEmptyDir(path)) {
            return reject(new InstallError({ code: 1, message: chalk.red(`Project ${path} already exists!`) }));
        }
        log.debug('Copy files to destination folder');
        const copySpinner = ora(`${chalk.cyan(`Generating project boilerplate on ${project.path}...`)}`);
        return copyPromise(project, program.verbose)
            .then(() => renameFilesContent(project))
            .then(() => renameFiles(project))
            .then(() => {
                copySpinner.succeed(`${chalk.green('Project files copied with success')}`);
                return generateFiles(project);
            })
            .then(() => removeConfigFiles(project))
            .then(() => {
                log.debug('Files generation complete');
                return resolve(project);
            })
            .catch((error) => {
                copySpinner.fail(chalk.red('Cannot generate the boilerplate!'));
                return reject(new InstallError({
                    project,
                    error,
                    code: 1,
                    message: chalk.red('Cannot generate the boilerplate!')
                }));
            });
    });
};
