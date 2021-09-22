"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class DataItem extends vscode_1.TreeItem {
    constructor(label, description, collapsibleState) {
        super(label);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.contextValue = definitions_1.NodeType.Data;
        this.iconPath = null;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}
exports.DataItem = DataItem;
//# sourceMappingURL=DataItem.js.map