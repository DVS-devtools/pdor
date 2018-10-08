#!/usr/bin/env node
const chalk = require('chalk');
const { InstallError } = require('./errors');
const {
    selectBoilerplate,
    validatePackageName,
    namePackageJson,
    copyFiles,
    installDependencies,
    printFinishMessage,
    clearOutputAndExit,
} = require('./steps');

selectBoilerplate()
    .then(validatePackageName)
    .then(namePackageJson)
    .then((project) => {
        process.on('SIGINT', () => {
            clearOutputAndExit(new InstallError({
                project,
                message: chalk.red('Caught interrupt signal, cleaning out and exiting...'),
                code: 0,
            }));
        });
        return project;
    })
    .then(copyFiles)
    .then(installDependencies)
    .then(printFinishMessage)
    .catch(clearOutputAndExit);
