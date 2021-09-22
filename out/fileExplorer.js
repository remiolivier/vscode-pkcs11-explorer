// import * as vscode from 'vscode';
// interface Entry {
// 	uri: vscode.Uri;
// 	type: vscode.FileType;
// }
// //#endregion
// export class FileSystemProvider implements vscode.TreeDataProvider<Entry> {
// 	private _onDidChangeFile: vscode.EventEmitter<vscode.FileChangeEvent[]>;
// 	constructor() {
// 		this._onDidChangeFile = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
// 	}
// 	get onDidChangeFile(): vscode.Event<vscode.FileChangeEvent[]> {
// 		return this._onDidChangeFile.event;
// 	}
// 	// tree data provider
// 	async getChildren(element?: Entry): Promise<Entry[]> {
// 		return [];
// 	}
// 	getTreeItem(element: Entry): vscode.TreeItem {
// 		const treeItem = new vscode.TreeItem(element.uri, element.type === vscode.FileType.Directory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
// 		if (element.type === vscode.FileType.File) {
// 			treeItem.command = { command: 'fileExplorer.openFile', title: "Open File", arguments: [element.uri], };
// 			treeItem.contextValue = 'file';
// 		}
// 		return treeItem;
// 	}
// }
// export class FileExplorer {
// 	constructor(context: vscode.ExtensionContext) {
// 		const treeDataProvider = new FileSystemProvider();
// 		context.subscriptions.push(vscode.window.createTreeView('fileExplorer', { treeDataProvider }));
// 		vscode.commands.registerCommand('fileExplorer.openFile', (resource) => this.openResource(resource));
// 	}
// 	private openResource(resource: vscode.Uri): void {
// 		vscode.window.showTextDocument(resource);
// 	}
// }
//# sourceMappingURL=fileExplorer.js.map