# pdor

[![Build Status](https://travis-ci.com/docomodigital/pdor.svg?branch=master)](https://travis-ci.com/docomodigital/pdor)

**pdor** is a boilerplate to create a simple Javascript library from a given boilerplate

## Features

* **Build**: create production-ready distribution file, also UMD
* **Documentation**: create different documentation for each version
* **Lint**: check the quality of your code
* **Test**: test your code and check the code coverage
* **Example**: try your library with examples
* **Storybook**: try your React component with Storybook (only for react-component boilerplate)
* **Continuous Integration**: set your continuous integration environment with Travis CI

### Available boilerplates

* **Vanilla JS**: Generate a Vanilla js project
* **React Component**: Generate a React component 
* **Remote**: Pass a github repo url to use your own boilerplate

## Usage

With **npx** (with npm 5.2+ and higher):

```bash
npx @docomodigital/pdor my-app 
cd my-app
```

for older versions of npm, install the package as global first:

```bash
npm i -g @docomodigital/pdor
pdor my-app
cd my-app
```
### Available Options
* `--yarn`: use Yarn Package manager to install required dependencies instead of npm 
* `--type`: specify the boilerplate to use (`vanilla` or `react-component` )
* `--verbose`: print more info during the generation process
* `--no-interaction`: if an user input is required, stop the process. Useful for CI tools
* `--skip-install`: skip the dependency installation step

### Now you can:

* Edit source code and test of your library, contained in **src/**
* Check the quality of your code with ```npm run lint```
* Run tests with ```npm run test```
* Check the coverage of your tests with ```npm run test:open```
* Try your library with examples contained in **examples/**, with ```npm start```
* Try your React component with **storybook**, with stories contained in **stories**, with ```npm storybook```
* Create the documentation and read it with ```npm run doc:open```
* Integrate your library with Travis CI, using ***.travis.yml***
* Publish your library on NPM

You can find all commands for develop, maintain and publish your library on **CONTRIBUTING file**.

## Useful links

* [Parcel](https://github.com/parcel-bundler/parcel)
* [React](https://reactjs.org/)
* [JSDoc](https://github.com/jsdoc3/jsdoc)
* [Minami JSDoc Template](https://github.com/Nijikokun/minami)
* [ESLint](https://github.com/eslint/eslint)
* [AirBnb Styleguide](https://github.com/airbnb/javascript)
* [React Styleguide](https://www.npmjs.com/package/eslint-config-react-app)
* [Jest](https://github.com/facebook/jest)
* [Coveralls](https://github.com/nickmerwin/node-coveralls)
* [Travis CI](https://travis-ci.org/)
* [Storybook](https://storybook.js.org/)

## Next Steps

* Jenkins configuration 