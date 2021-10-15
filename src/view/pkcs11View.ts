import * as vscode from 'vscode';
import { Pkcs11ExplorerConfiguration } from "../utility/pkcs11ExplorerConfiguration";
import { Pkcs11Model } from '../utility/pkcs11Model';
import { ObjectNode } from '../node/objectNode';
import { Pkcs11Node } from '../node/pkcs11Node';
import { SlotNode } from '../node/slotNode';
import { Pkcs11TreeDataProvider } from '../provider/pkcs11TreeDataProvider';

export class Pkcs11View {

	constructor(context: vscode.ExtensionContext) {
		
		const pkcs11ExplorerConfiguration = new Pkcs11ExplorerConfiguration();
		pkcs11ExplorerConfiguration.load();
		const pkcs11Model = new Pkcs11Model(pkcs11ExplorerConfiguration);
		
		const treeDataProvider = new Pkcs11TreeDataProvider(context, pkcs11Model);
		const view = vscode.window.createTreeView('pkcs11View', { treeDataProvider: treeDataProvider, showCollapseAll: true });
		context.subscriptions.push(view);
	
		// View
		vscode.commands.registerCommand('pkcs11View.refresh', (node: Pkcs11Node) => treeDataProvider.refresh());
		
		// Module commands
		vscode.commands.registerCommand('pkcs11View.addModule', (node: Pkcs11Node) => { pkcs11Model.addModule().then(() => treeDataProvider.refresh()); });
		vscode.commands.registerCommand('pkcs11View.reloadModule', (node: Pkcs11Node) => { pkcs11Model.reloadModule(node).then(() => treeDataProvider.refresh()); });
		vscode.commands.registerCommand('pkcs11View.getModuleDescription', (node: Pkcs11Node) => pkcs11Model.getModuleDescription(node));
		vscode.commands.registerCommand('pkcs11View.removeModule', (node: Pkcs11Node) => pkcs11Model.removeModule(node).then(() => treeDataProvider.refresh()));

		// Slot commands
		vscode.commands.registerCommand('pkcs11View.deleteSlot', (node: Pkcs11Node) => pkcs11Model.deleteSlot(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.getSlotDescription', (node: Pkcs11Node) => pkcs11Model.getSlotDescription(node as SlotNode));
		vscode.commands.registerCommand('pkcs11View.getSlotAvailableMechanisms', (node: Pkcs11Node) => pkcs11Model.getSlotAvailableMechanisms(node as SlotNode));
		vscode.commands.registerCommand('pkcs11View.initializeSlot', (node: Pkcs11Node) => pkcs11Model.initializeSlot(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.setSlotUserPin', (node: Pkcs11Node) => pkcs11Model.setSlotUserPin(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.initializeSlotUserPin', (node: Pkcs11Node) => pkcs11Model.initializeSlotUserPin(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.createDigest', (node: Pkcs11Node) => pkcs11Model.createDigest(node as SlotNode));
		vscode.commands.registerCommand('pkcs11View.generateAesKey', (node: Pkcs11Node) => pkcs11Model.generateAesKey(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.generateRsaKey', (node: Pkcs11Node) => pkcs11Model.generateRsaKey(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.generateRsaKeyPair', (node: Pkcs11Node) => pkcs11Model.generateRsaKeyPair(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.generateEccKey', (node: Pkcs11Node) => pkcs11Model.generateEccKey(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.generateEccKeyPair', (node: Pkcs11Node) => pkcs11Model.generateEccKeyPair(node as SlotNode).then(() => treeDataProvider.refresh()));
		vscode.commands.registerCommand('pkcs11View.importCertificate', (node: Pkcs11Node) => pkcs11Model.importCertificate(node as SlotNode).then(() => treeDataProvider.refresh()));
		
		// Object commands
		vscode.commands.registerCommand('pkcs11View.deleteObject', (node: Pkcs11Node) => { pkcs11Model.deleteObject(node as ObjectNode).then(() => treeDataProvider.refresh()); });
		vscode.commands.registerCommand('pkcs11View.renameObject', (node: Pkcs11Node) => { pkcs11Model.renameObject(node as ObjectNode).then(() => treeDataProvider.refresh()); });
		vscode.commands.registerCommand('pkcs11View.getAttribute', (node: Pkcs11Node) => pkcs11Model.getAttribute(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.getAttributes', (node: Pkcs11Node) => pkcs11Model.getAttributes(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.setAttribute', (node: Pkcs11Node) => { pkcs11Model.setAttribute(node as ObjectNode).then(() => treeDataProvider.refresh()); });
		vscode.commands.registerCommand('pkcs11View.sign', (node: Pkcs11Node) => pkcs11Model.sign(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.signMultipart', (node: Pkcs11Node) => pkcs11Model.signMultipart(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.verify', (node: Pkcs11Node) => pkcs11Model.verify(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.verifyMultipart', (node: Pkcs11Node) => pkcs11Model.verifyMultipart(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.encrypt', (node: Pkcs11Node) => pkcs11Model.encrypt(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.decrypt', (node: Pkcs11Node) => pkcs11Model.decrypt(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.exportCertificate', (node: Pkcs11Node) => pkcs11Model.exportCertificate(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.exportDataObject', (node: Pkcs11Node) => pkcs11Model.exportDataObject(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.exportPublicKey', (node: Pkcs11Node) => pkcs11Model.exportPublicKey(node as ObjectNode));
		vscode.commands.registerCommand('pkcs11View.exportSecretKey', (node: Pkcs11Node) => pkcs11Model.exportSecretKey(node as ObjectNode));
	}
}