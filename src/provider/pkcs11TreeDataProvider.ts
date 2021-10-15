import * as vscode from 'vscode';
import { Pkcs11Model } from '../utility/pkcs11Model';
import { Pkcs11Node } from '../node/pkcs11Node';

export class Pkcs11TreeDataProvider implements vscode.TreeDataProvider<Pkcs11Node> {

	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

	constructor(private context: vscode.ExtensionContext, private readonly model: Pkcs11Model) {
		context.subscriptions.push(model);
	}

	public refresh(): any {
		this._onDidChangeTreeData.fire(undefined);
	}

	public getTreeItem(element: Pkcs11Node): vscode.TreeItem {
		element.iconDirectory = this.context.asAbsolutePath('resources');
		return element.toTreeItem();
	}

	public getChildren(element?: Pkcs11Node): Pkcs11Node[] | Thenable<Pkcs11Node[]> {
		return element ? element.getChildren(this.model) : this.model.getModules();
	}
}