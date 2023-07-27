/*
 * File: concourseExplorer.ts
 * Created on: Thursday, 2023-07-27 @ 14:51:18
 * Author: HackXIt (<hackxit@gmail.com>)
 * -----
 * Last Modified: Thursday, 2023-07-27 @ 15:21:34
 * Modified By:  HackXIt (<hackxit@gmail.com>) @ SE6802S
 * -----
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileExplorer {
  constructor(private workspaceRoot: string) {
    vscode.window.createTreeView('fileExplorer', { treeDataProvider: new FileExplorerProvider(workspaceRoot) });
  }
}

class File extends vscode.TreeItem {
  constructor(public readonly path: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super(path, collapsibleState);
  }
}

class FileExplorerProvider implements vscode.TreeDataProvider<File> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: File): vscode.TreeItem {
    return element;
  }

  getChildren(element?: File): Thenable<File[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No file in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      const files = fs.readdirSync(element.path);
      return Promise.resolve(files.map(file => new File(path.join(element.path, file), fs.statSync(path.join(element.path, file)).isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)));
    }
    else {
      const files = fs.readdirSync(this.workspaceRoot);
      return Promise.resolve(files.map(file => new File(path.join(this.workspaceRoot, file), fs.statSync(path.join(this.workspaceRoot, file)).isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None)));
    }
  }
}

export class ConcourseExplorerProvider implements vscode.TreeDataProvider<ConcourseItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<ConcourseItem | undefined> = new vscode.EventEmitter<ConcourseItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ConcourseItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceFolders: readonly vscode.WorkspaceFolder[] | null) {
        this.workspaceFolders = workspaceFolders;
    }

    // Overload signatures:
    refresh(): void;
    refresh(item: ConcourseItem): void;

    // Overload implementation:
    refresh(item?: ConcourseItem): void {
        this._onDidChangeTreeData.fire(item);
    }

    getTreeItem(element: ConcourseItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ConcourseItem): Thenable<ConcourseItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.getRootConcourseItems());
        }
    }

    /**
     * Generate TreeItem nodes for the root of the explorer view.
     * Here you could add your real implementation fetching the 
     * pipelines or any other information from your concourse instance.
     */
    private getRootConcourseItems(): ConcourseItem[] {
        const item1 = new ConcourseItem('Pipelines', vscode.TreeItemCollapsibleState.Collapsed);
        const item2 = new ConcourseItem('Jobs', vscode.TreeItemCollapsibleState.Collapsed);
        return [item1, item2];
    }
}

class ConcourseItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    ) {
        super(label, collapsibleState);
    }

    contextValue = 'concourseItem';

}
