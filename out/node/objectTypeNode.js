"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeNode = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("../model/definitions");
const objectTypeItem_1 = require("../model/objectTypeItem");
const pkcs11Node_1 = require("./pkcs11Node");
class ObjectTypeNode extends pkcs11Node_1.Pkcs11Node {
    constructor(id, label, description, isExpandable, slotNode) {
        super(id, label, description, definitions_1.NodeType.ObjectType, isExpandable);
        this.slotNode = slotNode;
    }
    getChildren(model) {
        return model.getObjects(this);
    }
    toTreeItem() {
        return new objectTypeItem_1.ObjectTypeItem(this.label, this.description, this.isExpandable ? vscode_1.TreeItemCollapsibleState.Collapsed : vscode_1.TreeItemCollapsibleState.None);
    }
}
exports.ObjectTypeNode = ObjectTypeNode;
//# sourceMappingURL=objectTypeNode.js.map