/*
 * File: concourseManager.ts
 * Created on: Wednesday, 2023-07-26 @ 11:47:57
 * Author: HackXIt (<hackxit@gmail.com>)
 * -----
 * Last Modified: Wednesday, 2023-07-26 @ 14:57:05
 * Modified By:  HackXIt (<hackxit@gmail.com>) @ SE6802S
 * -----
 */

import * as https from 'https';
import * as fs from 'fs';
import * as os from 'os';
import * as vscode from 'vscode';

export class ConcourseManager {
    private static instance: ConcourseManager;
    // Concourse host for this instance
    private host: string;
    // Path for the Fly CLI
    private cliPath: string;
    private flyPath: string;
    private flyConfigured: boolean;
    private hostConfigured: boolean;

    // Private constructor so it can't be directly instantiated
    private constructor(cliPath: string) {
        this.host = '';
        this.flyPath = '';
        this.flyConfigured = false;
        this.hostConfigured = false;
        this.cliPath = cliPath;
    }

    private static async executeFly(flyPath: string, args: string[]): Promise<string> {
        return new Promise((resolve, reject) => {
            const fly = require('child_process').spawn(flyPath, args, { shell: true });
            let output = '';
            fly.stdout.on('data', (data: string) => {
                output += data;
            });
            fly.stderr.on('data', (data: string) => {
                output += data;
            });
            fly.on('close', (code: number) => {
                if(code !== 0) {
                    reject(new Error('Failed to execute fly CLI: ' + output));
                    return;
                }
                resolve(output);
            });
        });
    }

    // Method to get an instance of ConcourseManager
    public static initialize(flyPath: string): ConcourseManager {
        if (!ConcourseManager.instance) {
            ConcourseManager.instance = new ConcourseManager(flyPath);
        } else {
            ConcourseManager.instance.cliPath = flyPath;
            let host = vscode.workspace.getConfiguration('concourse-ci-connector').get<string>('host');
            if(host !== undefined) {
                ConcourseManager.instance.host = host;
                ConcourseManager.instance.hostConfigured = true;
            } else {
                ConcourseManager.instance.host = '';
                ConcourseManager.instance.hostConfigured = false;
            }
        }
        return ConcourseManager.instance;
    }

    public static getInstance(): ConcourseManager {
        if(!ConcourseManager.instance) {
            throw new Error('ConcourseManager not initialized.');
        }
        return ConcourseManager.instance;
    }

    public isHostConfigured(): boolean {
        return this.hostConfigured; 
    }

    public async downloadFlyCli(): Promise<string> {
        return new Promise((resolve, reject) => {
            const platform = os.platform();
            const arch = os.arch();
            let platformString = '';
            let archString = '';
            let filePath = this.cliPath + '/fly';
            if (platform === 'win32') {
                filePath += '.exe';
                platformString = 'windows';
            } else {
                platformString = platform;
            }
            if (arch === 'x64') {
                archString = 'amd64';
            } else {
                archString = arch;
            }
            const url = `https://${this.host}/api/v1/cli?arch=${archString}&platform=${platformString}`;
            console.debug('Downloading fly CLI from ' + url);

            const file = fs.createWriteStream(filePath);
            https.get(url, function(response) {
                if(response.statusCode !== 200) {
                    reject(new Error('Failed to download fly CLI: ' + response.statusMessage + ' (HTTP Status Code: ' + response.statusCode + ')'));
                    return;
                }
                response.pipe(file);
                file.on('finish', function() {
                    file.close();
                    // Make the file executable on unix systems
                    if(platform !== 'win32') {
                        fs.chmodSync(filePath, '755');
                    }
                    ConcourseManager.instance.flyPath = filePath;
                    ConcourseManager.instance.flyConfigured = true;
                    // Execute fly --version to verify the downloaded binary
                    ConcourseManager.executeFly(filePath, ['--version'])
                        .then((output) => resolve(output))
                        .catch((error) => reject(error));
                });
            }).on('error', function(err) {
                fs.unlinkSync(filePath);
                reject(err);
            });
        });
    }

    public async configureHost(): Promise<void> {
        let host = await ConcourseManager.askForHost();
        if(host !== undefined) {
            this.host = host;
            this.hostConfigured = true;
            vscode.workspace.getConfiguration('concourse-ci-connector').update('host', host, true);
            await vscode.window.showInformationMessage('Host configured: ' + host);
            console.log('Host configured: ' + host);
        } else {
            console.log('Host configuration cancelled.');
        }
    }

    public static async askForHost(): Promise<string|undefined> {
        return vscode.window.showInputBox(
            {
                prompt: 'Enter the host URL for your Concourse CI instance.',
                placeHolder: 'concourse.example.com'
            }
        );
    }
}