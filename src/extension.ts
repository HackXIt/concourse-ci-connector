/*
 * File: extension.ts
 * Created on: Wednesday, 2023-07-26 @ 10:21:21
 * Author: HackXIt (<hackxit@gmail.com>)
 * -----
 * Last Modified: Thursday, 2023-07-27 @ 15:24:35
 * Modified By:  HackXIt (<hackxit@gmail.com>) @ SE6802S
 * -----
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ConcourseManager } from './concourseManager';
import { ConcourseExplorerProvider } from './concourseExplorer';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "concourse-ci-connector" is now active!');

    let concourseManager = ConcourseManager.initialize(context.extensionPath);

    context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.configureHost', () => {
        return concourseManager.configureHost();
    }));
	context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.downloadFlyCli', async () => {
        if(!concourseManager.isHostConfigured()) {
            return vscode.window.showErrorMessage('Concourse host not configured. Please configure the host first using command "Configure host".');
        }
        try {
            const version = await concourseManager.downloadFlyCli();
            await vscode.window.showInformationMessage('Successfully downloaded fly CLI version ' + version);
        } catch(err) {
            if(err instanceof Error) {
                await vscode.window.showErrorMessage(`Error during command: ${err.message}`);
            } else {
                await vscode.window.showErrorMessage(`Unknown error during command: ${err}`);
            }
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('concourse-ci-connector.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Concourse CI connector!');
	}));

    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
        const concourseExplorerProvider = new ConcourseExplorerProvider(workspaceFolders);
        vscode.window.registerTreeDataProvider('concourse-ci-connector', concourseExplorerProvider);
    } else {
        // Handle case when there are no workspace folders
        const concourseExplorerProvider = new ConcourseExplorerProvider([]);
        vscode.window.registerTreeDataProvider('concourse-ci-connector', concourseExplorerProvider);
    }
}

// This method is called when your extension is deactivated
export function deactivate() {}