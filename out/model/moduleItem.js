"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class ModuleItem extends vscode_1.TreeItem {
    constructor(label, filePath, collapsibleState, iconPath) {
        super(label);
        this.label = label;
        this.filePath = filePath;
        this.collapsibleState = collapsibleState;
        this.iconPath = iconPath;
        this.contextValue = definitions_1.NodeType.Module;
        this.tooltip = this.filePath;
        this.collapsibleState = collapsibleState;
    }
}
exports.ModuleItem = ModuleItem;
//# sourceMappingURL=moduleItem.js.map