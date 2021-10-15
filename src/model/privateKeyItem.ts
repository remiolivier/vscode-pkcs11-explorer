
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "./definitions";

export class PrivateKeyItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly iconPath?: any) {
        super(label);
        this.contextValue = NodeType.PrivateKeyObject;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}