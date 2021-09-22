"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotNode = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const definitions_1 = require("../model/definitions");
const slotItem_1 = require("../model/slotItem");
const pkcs11Node_1 = require("./pkcs11Node");
class SlotNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, isExpandable, slot) {
        super(id, label, description, definitions_1.NodeType.Slot, isExpandable);
        this.slot = slot;
    }
    getChildren(model) {
        return model.getObjectTypes(this);
    }
    toTreeItem() {
        return new slotItem_1.slotItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None, this.getIcon());
    }
    getIcon() {
        return {
            light: path.join(this.iconDirectory, 'light', 'slot.svg'),
            dark: path.join(this.iconDirectory, 'dark', 'slot.svg')
        };
    }
}
exports.SlotNode = SlotNode;
//# sourceMappingURL=slotNode.js.map