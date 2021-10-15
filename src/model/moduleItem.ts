
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { NodeType } from "./definitions";

export class ModuleItem extends TreeItem {
    constructor(
        public readonly label: string,
        public readonly filePath: string,
		public readonly collapsibleState: TreeItemCollapsibleState,
		public readonly iconPath?: any) {
        super(label);
        this.contextValue = NodeType.Module;
        this.tooltip = this.filePath;
        this.collapsibleState = collapsibleState;
    }
}