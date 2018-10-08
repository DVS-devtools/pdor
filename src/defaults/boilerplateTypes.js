
const boilerplates = {
    vanilla: {
        name: 'Vanilla js',
        url: 'https://github.com/docomodigital/pdor-vanillajs-library'
    },
    'react-component': {
        name: 'React component',
        url: 'https://github.com/docomodigital/pdor-react-component'
    }
};

function getBoilerplates() {
    return Object.keys(boilerplates).reduce((obj, name) => {
        obj[boilerplates[name].url] = boilerplates[name].name;
        return obj;
    }, { custom: 'Custom (a github repo)' });
}

module.exports = {
    boilerplateresolver: type => boilerplates[type] ? boilerplates[type].url : type,
    defaultBoilerplates: getBoilerplates()
};
