/* eslint-disable */

module.exports = {
    name: null,
    version: '0.1.0',
    description: '',
    main: 'dist/index.js',
    license: 'MIT',
    scripts: {
        'build:esm': 'parcel build src/index.js --no-minify --no-source-maps --out-file index.js',
        'build:umd': 'parcel build src/index.js --global :libName --out-file index.umd.js',
        'build': 'npm run build:esm && npm run build:umd',
        'doc': 'jsdoc -c .jsdoc.json -d ./docs/${npm_package_version}/',
        'doc:latest': 'jsdoc -c .jsdoc.json -d ./docs/latest/',
        'doc:open': 'npm run doc && open docs/${npm_package_version}/index.html',
        'lint': 'eslint "src/**"',
        'start': 'parcel example/index.html --open --out-dir example/dist',
        'test': 'jest --config jest.config.json',
        'test:watch': 'npm run test -- --watchAll',
        'test:open': 'npm run test && open coverage/lcov-report/index.html',
        'test:coveralls': 'npm run test -- --coverageReporters=text-lcov | coveralls',
        'preversion': 'npm run lint && npm run test',
        'version': 'npm run build && npm run doc && npm run doc:latest',
        'postversion': 'git add docs/ && git commit -am \'Documentation ${npm_package_version}\' && git push --follow-tags'
    }
}
