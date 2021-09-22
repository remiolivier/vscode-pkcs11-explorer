"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slotItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class slotItem extends vscode_1.TreeItem {
    constructor(label, description, collapsibleState) {
        super(label);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.contextValue = definitions_1.NodeType.Slot;
        this.iconPath = null;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}
exports.slotItem = slotItem;
//# sourceMappingURL=slotItem%20copy.js.map