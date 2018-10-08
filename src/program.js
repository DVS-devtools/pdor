const cprogram = require('commander');
const boilerplatePackageJson = require('../package.json');

let name;

/**
 * @module program
 * @name Program
 * The CLI program
 * Usage:
 * js-library-boilerplate <project-name> [options]
 * Available options:
 * - --yarn (-y), use Yarn if available to install dependencies
 * - --verbose (-v), print more messages
 * - --type (-t), specify a boilerplate type
 * - --no-interaction, exit the process if an user interaction is requested, useful for CI tools
 * - --skip-install, skip dependencies installation,
 * useful for test or for project that do not rely on package managers
 * @type {local.Command}
 */
const program = cprogram
    .version(boilerplatePackageJson.version)
    .name(Object.keys(boilerplatePackageJson.bin)[0] || 'js-library-boilerplate')
    .usage('<project-name> [options]')
    .arguments('<project-name>')
    .action(projectName => name = projectName)
    .option('-y, --yarn', 'Use Yarn if available', false)
    .option('-v, --verbose', 'Verbose', false)
    .option('-t, --type [type]', 'Boilerplate type')
    .option('--no-interaction', 'Fail if user interaction is needed', false)
    .option('--skip-install', 'Skip dependencies installation step', false)
    .parse(process.argv);

module.exports = {
    program,
    name
};