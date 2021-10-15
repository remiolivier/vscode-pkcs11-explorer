import { TreeItem, TreeItemCollapsibleState } from "vscode";
import * as path from 'path';
import { NodeType } from "../model/definitions";
import { ModuleItem } from "../model/moduleItem";
import { Pkcs11Model } from "../utility/pkcs11Model";
import { Pkcs11Node } from "./pkcs11Node";

export class ModuleNode extends Pkcs11Node {
	constructor(id: string, label: string, description: string, isExpandable: boolean) {
		super(id, label, description, NodeType.Module, isExpandable);
	}
	
	public getChildren(model: Pkcs11Model): Pkcs11Node[] | Thenable<Pkcs11Node[]> {
		return model.getSlots(this.label);
	}

	public toTreeItem(): TreeItem {
		return new ModuleItem(
			this.label,
			this.description,
			this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
			this.getIcon());
	}
	
	private getIcon(): any {
		return {
			light: path.join(this.iconDirectory, 'light', 'module.svg'),
			dark: path.join(this.iconDirectory, 'dark', 'module.svg')
		};
	}
}