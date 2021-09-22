"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11Model = void 0;
const graphene = require("graphene-pk11");
const uiCommands_1 = require("./uiCommands");
const handleUtils_1 = require("./handleUtils");
const pkcs11ExplorerOuputChannelView_1 = require("../provider/pkcs11ExplorerOuputChannelView");
const definitions_1 = require("./definitions");
const moduleNode_1 = require("../node/moduleNode");
const slotNode_1 = require("../node/slotNode");
const objectTypeNode_1 = require("../node/objectTypeNode");
const objectNode_1 = require("../node/objectNode");
class Pkcs11Model {
    constructor(configuration) {
        this.modules = new Map();
        this.sessions = new Map();
        this.outputChannel = new pkcs11ExplorerOuputChannelView_1.Pkcs11ExplorerOuputChannelView();
        this.configuration = configuration;
    }
    async addModule() {
        const moduleName = await uiCommands_1.UiCommands.showInputBox("The friendly name for this module");
        const modulePath = await uiCommands_1.UiCommands.showInputBox("The path to the PKCS#11 library.");
        if (moduleName || modulePath) {
            return;
        }
        const modulesConfiguration = this.configuration.getModules();
        if (modulesConfiguration && modulesConfiguration.has(moduleName)) {
            uiCommands_1.UiCommands.showErrorMessage("Module already exists.");
            return;
        }
        this.configuration.addModule(moduleName, modulePath);
        uiCommands_1.UiCommands.showInformationMessage("Module added.");
    }
    getModules() {
        const moduleNodes = [];
        const modulesConfiguration = this.configuration.getModules();
        if (modulesConfiguration) {
            for (const [key, value] of modulesConfiguration) {
                try {
                    if (!this.modules.has(key)) {
                        console.log(`Module '${key}' not found, loading module...`);
                        const module = graphene.Module.load(value, key);
                        module.initialize();
                        this.modules.set(key, module);
                    }
                    console.log(`Module '${key}' loaded.`);
                    moduleNodes.push(new moduleNode_1.ModuleNode(key, key, value, true));
                }
                catch (err) {
                    Promise.reject(`Failed to load module '${key}' with error: ${err.message}`);
                }
            }
        }
        // 	const label = "SoftHSM";
        // 	const filePath = "/usr/local/lib/softhsm/libsofthsm2.so";
        return Promise.resolve(moduleNodes);
    }
    getSlots(moduleName) {
        const module = this.modules.get(moduleName);
        const slots = module.getSlots();
        const nodes = [];
        if (slots.length > 0) {
            for (let i = 0; i < slots.length; i++) {
                const slot = slots.items(i);
                let label;
                let isExpandable;
                if ((slot.flags & graphene.SlotFlag.TOKEN_PRESENT)
                    && (slot.getToken().flags & graphene.TokenFlag.TOKEN_INITIALIZED)) {
                    label = `${slot.getToken().label} (${handleUtils_1.Handle.toString(slot.handle)})`;
                    isExpandable = true;
                }
                else {
                    label = `${handleUtils_1.Handle.toString(slot.handle)} (Not initialized)`;
                    isExpandable = false;
                }
                nodes.push(new slotNode_1.SlotNode(slot.handle.toString(), label, slot.slotDescription, isExpandable, slot));
            }
        }
        return Promise.resolve(nodes);
    }
    getObjectTypes(slotNode) {
        const types = Object.keys(graphene.ObjectClass)
            .filter(key => !isNaN(Number(graphene.ObjectClass[key]))
            && graphene.ObjectClass[key] != graphene.ObjectClass.DOMAIN_PARAMETERS
            && graphene.ObjectClass[key] != graphene.ObjectClass.HW_FEATURE
            && graphene.ObjectClass[key] != graphene.ObjectClass.MECHANISM
            && graphene.ObjectClass[key] != graphene.ObjectClass.OTP_KEY)
            .map(key => new objectTypeNode_1.ObjectTypeNode(key, key, key, true, slotNode));
        return Promise.resolve(types);
    }
    formatLabel(id, label) {
        if (id == label) {
            return id;
        }
        else if (!label) {
            return id;
        }
        else {
            return label;
        }
    }
    formatDescription(attributes, certTypeLabel) {
        let certKeyType = "Unknown";
        if (graphene.CertificateType[attributes.certType]) {
            certKeyType = graphene.CertificateType[attributes.certType];
        }
        else if (graphene.KeyType[attributes.keyType]) {
            certKeyType = graphene.KeyType[attributes.keyType];
        }
        return `id: ${Buffer.from(attributes.id).toString("hex")}\nlabel: ${Buffer.from(attributes.label).toString()}\n${certTypeLabel}: ${certKeyType}`;
    }
    async getObjects(node) {
        const objects = [];
        const slot = node.slotNode.slot;
        const type = node.id;
        let session;
        if (this.sessions.has(handleUtils_1.Handle.toString(slot.handle))) {
            session = this.sessions.get(handleUtils_1.Handle.toString(slot.handle));
        }
        else {
            slot.closeAll();
            session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
            this.sessions.set(handleUtils_1.Handle.toString(slot.handle), session);
            if (slot.getToken().flags & graphene.TokenFlag.USER_PIN_INITIALIZED) {
                const userPin = await uiCommands_1.UiCommands.getUserPin(handleUtils_1.Handle.toString(slot.handle));
                session.login(userPin);
                uiCommands_1.UiCommands.saveUserPin(handleUtils_1.Handle.toString(slot.handle), userPin);
            }
        }
        const objectsFound = session.find({ class: graphene.ObjectClass[type] });
        if (objectsFound.length > 0) {
            for (let i = 0; i < objectsFound.length; i++) {
                const attributesTemplate = definitions_1.Definitions.ObjectTypeTemplateMap.has(graphene.ObjectClass[type]) ? definitions_1.Definitions.ObjectTypeTemplateMap.get(graphene.ObjectClass[type]) : definitions_1.Definitions.BasicTemplate;
                const data = objectsFound.items(i);
                const attributes = data.getAttribute(attributesTemplate);
                objects.push(new objectNode_1.ObjectNode(Buffer.from(attributes.id).toString(), this.formatLabel(Buffer.from(attributes.id).toString("hex"), Buffer.from(attributes.label).toString()), this.formatDescription(attributes, definitions_1.Definitions.ObjectClassToType.get(graphene.ObjectClass[type])), type, node, data));
            }
        }
        return Promise.resolve(objects);
    }
    // PKCS#11 Commands
    getModuleDescription(node) {
        const module = this.modules.get(node.id);
        this.outputChannel.printModuleDescription(module);
    }
    removeModule(node) {
        const module = this.modules.get(node.id);
        module.finalize();
        module.close();
        this.modules.delete(node.id);
        this.configuration.removeModule(node.id);
    }
    deleteSlot(node) {
        const slot = node.slot;
        try {
            slot.closeAll();
        }
        catch (err) {
            uiCommands_1.UiCommands.showErrorMessage(`Failed to delete slot iwth error.\n${err.message}`);
        }
    }
    getSlotDescription(node) {
        const slot = node.slot;
        this.outputChannel.printSlotDescription(slot);
    }
    getSlotAvailableMechanisms(node) {
        const slot = node.slot;
        this.outputChannel.printSlotAvailableMechanisms(slot);
    }
    async initializeSlot(node) {
        const slot = node.slot;
        if ((slot.flags & graphene.SlotFlag.TOKEN_PRESENT)
            && (slot.getToken().flags & graphene.TokenFlag.TOKEN_INITIALIZED)) {
            const overrideToken = await uiCommands_1.UiCommands.showYesNoQuickPick("The token is already initialized. Enter yes to reinitialize the toke. Note: it will delete all the data in the current token.");
            if (overrideToken != "yes") {
                return;
            }
        }
        try {
            const userSoPin = await uiCommands_1.UiCommands.showPasswordInputBox("The SO's initial PIN");
            const tokenLabel = await uiCommands_1.UiCommands.showInputBox("The token label. Can be empty.");
            slot.initToken(userSoPin, tokenLabel);
            uiCommands_1.UiCommands.showInformationMessage("Token initialized.");
        }
        catch (err) {
            Promise.reject(`Failed to initialize token.\n${err.message}`);
        }
    }
    async setSlotUserPin(node) {
        const slot = node.slot;
        try {
            const oldPin = await uiCommands_1.UiCommands.showPasswordInputBox("Old PIN");
            const newPin = await uiCommands_1.UiCommands.showInputBox("New PIN");
            if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
                const session = slot.open();
                session.login(oldPin, graphene.UserType.USER);
                session.setPin(oldPin, newPin);
                session.logout();
                session.close();
                uiCommands_1.UiCommands.showInformationMessage("User PIN was changed successfully");
            }
            uiCommands_1.UiCommands.showErrorMessage("Token not initialized.");
        }
        catch (err) {
            uiCommands_1.UiCommands.showErrorMessage(`Failed to set user PIN for User.\n${err.message}`);
        }
    }
    async initializeSlotUserPin(node) {
        const slot = node.slot;
        try {
            const soPin = await uiCommands_1.UiCommands.getSoPin(handleUtils_1.Handle.toString(slot.handle));
            const newPin = await uiCommands_1.UiCommands.showPasswordInputBox("User PIN");
            if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
                slot.closeAll();
                let session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
                session.login(soPin, graphene.UserType.SO);
                session.initPin(newPin);
                session.logout();
                session.close();
                session = slot.open();
                session.login(newPin, graphene.UserType.USER);
                session.logout();
                session.close();
                uiCommands_1.UiCommands.showInformationMessage("User PIN initialized.");
            }
        }
        catch (err) {
            uiCommands_1.UiCommands.showErrorMessage("Failed to initialize user PIN.\n" + err.message);
        }
    }
    async deleteObject(node) {
        try {
            node.object.destroy();
            return Promise.resolve("Object deleted.");
        }
        catch (err) {
            return Promise.reject(`Failed to delete object.\n${err}`);
        }
    }
    async renameObject(node) {
        try {
            const id = await uiCommands_1.UiCommands.showInputBox("New ID");
            if (id == undefined) {
                return;
            }
            const label = await uiCommands_1.UiCommands.showInputBox("Label");
            if (label == undefined) {
                return;
            }
            node.object.setAttribute({ id: Buffer.from(id), label: label });
            uiCommands_1.UiCommands.showInformationMessage("Object renamed.");
        }
        catch (err) {
            return Promise.reject(`Failed to rename object.\n${err}`);
        }
    }
    async sign(node) {
        let alg;
        const signingMechanism = await uiCommands_1.UiCommands.showQuickPick(Object.keys(graphene.MechanismEnum)
            .filter(key => !isNaN(Number(graphene.MechanismEnum[key]))), "Signing mechanism.");
        if (graphene.MechanismEnum[signingMechanism.toUpperCase()] !== undefined) {
            alg = graphene.MechanismEnum[signingMechanism.toUpperCase()];
        }
        else {
            Promise.reject("Unknown signing algorithm.");
        }
        const dataType = await uiCommands_1.UiCommands.showQuickPick(definitions_1.Definitions.SupportedSignEncodingInputData, "Type of data input.");
        if (dataType == undefined) {
            return;
        }
        const data = await uiCommands_1.UiCommands.showInputBox(`Data to sign in ${dataType} format`);
        if (data == undefined) {
            return;
        }
        const dataResultType = await uiCommands_1.UiCommands.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let signature;
        try {
            const privObj = node.object.toType();
            signature = node.object.session.createSign(alg, privObj).once(Buffer.from(data, dataType));
        }
        catch (err) {
            uiCommands_1.UiCommands.showErrorMessage(`Failed to sign data.\n${err}`);
            return;
        }
        this.outputChannel.printSignature(node.label, signature, dataResultType);
    }
}
exports.Pkcs11Model = Pkcs11Model;
//# sourceMappingURL=pkcs11Model.js.map