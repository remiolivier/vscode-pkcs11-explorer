
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "./definitions";

export class DataItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly iconPath?: any) {
        super(label);
        this.contextValue = NodeType.DataObject;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}