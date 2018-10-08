const path = require('path');
const fs = require('fs-extra');
const log = require('../logger');

const defaultBoilerplatesBasePath = path.join(__dirname, '../../boilerplates');

function getBoilerplates() {
    const defaults = fs.readdirSync(defaultBoilerplatesBasePath).reduce((obj, folder) => {
        try {
            const conf = JSON.parse(fs.readFileSync(path.join(defaultBoilerplatesBasePath, folder, 'boilerplate-config.json'), { encoding: 'utf8' }));
            obj[folder] = conf.boilerplate ? conf.boilerplate.type || folder : folder;
        } catch (e) {
            log.debug(`${folder} is not a valid boilerplate, skipping...`);
        }
        return obj;
    }, {});
    defaults.remote = 'Remote (a Github repo)';

    return defaults;
}

module.exports = {
    defaultBoilerplatesBasePath,
    defaultBoilerplates: getBoilerplates()
};
