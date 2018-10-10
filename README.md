# pdor

[![Build Status](https://travis-ci.com/docomodigital/pdor.svg?branch=master)](https://travis-ci.com/docomodigital/pdor) [![Greenkeeper badge](https://badges.greenkeeper.io/docomodigital/pdor.svg)](https://greenkeeper.io/)

**pdor** is a tool to generate a library from a given boilerplate.

## Available boilerplates

* [**Vanilla JS**](https://github.com/docomodigital/pdor-vanillajs-library): generate a Vanilla js project
* [**React Component**](https://github.com/docomodigital/pdor-react-component): generate a React component 
* **Remote**: pass a github repo url to use your own boilerplate

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

---

## Create a custom boilerplate

A bare minimum boilerplate is a Github repository with a **pdor.config.json** configuration file with the following fields:

* **type**: the boilerplate name
* **renameOptions**: an object with the files/strings renaming instructions.
    * **filesToBeRenamed**:  an object with the file to be renamed as key and the destination file as value, supports the [**:targetName**](#:targetName) placeholder, they are processed one after the other, so if a files to be renamed is inside a directory to be renamed, you should specify as source the result of the directory renaming (see the example below)
    * **replaceInFiles**: an array of objects with the followings fields:
        * **stubName**: the placeholder to search
        * **to**: the desired replacement (supports the [**:targetName**](#:targetName) placeholder)
        * **files**: array of files to scan
        
You can also put your pdor config inside a **package.json** in the **pdor** field:

```json
{
    "name": "custom-boilerplate",
    "version": "1.0.0",
    "dependencies": {},
    "pdor": {
        "type": "Custom Boilerplate",
        "renameOptions": {
        }
    }
}
```


**_renameOptions.filesToBeRenamed example_**

In this exemple we have to rename an entire folder and a file inside that folder:
* src/YourLib => src/:targetName
* src/YourLib/YourLib.test.js => src/:targetName/:targetName.test.js

Since the directory renaming is done before the file renaming, if we specify as file source *src/YourLib/YourLib.test.js* it won't be renamed because the directory already changed name, you should specify as source the directory renaming result, in this case:
*src/:targetName/YourLib.test.js* (the placeholder [**:targetName**](#:targetName) is supported)   

```json
"filesToBeRenamed": {
  "src/YourLib": "src/:targetName",
  "src/:targetName/YourLib.test.js": "src/:targetName/:targetName.test.js"
}
```
**_renameOptions.replaceInFiles example_**
```json
"replaceInFiles": [
  {
    "stubName": "YourLib",
    "to": ":targetName",
    "files": [
      "src/index.js",
      "src/YourLib/index.js"
    ]
  }
]
```
 
**Note**: pdor first replace the strings in the given files array and AFTER move (rename) the files, so in the **replaceInFiles** section you should specify the files before the renaming.

#### :targetName
The **:targetName** placeholder is used to replace :targetName with the upper camelcase project name passed via the cli command (ex: my-app => MyApp)
 
The rest of the boilerplate can be structured in any way, it will be copied in the destination folder. 
 
You can also keep your boilerplate locally and use them specifying the absolute path to the config json file:
```bash
npx @docomodigital/pdor my-app -t /path/to/config/file.json
```