
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "./definitions";

export class PublicKeyItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly iconPath?: any) {
        super(label);
        this.contextValue = NodeType.PublicKeyObject;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}