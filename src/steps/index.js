/* eslint-disable global-require */

module.exports = {
    selectBoilerplate: require('./selectBoilerplate'),
    validatePackageName: require('./validatePackageName'),
    copyFiles: require('./copyFiles'),
    installDependencies: require('./installDependencies'),
    clearOutputAndExit: require('./clearOutputAndExit'),
    namePackageJson: require('./namePackageJson'),
    printFinishMessage: require('./printFinishMessage'),
};
