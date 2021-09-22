"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class ModuleItem extends vscode_1.TreeItem {
    constructor(label, filePath, collapsibleState) {
        super(label);
        this.label = label;
        this.filePath = filePath;
        this.collapsibleState = collapsibleState;
        this.contextValue = definitions_1.NodeType.Module;
        this.iconPath = null;
        this.tooltip = this.filePath;
        this.collapsibleState = collapsibleState;
    }
}
exports.ModuleItem = ModuleItem;
//# sourceMappingURL=moduleItem%20copy.js.map