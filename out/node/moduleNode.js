"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleNode = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const definitions_1 = require("../model/definitions");
const moduleItem_1 = require("../model/moduleItem");
const pkcs11Node_1 = require("./pkcs11Node");
class ModuleNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, isExpandable) {
        super(id, label, description, definitions_1.NodeType.Module, isExpandable);
    }
    getChildren(model) {
        return model.getSlots(this.label);
    }
    toTreeItem() {
        return new moduleItem_1.ModuleItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
    }
    getIcon() {
        return {
            light: path.join(this.iconDirectory, 'light', 'module.svg'),
            dark: path.join(this.iconDirectory, 'dark', 'module.svg')
        };
    }
}
exports.ModuleNode = ModuleNode;
//# sourceMappingURL=moduleNode.js.map