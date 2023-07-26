/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*
 * File: concourseManager.ts
 * Created on: Wednesday, 2023-07-26 @ 11:47:57
 * Author: HackXIt (<hackxit@gmail.com>)
 * -----
 * Last Modified: Wednesday, 2023-07-26 @ 14:57:05
 * Modified By:  HackXIt (<hackxit@gmail.com>) @ SE6802S
 * -----
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ConcourseManager = void 0;
const https = __webpack_require__(3);
const fs = __webpack_require__(4);
const os = __webpack_require__(5);
const vscode = __webpack_require__(1);
class ConcourseManager {
    // Private constructor so it can't be directly instantiated
    constructor(cliPath) {
        this.host = '';
        this.flyPath = '';
        this.flyConfigured = false;
        this.hostConfigured = false;
        this.cliPath = cliPath;
    }
    static async executeFly(flyPath, args) {
        return new Promise((resolve, reject) => {
            const fly = (__webpack_require__(6).spawn)(flyPath, args, { shell: true });
            let output = '';
            fly.stdout.on('data', (data) => {
                output += data;
            });
            fly.stderr.on('data', (data) => {
                output += data;
            });
            fly.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error('Failed to execute fly CLI: ' + output));
                    return;
                }
                resolve(output);
            });
        });
    }
    // Method to get an instance of ConcourseManager
    static initialize(flyPath) {
        if (!ConcourseManager.instance) {
            ConcourseManager.instance = new ConcourseManager(flyPath);
        }
        else {
            ConcourseManager.instance.cliPath = flyPath;
            let host = vscode.workspace.getConfiguration('concourse-ci-connector').get('host');
            if (host !== undefined) {
                ConcourseManager.instance.host = host;
                ConcourseManager.instance.hostConfigured = true;
            }
            else {
                ConcourseManager.instance.host = '';
                ConcourseManager.instance.hostConfigured = false;
            }
        }
        return ConcourseManager.instance;
    }
    static getInstance() {
        if (!ConcourseManager.instance) {
            throw new Error('ConcourseManager not initialized.');
        }
        return ConcourseManager.instance;
    }
    isHostConfigured() {
        return this.hostConfigured;
    }
    async downloadFlyCli() {
        return new Promise((resolve, reject) => {
            const platform = os.platform();
            const arch = os.arch();
            let platformString = '';
            let archString = '';
            let filePath = this.cliPath + '/fly';
            if (platform === 'win32') {
                filePath += '.exe';
                platformString = 'windows';
            }
            else {
                platformString = platform;
            }
            if (arch === 'x64') {
                archString = 'amd64';
            }
            else {
                archString = arch;
            }
            const url = `https://${this.host}/api/v1/cli?arch=${archString}&platform=${platformString}`;
            console.debug('Downloading fly CLI from ' + url);
            const file = fs.createWriteStream(filePath);
            https.get(url, function (response) {
                if (response.statusCode !== 200) {
                    reject(new Error('Failed to download fly CLI: ' + response.statusMessage + ' (HTTP Status Code: ' + response.statusCode + ')'));
                    return;
                }
                response.pipe(file);
                file.on('finish', function () {
                    file.close();
                    // Make the file executable on unix systems
                    if (platform !== 'win32') {
                        fs.chmodSync(filePath, '755');
                    }
                    ConcourseManager.instance.flyPath = filePath;
                    ConcourseManager.instance.flyConfigured = true;
                    // Execute fly --version to verify the downloaded binary
                    ConcourseManager.executeFly(filePath, ['--version'])
                        .then((output) => resolve(output))
                        .catch((error) => reject(error));
                });
            }).on('error', function (err) {
                fs.unlinkSync(filePath);
                reject(err);
            });
        });
    }
    async configureHost() {
        let host = await ConcourseManager.askForHost();
        if (host !== undefined) {
            this.host = host;
            this.hostConfigured = true;
            vscode.workspace.getConfiguration('concourse-ci-connector').update('host', host, true);
            await vscode.window.showInformationMessage('Host configured: ' + host);
            console.log('Host configured: ' + host);
        }
        else {
            console.log('Host configuration cancelled.');
        }
    }
    static async askForHost() {
        return vscode.window.showInputBox({
            prompt: 'Enter the host URL for your Concourse CI instance.',
            placeHolder: 'concourse.example.com'
        });
    }
}
exports.ConcourseManager = ConcourseManager;


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("https");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("os");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/*
 * File: extension.ts
 * Created on: Wednesday, 2023-07-26 @ 10:21:21
 * Author: HackXIt (<hackxit@gmail.com>)
 * -----
 * Last Modified: Wednesday, 2023-07-26 @ 14:39:05
 * Modified By:  HackXIt (<hackxit@gmail.com>) @ SE6802S
 * -----
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
const concourseManager_1 = __webpack_require__(2);
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "concourse-ci-connector" is now active!');
    let concourseManager = concourseManager_1.ConcourseManager.initialize(context.extensionPath);
    context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.configureHost', () => {
        return concourseManager.configureHost();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.downloadFlyCli', async () => {
        if (!concourseManager.isHostConfigured()) {
            return vscode.window.showErrorMessage('Concourse host not configured. Please configure the host first using command "Configure host".');
        }
        try {
            const version = await concourseManager.downloadFlyCli();
            await vscode.window.showInformationMessage('Successfully downloaded fly CLI version ' + version);
        }
        catch (err) {
            if (err instanceof Error) {
                await vscode.window.showErrorMessage(`Error during command: ${err.message}`);
            }
            else {
                await vscode.window.showErrorMessage(`Unknown error during command: ${err}`);
            }
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from Concourse CI connector!');
    }));
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map