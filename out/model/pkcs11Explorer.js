"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11View = exports.Pkcs11TreeDataProvider = exports.Pkcs11Model = exports.Pkcs11ExplorerConfiguration = exports.Pkcs11Node = void 0;
const vscode = require("vscode");
const graphene = require("graphene-pk11");
class Pkcs11Node {
}
exports.Pkcs11Node = Pkcs11Node;
class Pkcs11ExplorerConfiguration {
}
exports.Pkcs11ExplorerConfiguration = Pkcs11ExplorerConfiguration;
class Pkcs11Model {
    constructor() {
        this.basicTemplate = {
            id: null,
            label: null,
        };
        this.certificateTemplate = {
            id: null,
            label: null,
            certType: null,
        };
        this.privateKeyTemplate = {
            id: null,
            label: null,
            keyType: null,
            // encrypt: null,
            // decrypt: null,
            // wrap: null,
            // unwrap: null,
            // sign: null,
            // signRecover: null,
            // verify: null,
            // verifyRecover: null,
            // derive: null
        };
        this.objectTypeTemplateMap = new Map([
            [graphene.ObjectClass.CERTIFICATE, this.certificateTemplate],
            [graphene.ObjectClass.DATA, this.basicTemplate],
            [graphene.ObjectClass.PUBLIC_KEY, this.basicTemplate],
            [graphene.ObjectClass.PRIVATE_KEY, this.privateKeyTemplate],
            [graphene.ObjectClass.SECRET_KEY, this.privateKeyTemplate]
        ]);
        this.objectClassToType = new Map([
            [graphene.ObjectClass.CERTIFICATE, "CertType"],
            [graphene.ObjectClass.PRIVATE_KEY, "KeyType"],
            [graphene.ObjectClass.SECRET_KEY, "KeyType"]
        ]);
        this.modules = new Map();
        this.customView = null;
    }
    getChildren(node) {
        if (node == null) {
            return this.getModules();
        }
        else if (node.type == "module") {
            return this.getSlots(node.label);
        }
        else if (node.type == "slot") {
            return this.getObjectTypes(node.slot);
        }
        else if (node.type == "type") {
            return this.getObjects(node.slot, node.id);
        }
        else {
            return Promise.reject("No data found for " + node.label);
        }
    }
    async addModule() {
        const moduleName = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: "The friendly name for this module",
        });
        const moduleUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false
        });
        if (moduleName == null || moduleName == ""
            || moduleUri.length == 0) {
            return;
        }
        const configuration = await this.getPkcs11ExplorerConfiguration();
        if (configuration != undefined && configuration != null) {
            if (configuration.modules.has(moduleName)) {
                vscode.window.showErrorMessage("Module already exists.");
                return;
            }
            configuration.modules.set(moduleName, moduleUri.toString());
            await this.setPkcs11ExplorerConfiguration(configuration);
            vscode.window.showInformationMessage("Module added.");
        }
    }
    async getPkcs11ExplorerConfiguration() {
        const configurationTarget = await vscode.workspace.getConfiguration().get('conf.view.pkcs11explorer', vscode.ConfigurationTarget.Global);
        if (configurationTarget != undefined && configurationTarget != null) {
            let configuration;
            Object.assign(configuration, configurationTarget.toString());
            return configuration;
        }
        return null;
    }
    async setPkcs11ExplorerConfiguration(configuration) {
        return await vscode.workspace.getConfiguration().update('conf.view.pkcs11explorer', configuration, vscode.ConfigurationTarget.Global);
    }
    getModules() {
        const moduleNodes = [];
        this.getPkcs11ExplorerConfiguration().then(configuration => {
            if (configuration == null) {
                return;
            }
            configuration.modules.forEach((value, key, map) => {
                configuration.modules.forEach((value, key, map) => {
                    try {
                        if (!this.modules.has(key)) {
                            const module = graphene.Module.load(value, key);
                            module.initialize();
                            this.modules.set(key, module);
                        }
                        moduleNodes.push({ id: key, label: key, description: value, type: "module" });
                    }
                    catch (err) {
                        return Promise.reject('Failed to load module with error: ' + err.message);
                    }
                });
            });
        });
        // try {
        // 	const label = "SoftHSM";
        // 	const filePath = "/usr/local/lib/softhsm/libsofthsm2.so";
        // 	const module: graphene.Module = graphene.Module.load(filePath, label);
        // 	module.initialize();
        // 	this.modules.set(label, module);
        // 	moduleNodes.push({ id: label, label: label, description: filePath, type: "module" });
        // }
        // catch (err) {
        // 	return Promise.reject('Failed to load module with error: ' + err.message);
        // }
        return Promise.resolve(moduleNodes);
    }
    getSlots(moduleName) {
        const module = this.modules.get(moduleName);
        this.slots = module.getSlots(true);
        const nodes = [];
        if (this.slots.length > 0) {
            for (let i = 0; i < this.slots.length; i++) {
                const slot = this.slots.items(i);
                nodes.push({ id: slot.handle.toString(), label: slot.slotDescription, description: slot.slotDescription, type: "slot", slot: slot });
            }
        }
        return Promise.resolve(nodes);
    }
    getObjectTypes(slot) {
        console.log("Get objects called.");
        const types = Object.keys(graphene.ObjectClass)
            .filter(key => !isNaN(Number(graphene.ObjectClass[key]))
            && graphene.ObjectClass[key] != graphene.ObjectClass.DOMAIN_PARAMETERS
            && graphene.ObjectClass[key] != graphene.ObjectClass.HW_FEATURE
            && graphene.ObjectClass[key] != graphene.ObjectClass.MECHANISM
            && graphene.ObjectClass[key] != graphene.ObjectClass.OTP_KEY)
            .map(key => { return { id: key, label: key, type: "type", description: key, slot: slot }; });
        return Promise.resolve(types);
    }
    formatLabel(id, label) {
        if (id == label) {
            return id;
        }
        else if (label == null || label == "") {
            return "#" + id;
        }
        else if (id == null || id == "") {
            return label;
        }
        else {
            return label;
        }
    }
    formatDescription(attributes, certTypeLabel) {
        return "id: " + Buffer.from(attributes.id).toString() + "\nlabel: " + Buffer.from(attributes.label).toString() + "\n" + certTypeLabel + ": " + graphene.CertificateType[attributes.certType];
    }
    getObjects(slot, type) {
        const objects = [];
        const session = slot.open();
        session.login("1234");
        const objectsFound = session.find({ class: graphene.ObjectClass[type] });
        // Get a number of private key objects on token
        console.log(objectsFound.length);
        if (objectsFound.length > 0) {
            for (let i = 0; i < objectsFound.length; i++) {
                const attributesTemplate = this.objectTypeTemplateMap.has(graphene.ObjectClass[type]) ? this.objectTypeTemplateMap.get(graphene.ObjectClass[type]) : this.basicTemplate;
                const data = objectsFound.items(i);
                const attributes = data.getAttribute(attributesTemplate);
                objects.push({ id: Buffer.from(attributes.id).toString(), label: this.formatLabel(Buffer.from(attributes.id).toString(), Buffer.from(attributes.label).toString()), description: this.formatDescription(attributes, this.objectClassToType.get(graphene.ObjectClass[type])), type: "object", slot: slot });
            }
        }
        session.logout();
        return Promise.resolve(objects);
    }
    // PKCS#11 Commands
    createSlot(node) {
        //
    }
    getModuleDescription(node) {
        const module = this.modules.get(node.id);
        const outputChannel = this.getCustomOutputChannel();
        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine("Module " + node.label);
        outputChannel.appendLine("\tCryptoki version: " + module.cryptokiVersion.major + "." + module.cryptokiVersion.minor);
        outputChannel.appendLine("\tLibrary file: " + module.libFile);
        outputChannel.appendLine("\tLibrary name: " + module.libName);
        outputChannel.appendLine("\tLibrary description: " + module.libraryDescription);
        outputChannel.appendLine("\tLibrary version: " + module.libraryVersion.major + "." + module.libraryVersion.minor);
        outputChannel.appendLine("\tManufacturer ID: " + module.manufacturerID);
    }
    removeModule(node) {
        const module = this.modules.get(node.id);
        module.finalize();
        module.close();
        this.modules.delete(node.id);
    }
    deleteSlot(node) {
        const slot = node.slot;
        try {
            slot.closeAll();
        }
        catch (err) {
            vscode.window.showErrorMessage("Failed to delete slot iwth error.\n" + err.message);
        }
    }
    getSlotDescription(node) {
        const slot = node.slot;
        const outputChannel = this.getCustomOutputChannel();
        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine("Slot #" + slot.handle);
        outputChannel.appendLine("\tDescription: " + slot.slotDescription);
        outputChannel.appendLine("\tSerial: " + slot.getToken().serialNumber);
        outputChannel.appendLine("\tFirmware version: " + slot.firmwareVersion.major + "." + slot.firmwareVersion.minor);
        outputChannel.appendLine("\tHardware version: " + slot.hardwareVersion.major + "." + slot.hardwareVersion.minor);
        outputChannel.appendLine("\tManufacturer ID: " + slot.manufacturerID);
        outputChannel.appendLine("\tPassword(min/max): " + slot.getToken().minPinLen + "/" + slot.getToken().maxPinLen);
        outputChannel.appendLine("\tIs hardware: " + !!(slot.flags & graphene.SlotFlag.HW_SLOT));
        outputChannel.appendLine("\tIs removable: " + !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE));
        outputChannel.appendLine("\tIs initialized: " + !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT));
    }
    getSlotAvailableMechanisms(node) {
        const slot = node.slot;
        const outputChannel = this.getCustomOutputChannel();
        outputChannel.clear();
        outputChannel.show(true);
        outputChannel.appendLine("Mechanisms:");
        outputChannel.appendLine("Name                       h/s/v/e/d/w/u");
        outputChannel.appendLine("========================================");
        function b(v) {
            return v ? "+" : "-";
        }
        function s(v) {
            v = v.toString();
            for (let i_1 = v.length; i_1 < 27; i_1++) {
                v += " ";
            }
            return v;
        }
        const mechs = slot.getMechanisms();
        for (let j = 0; j < mechs.length; j++) {
            const mech = mechs.items(j);
            outputChannel.appendLine(s(mech.name) +
                b(mech.flags & graphene.MechanismFlag.DIGEST) + "/" +
                b(mech.flags & graphene.MechanismFlag.SIGN) + "/" +
                b(mech.flags & graphene.MechanismFlag.VERIFY) + "/" +
                b(mech.flags & graphene.MechanismFlag.ENCRYPT) + "/" +
                b(mech.flags & graphene.MechanismFlag.DECRYPT) + "/" +
                b(mech.flags & graphene.MechanismFlag.WRAP) + "/" +
                b(mech.flags & graphene.MechanismFlag.UNWRAP));
        }
    }
    async initializeSlot(node) {
        const slot = node.slot;
        if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
            const overrideToken = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "The token is already initialized. Enter yes to reinitialize the toke. Note: it will delete all the data in the current token.",
                placeHolder: "yes/no"
            });
            if (overrideToken != "yes") {
                return;
            }
        }
        try {
            const userSoPin = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "The SO's initial PIN",
                password: true
            });
            const tokenLabel = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "The token label"
            });
            slot.initToken(userSoPin, tokenLabel);
            vscode.window.showInformationMessage("Token initialized.");
        }
        catch (err) {
            vscode.window.showErrorMessage("Failed to initialize token.\n" + err.message);
        }
    }
    async setSlotUserPin(node) {
        const slot = node.slot;
        try {
            const oldPin = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "Old PIN",
                password: true
            });
            const newPin = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "New PIN",
                password: true
            });
            if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
                const session = slot.open();
                session.login(oldPin, graphene.UserType.USER);
                session.setPin(oldPin, newPin);
                session.logout();
                session.close();
                vscode.window.showInformationMessage("User's PIN was changed successfully");
            }
            vscode.window.showErrorMessage("Token not initialized.");
        }
        catch (err) {
            vscode.window.showErrorMessage("Failed to set user PIN for User.\n" + err.message);
        }
    }
    async initializeSlotUserPin(node) {
        const slot = node.slot;
        try {
            const soPin = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "SO PIN",
                password: true
            });
            const newPin = await vscode.window.showInputBox({
                ignoreFocusOut: true,
                prompt: "User PIN",
                password: true
            });
            if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
                //slot.closeAll();
                //const session = slot.open(graphene.SessionFlag.RW_SESSION);
                // session.login(soPin, graphene.UserType.SO);
                //session.initPin(newPin);
                // session.logout();
                // session.login(newPin, graphene.UserType.USER);
                // session.logout();
                // session.close();
                vscode.window.showInformationMessage("User's PIN initialized.");
            }
        }
        catch (err) {
            vscode.window.showErrorMessage("Failed to initialize user PIN.\n" + err.message);
        }
    }
    getCustomOutputChannel() {
        if (this.customView == null) {
            this.customView = vscode.window.createOutputChannel("PKCS#11 Explorer");
        }
        return this.customView;
    }
}
exports.Pkcs11Model = Pkcs11Model;
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
class Pkcs11View {
    constructor(context) {
        const pkcs11Model = new Pkcs11Model();
        const treeDataProvider = new Pkcs11TreeDataProvider(pkcs11Model);
        const view = vscode.window.createTreeView('pkcs11View', { treeDataProvider: treeDataProvider, showCollapseAll: true });
        context.subscriptions.push(view);
        // Module commands
        vscode.commands.registerCommand('pkcs11View.addModule', (node) => { pkcs11Model.addModule(); treeDataProvider.refresh(); });
        vscode.commands.registerCommand('pkcs11View.createSlot', (node) => { pkcs11Model.createSlot(node); treeDataProvider.refresh(); });
        vscode.commands.registerCommand('pkcs11View.getModuleDescription', (node) => pkcs11Model.getModuleDescription(node));
        vscode.commands.registerCommand('pkcs11View.removeModule', (node) => { pkcs11Model.removeModule(node); treeDataProvider.refresh(); });
        // Slot commands
        vscode.commands.registerCommand('pkcs11View.deleteSlot', (node) => { pkcs11Model.deleteSlot(node); treeDataProvider.refresh(); });
        vscode.commands.registerCommand('pkcs11View.getSlotDescription', (node) => pkcs11Model.getSlotDescription(node));
        vscode.commands.registerCommand('pkcs11View.getSlotAvailableMechanisms', (node) => pkcs11Model.getSlotAvailableMechanisms(node));
        vscode.commands.registerCommand('pkcs11View.initializeSlot', (node) => pkcs11Model.initializeSlot(node));
        vscode.commands.registerCommand('pkcs11View.setSlotUserPin', (node) => pkcs11Model.setSlotUserPin(node));
        vscode.commands.registerCommand('pkcs11View.initializeSlotUserPin', (node) => pkcs11Model.initializeSlotUserPin(node));
        // Object commands
    }
}
exports.Pkcs11View = Pkcs11View;
//# sourceMappingURL=pkcs11Explorer.js.map