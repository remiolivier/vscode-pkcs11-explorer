"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11TreeDataProvider = void 0;
const vscode = require("vscode");
class Pkcs11TreeDataProvider {
    constructor(context, model) {
        this.context = context;
        this.model = model;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        context.subscriptions.push(model);
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        element.iconDirectory = this.context.asAbsolutePath('resources');
        return element.toTreeItem();
    }
    getChildren(element) {
        return element ? element.getChildren(this.model) : this.model.getModules();
    }
}
exports.Pkcs11TreeDataProvider = Pkcs11TreeDataProvider;
//# sourceMappingURL=pkcs11TreeDataProvider.js.map