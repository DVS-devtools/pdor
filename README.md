# pdor

[![Build Status](https://travis-ci.com/docomodigital/pdor.svg?branch=master)](https://travis-ci.com/docomodigital/pdor) [![Greenkeeper badge](https://badges.greenkeeper.io/docomodigital/pdor.svg)](https://greenkeeper.io/)

**pdor** is a boilerplate to create a simple Javascript library from a given boilerplate

### Available boilerplates

* [**Vanilla JS**](https://github.com/docomodigital/pdor-vanillajs-library): Generate a Vanilla js project
* [**React Component**](https://github.com/docomodigital/pdor-react-component): Generate a React component 
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
