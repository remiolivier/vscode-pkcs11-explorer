
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "./definitions";

export class SecretKeyItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly iconPath?: any) {
        super(label);
        this.contextValue = NodeType.SecretKeyObject;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}