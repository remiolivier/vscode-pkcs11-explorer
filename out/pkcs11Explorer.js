"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11TreeDataProvider = void 0;
const vscode = require("vscode");
class Pkcs11TreeDataProvider {
    constructor(model) {
        this.model = model;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getCollapsibleStateFromType(type) {
        if (type == "module" || type == "slot" || type == "type") {
            return vscode.TreeItemCollapsibleState.Collapsed;
        }
        else {
            return vscode.TreeItemCollapsibleState.None;
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        console.log("Get tree item called. : " + element.label);
        return {
            label: element.label,
            tooltip: element.description,
            collapsibleState: this.getCollapsibleStateFromType(element.type),
            contextValue: element.type
        };
    }
    getChildren(element) {
        return this.model.getChildren(element);
    }
}
exports.Pkcs11TreeDataProvider = Pkcs11TreeDataProvider;
//# sourceMappingURL=pkcs11Explorer.js.map