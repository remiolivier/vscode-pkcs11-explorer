import { TreeItem } from 'vscode';
import { Pkcs11Model } from '../utility/pkcs11Model';

export abstract class Pkcs11Node {
	id: string;
	label: string;
	description: string;
	type: string;
	isExpandable: boolean;
	iconDirectory: string;

	constructor(id: string, label: string, description: string, type: string, isExpandable: boolean) {
		this.id = id;
		this.description = description;
		this.label = label;
		this.type = type;
		this.isExpandable = isExpandable;
	}

	abstract getChildren(model: Pkcs11Model): Pkcs11Node[] | Thenable<Pkcs11Node[]>;

	abstract toTreeItem(): TreeItem;
}