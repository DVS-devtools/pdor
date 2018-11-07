# pdor

[![Build Status](https://travis-ci.com/docomodigital/pdor.svg?branch=master)](https://travis-ci.com/docomodigital/pdor) [![Greenkeeper badge](https://badges.greenkeeper.io/docomodigital/pdor.svg)](https://greenkeeper.io/)

**pdor** is a tool to generate a library from a given boilerplate.

## Available boilerplates

* [**Vanilla JS**](https://github.com/docomodigital/pdor-vanillajs-library): generate a Vanilla js project
* [**React Component**](https://github.com/docomodigital/pdor-react-component): generate a React component
* [**Typescript library**](https://github.com/docomodigital/pdor-typescript-library): generate a Vanilla Ts project 
* **Remote**: pass a github repo url to use your own boilerplate

## Usage

With **npx** (with npm 5.2+ and higher):

```bash
npx @docomodigital/pdor my-app 
```

for older versions of npm, install the package as global first:

```bash
npm i -g @docomodigital/pdor
pdor my-app
```
### Available Options
* `--yarn`: use Yarn Package manager to install required dependencies instead of npm 
* `--type`: specify the boilerplate to use (`vanilla`, `react-component`, `typescript` or a `github repo url`)
* `--verbose`: print more info during the generation process
* `--no-interaction`: if an user input is required, stop the process. Useful for CI tools
* `--skip-install`: skip the dependency installation step

## Commands
For a list of available features of the generated boilerplate, please refer to the used boilerplate configuration.
* [Vanilla js](https://github.com/docomodigital/pdor-vanillajs-library/blob/master/CONTRIBUTING.md)  
* [React Component](https://github.com/docomodigital/pdor-react-component/blob/master/CONTRIBUTING.md)
* [Typescript library](https://github.com/docomodigital/pdor-typescript-library/blob/master/CONTRIBUTING.md)  
---
Interested in creating a custom boilerplate? [Read how](https://github.com/docomodigital/pdor/blob/master/BOILERPLATE.md) 