"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectTypeItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class ObjectTypeItem extends vscode_1.TreeItem {
    constructor(label, description, collapsibleState, iconPath) {
        super(label);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.iconPath = iconPath;
        this.contextValue = definitions_1.NodeType.ObjectType;
        this.iconPath = null;
        this.collapsibleState = collapsibleState;
    }
}
exports.ObjectTypeItem = ObjectTypeItem;
//# sourceMappingURL=objectTypeItem.js.map