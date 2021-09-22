"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11View = void 0;
const vscode = require("vscode");
const pkcs11ExplorerConfiguration_1 = require("../utility/pkcs11ExplorerConfiguration");
const pkcs11Model_1 = require("../utility/pkcs11Model");
const pkcs11TreeDataProvider_1 = require("../provider/pkcs11TreeDataProvider");
class Pkcs11View {
    constructor(context) {
        const pkcs11ExplorerConfiguration = new pkcs11ExplorerConfiguration_1.Pkcs11ExplorerConfiguration();
        pkcs11ExplorerConfiguration.load();
        const pkcs11Model = new pkcs11Model_1.Pkcs11Model(pkcs11ExplorerConfiguration);
        const treeDataProvider = new pkcs11TreeDataProvider_1.Pkcs11TreeDataProvider(context, pkcs11Model);
        const view = vscode.window.createTreeView('pkcs11View', { treeDataProvider: treeDataProvider, showCollapseAll: true });
        context.subscriptions.push(view);
        // View
        vscode.commands.registerCommand('pkcs11View.refresh', (node) => treeDataProvider.refresh());
        // Module commands
        vscode.commands.registerCommand('pkcs11View.addModule', (node) => { pkcs11Model.addModule().then(() => treeDataProvider.refresh()); });
        vscode.commands.registerCommand('pkcs11View.reloadModule', (node) => { pkcs11Model.reloadModule(node).then(() => treeDataProvider.refresh()); });
        vscode.commands.registerCommand('pkcs11View.getModuleDescription', (node) => pkcs11Model.getModuleDescription(node));
        vscode.commands.registerCommand('pkcs11View.removeModule', (node) => pkcs11Model.removeModule(node).then(() => treeDataProvider.refresh()));
        // Slot commands
        vscode.commands.registerCommand('pkcs11View.deleteSlot', (node) => pkcs11Model.deleteSlot(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.getSlotDescription', (node) => pkcs11Model.getSlotDescription(node));
        vscode.commands.registerCommand('pkcs11View.getSlotAvailableMechanisms', (node) => pkcs11Model.getSlotAvailableMechanisms(node));
        vscode.commands.registerCommand('pkcs11View.initializeSlot', (node) => pkcs11Model.initializeSlot(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.setSlotUserPin', (node) => pkcs11Model.setSlotUserPin(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.initializeSlotUserPin', (node) => pkcs11Model.initializeSlotUserPin(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.createDigest', (node) => pkcs11Model.createDigest(node));
        vscode.commands.registerCommand('pkcs11View.generateAesKey', (node) => pkcs11Model.generateAesKey(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.generateRsaKey', (node) => pkcs11Model.generateRsaKey(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.generateRsaKeyPair', (node) => pkcs11Model.generateRsaKeyPair(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.generateEccKey', (node) => pkcs11Model.generateEccKey(node).then(() => treeDataProvider.refresh()));
        vscode.commands.registerCommand('pkcs11View.generateEccKeyPair', (node) => pkcs11Model.generateEccKeyPair(node).then(() => treeDataProvider.refresh()));
        // Object commands
        vscode.commands.registerCommand('pkcs11View.deleteObject', (node) => { pkcs11Model.deleteObject(node).then(() => treeDataProvider.refresh()); });
        vscode.commands.registerCommand('pkcs11View.renameObject', (node) => { pkcs11Model.renameObject(node).then(() => treeDataProvider.refresh()); });
        vscode.commands.registerCommand('pkcs11View.getAttribute', (node) => pkcs11Model.getAttribute(node));
        vscode.commands.registerCommand('pkcs11View.getAttributes', (node) => pkcs11Model.getAttributes(node));
        vscode.commands.registerCommand('pkcs11View.setAttribute', (node) => { pkcs11Model.setAttribute(node).then(() => treeDataProvider.refresh()); });
        vscode.commands.registerCommand('pkcs11View.sign', (node) => pkcs11Model.sign(node));
        vscode.commands.registerCommand('pkcs11View.signMultipart', (node) => pkcs11Model.signMultipart(node));
        vscode.commands.registerCommand('pkcs11View.verify', (node) => pkcs11Model.verify(node));
        vscode.commands.registerCommand('pkcs11View.verifyMultipart', (node) => pkcs11Model.verifyMultipart(node));
        vscode.commands.registerCommand('pkcs11View.encrypt', (node) => pkcs11Model.encrypt(node));
        vscode.commands.registerCommand('pkcs11View.decrypt', (node) => pkcs11Model.decrypt(node));
        vscode.commands.registerCommand('pkcs11View.exportCertificate', (node) => pkcs11Model.exportCertificate(node));
        vscode.commands.registerCommand('pkcs11View.exportDataObject', (node) => pkcs11Model.exportDataObject(node));
        vscode.commands.registerCommand('pkcs11View.exportPublicKey', (node) => pkcs11Model.exportPublicKey(node));
        vscode.commands.registerCommand('pkcs11View.exportSecretKey', (node) => pkcs11Model.exportSecretKey(node));
    }
}
exports.Pkcs11View = Pkcs11View;
//# sourceMappingURL=pkcs11View.js.map