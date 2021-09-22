import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "../model/definitions";
import { ObjectTypeItem } from "../model/objectTypeItem";
import { Pkcs11Model } from "../utility/pkcs11Model";
import { Pkcs11Node } from "./pkcs11Node";
import { SlotNode } from "./slotNode";

export class ObjectTypeNode extends Pkcs11Node {
	constructor(id: string, label: string, description: string, isExpandable: boolean, public slotNode: SlotNode) {
		super(id, label, description, NodeType.ObjectType, isExpandable);
	}

	public getChildren(model: Pkcs11Model): Pkcs11Node[] | Thenable<Pkcs11Node[]> {
		return model.getObjects(this);
	}

	public toTreeItem(): TreeItem {
		return new ObjectTypeItem(
			this.label,
			this.description,
			this.isExpandable ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);
	}
}