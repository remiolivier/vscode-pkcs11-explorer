import * as graphene from 'graphene-pk11';
import * as path from 'path';
import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { NodeType } from "../model/definitions";
import { Pkcs11Model } from '../utility/pkcs11Model';
import { slotItem } from '../model/slotItem';
import { Pkcs11Node } from "./pkcs11Node";

export class SlotNode extends Pkcs11Node {
	public session?: graphene.Session;

	constructor(id: string, label: string, description: string, isExpandable: boolean, public slot: graphene.Slot) {
		super(id, label, description, NodeType.Slot, isExpandable);
	}

	public getChildren(model: Pkcs11Model): Pkcs11Node[] | Thenable<Pkcs11Node[]> {
		return model.getObjectTypes(this);
	}

	public toTreeItem(): TreeItem {
		return new slotItem(
			this.label,
			this.description,
			this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None,
			this.getIcon());
	}
	
	private getIcon(): any {
		return {
			light: path.join(this.iconDirectory, 'light', 'slot.svg'),
			dark: path.join(this.iconDirectory, 'dark', 'slot.svg')
		};
	}
}