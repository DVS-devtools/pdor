const { execSync } = require('child_process');
const { spawn } = require('child-process-promise');
const chalk = require('chalk');
const ora = require('ora');
const { program } = require('../program');
const { InstallError } = require('../errors');
const log = require('../logger');
const { canUseYarn } = require('../utils');

/**
 * Create the install command object
 * @param dependencies
 * @param yarn
 * @param dev
 * @returns {Object}
 */
function buildInstallCommand(dependencies, yarn = false, dev = false) {
    let base;
    if (yarn) {
        base = {
            command: 'yarn',
            args: ['add'].concat(dev ? ['-D'] : []).concat(['--ignore-engines']).concat(dependencies),
        };
    } else {
        base = {
            command: 'npm',
            args: ['add', [`--save${dev ? '-dev' : ''}`]].concat(dependencies),
        };
    }
    log.debug(`Installing dependencies
${dependencies.join('\n')}`);
    return base;
}

/**
 * Verbose install, show package manager install progress
 * @param path
 * @param dependencies
 * @param shouldUseyarn
 * @param dev
 * @returns {Promise<void>}
 */
function installVerbose(path, dependencies, shouldUseyarn, dev = false) {
    const { command, args } = buildInstallCommand(dependencies, shouldUseyarn, dev);
    return new Promise((resolve, reject) => {
        try {
            const stringCommand = `${command} ${args.join(' ')}`;
            execSync(stringCommand, { stdio: [0, 1, 2] });
            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
}

/**
 * Silent install, not show package manager install progress,
 * Show a spinner
 * @param path
 * @param dependencies
 * @param shouldUseyarn
 * @param dev
 * @returns {Promise}
 */
function installSilent(path, dependencies, shouldUseyarn, dev = false) {
    const { command, args } = buildInstallCommand(dependencies, shouldUseyarn, dev);
    const spawnPromise = spawn(command, args);
    const { childProcess } = spawnPromise;

    childProcess.stdout.on('data', (data) => {
        log.debug(data.toString());
    });

    childProcess.stderr.on('data', (data) => {
        log.debug(data.toString());
    });

    return spawnPromise;
}

/**
 * Execute the install command
 * @param path
 * @param dependencies
 * @param shouldUseyarn
 * @param dev
 * @returns Promise
 */
function install(path, dependencies, shouldUseyarn, dev = false) {
    if (process.cwd() !== path) {
        throw new InstallError({ message: `${chalk.red('Wrong path! Cannot install dependencies')}` });
    }
    return program.verbose ? installVerbose(path, dependencies, shouldUseyarn, dev)
        : installSilent(path, dependencies, shouldUseyarn, dev);
}

/**
 * @module steps/installDependencies
 * @name InstallDependencies
 * From the given config, try to install the required dependencies and devDependencies
 * If the --yarn option is defined and Yarn is installed in the system,
 * it will use it to manage the dependencies, else it will use npm
 * @param project
 * @returns {Promise<any | [any, any]>}
 */
module.exports = function installDependencies(project) {
    const { path, dependencies, devDependencies } = project;
    process.chdir(path);
    const yarn = canUseYarn(program.yarn);
    if (program.skipInstall) {
        return new Promise(resolve => resolve(project));
    }
    const spinner = ora(chalk.cyan('Installing dependencies, this can take a while... ')).start();
    log.debug(chalk.white(`Using ${yarn ? 'yarn' : 'npm'} to install packages...`));

    const devDependenciesPromise = devDependencies.length ? install(path, devDependencies, yarn)
        : Promise.resolve();

    const dependenciesPromise = dependencies.length ? install(path, dependencies, yarn)
        : Promise.resolve();

    return Promise.all([dependenciesPromise, devDependenciesPromise])
        .then(() => {
            spinner.succeed(chalk.green('Required dependencies installed successfully'));
            return project;
        }).catch((error) => {
            spinner.fail(chalk.red('Cannot install dependencies'));
            throw new InstallError({
                error,
                project,
                code: 1,
                message: chalk.red('Cannot install dependencies'),
            });
        });
};
