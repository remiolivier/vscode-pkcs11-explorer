"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateItem = void 0;
const vscode_1 = require("vscode");
const definitions_1 = require("./definitions");
class CertificateItem extends vscode_1.TreeItem {
    constructor(label, description, collapsibleState, iconPath) {
        super(label);
        this.label = label;
        this.description = description;
        this.collapsibleState = collapsibleState;
        this.iconPath = iconPath;
        this.contextValue = definitions_1.NodeType.CertificateObject;
        this.tooltip = this.description;
        this.collapsibleState = collapsibleState;
    }
}
exports.CertificateItem = CertificateItem;
//# sourceMappingURL=certificateItem.js.map