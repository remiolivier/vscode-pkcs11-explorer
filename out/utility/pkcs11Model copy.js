"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11Model = void 0;
const graphene = require("graphene-pk11");
const fs = require("fs");
const interactions_1 = require("./interactions");
const handleUtils_1 = require("./handleUtils");
const pkcs11ExplorerOuputChannelView_1 = require("../provider/pkcs11ExplorerOuputChannelView");
const definitions_1 = require("../model/definitions");
const moduleNode_1 = require("../node/moduleNode");
const slotNode_1 = require("../node/slotNode");
const objectTypeNode_1 = require("../node/objectTypeNode");
const objectNode_1 = require("../node/objectNode");
const vscode_1 = require("vscode");
const mutex_1 = require("./mutex");
const signModel_1 = require("./signModel");
const verifyModel_1 = require("./verifyModel");
const encryptModel_1 = require("./encryptModel");
const decryptModel_1 = require("./decryptModel");
class Pkcs11Model extends vscode_1.Disposable {
    constructor(configuration) {
        super(() => this.dispose());
        this.modules = new Map();
        this.outputChannel = new pkcs11ExplorerOuputChannelView_1.Pkcs11ExplorerOuputChannelView();
        this.openSessionMutex = new mutex_1.Mutex();
        this.configuration = configuration;
    }
    dispose() {
        for (const module of this.modules) {
            try {
                this.closeModule(module[1]);
            }
            catch (err) {
                console.log("Close module failed.\n" + err);
            }
        }
    }
    async addModule() {
        const moduleName = await interactions_1.Interactions.showInputBox("The friendly name for this module");
        if (!moduleName) {
            return;
        }
        const modulePath = await interactions_1.Interactions.showInputBox("The path to the PKCS#11 library.");
        if (!modulePath) {
            return;
        }
        if (!fs.existsSync(modulePath)) {
            interactions_1.Interactions.showErrorMessage(`Could not add the '${moduleName}' module. '${modulePath}' does not exist.`);
            return;
        }
        const modulesConfiguration = this.configuration.getModules();
        if (modulesConfiguration && modulesConfiguration.has(moduleName)) {
            interactions_1.Interactions.showErrorMessage("Module already exists.");
            return;
        }
        this.configuration.addModule(moduleName, modulePath);
        interactions_1.Interactions.showInformationMessage("Module added.");
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
                    moduleNodes.push(new moduleNode_1.ModuleNode(key, key, "Failed to initialize", false));
                    interactions_1.Interactions.showErrorMessage(`Failed to load module '${key}' with error: ${err.message}`);
                }
            }
        }
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
        const types = new Array();
        for (const objectType of definitions_1.Definitions.ObjectTypesMap) {
            types.push(new objectTypeNode_1.ObjectTypeNode(objectType[1], objectType[0], "", true, slotNode));
        }
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
    async openSession(slotNode) {
        let session;
        const slot = slotNode.slot;
        if (!slotNode.session) {
            const unlock = await this.openSessionMutex.lock();
            try {
                if (!slotNode.session) {
                    session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
                    if (slot.getToken().flags & graphene.TokenFlag.USER_PIN_INITIALIZED
                        && session.state < 3) {
                        const userPin = await interactions_1.Interactions.getUserPin(handleUtils_1.Handle.toString(slot.handle));
                        session.login(userPin);
                        interactions_1.Interactions.saveUserPin(handleUtils_1.Handle.toString(slot.handle), userPin);
                    }
                    slotNode.session = session;
                }
            }
            finally {
                unlock();
            }
            return slotNode.session;
        }
        return slotNode.session;
    }
    async getObjects(node) {
        const objects = [];
        const type = node.id;
        const session = await this.openSession(node.slotNode);
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
    async closeModuleNode(node) {
        const module = this.modules.get(node.id);
        this.closeModule(module);
        this.modules.delete(node.id);
        return Promise.resolve();
    }
    closeModule(module) {
        try {
            const slots = module.getSlots();
            for (const slot of slots) {
                slot.closeAll();
            }
        }
        catch (err) {
            console.log("Failed to close all session for module.\n" + err);
        }
        try {
            module.finalize();
        }
        catch (err) {
            console.log("Failed to finalize module.\n" + err);
        }
        try {
            module.close();
            return;
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to close module.\n" + err);
            return;
        }
    }
    closeAllSessions(slot) {
        try {
            slot.closeAll();
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to close sessions.\n" + err);
            return;
        }
    }
    reloadModule(node) {
        const module = this.modules.get(node.id);
        try {
            const slots = module.getSlots();
            for (const slot of slots) {
                slot.closeAll();
            }
        }
        catch (err) {
            console.log("Failed to close all session for module.\n" + err);
        }
        try {
            module.finalize();
        }
        catch (err) {
            console.error(err);
            return Promise.resolve();
        }
        try {
            module.initialize();
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to reload module.\n" + err);
        }
        return Promise.resolve();
    }
    async removeModule(node) {
        const isDeleteConfirmed = await interactions_1.Interactions.showYesNoQuickPick("Confirm remove?");
        if (!isDeleteConfirmed) {
            return;
        }
        try {
            const module = this.modules.get(node.id);
            module.finalize();
            module.close();
        }
        catch (err) {
            console.error(err);
        }
        this.modules.delete(node.id);
        this.configuration.removeModule(node.id);
    }
    async deleteSlot(node) {
        const isDeleteConfirmed = await interactions_1.Interactions.showYesNoQuickPick("Confirm deletion?");
        if (!isDeleteConfirmed) {
            return;
        }
        const slot = node.slot;
        try {
            slot.closeAll();
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to delete slot iwth error.\n${err.message}`);
        }
    }
    getSlotDescription(node) {
        const slot = node.slot;
        try {
            this.outputChannel.printSlotDescription(slot);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to get slot description.");
        }
    }
    getSlotAvailableMechanisms(node) {
        const slot = node.slot;
        try {
            this.outputChannel.printSlotAvailableMechanisms(slot);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to get available mechanisms for slot.");
        }
    }
    async initializeSlot(node) {
        const slot = node.slot;
        if ((slot.flags & graphene.SlotFlag.TOKEN_PRESENT)
            && (slot.getToken().flags & graphene.TokenFlag.TOKEN_INITIALIZED)) {
            const overrideToken = await interactions_1.Interactions.showYesNoQuickPick("The token is already initialized. Enter yes to reinitialize the toke. Note: it will delete all the data in the current token.");
            if (!overrideToken) {
                return;
            }
        }
        try {
            const userSoPin = await interactions_1.Interactions.showPasswordInputBox("The SO's initial PIN");
            const tokenLabel = await interactions_1.Interactions.showInputBox("The token label. Can be empty.");
            slot.initToken(userSoPin, tokenLabel);
            interactions_1.Interactions.showInformationMessage("Token initialized.");
        }
        catch (err) {
            Promise.reject(`Failed to initialize token.\n${err.message}`);
        }
    }
    async setSlotUserPin(node) {
        const slot = node.slot;
        try {
            const oldPin = await interactions_1.Interactions.showPasswordInputBox("Old PIN");
            const newPin = await interactions_1.Interactions.showPasswordInputBox("New PIN");
            if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
                const session = slot.open(graphene.SessionFlag.SERIAL_SESSION | graphene.SessionFlag.RW_SESSION);
                if (session.state < 2) {
                    session.login(oldPin, graphene.UserType.USER);
                }
                session.setPin(oldPin, newPin);
                session.logout();
                session.close();
                await interactions_1.Interactions.invalidateUserPin(handleUtils_1.Handle.toString(slot.handle));
                interactions_1.Interactions.showInformationMessage("User PIN was changed successfully");
            }
            interactions_1.Interactions.showErrorMessage("Token not initialized.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to set user PIN for User.\n${err.message}`);
        }
    }
    async initializeSlotUserPin(node) {
        const slot = node.slot;
        try {
            const soPin = await interactions_1.Interactions.getSoPin(handleUtils_1.Handle.toString(slot.handle));
            const newPin = await interactions_1.Interactions.showPasswordInputBox("User PIN");
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
                interactions_1.Interactions.showInformationMessage("User PIN initialized.");
            }
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to initialize user PIN.\n" + err.message);
        }
    }
    async generateAesKey(node) {
        const slot = node.slot;
        try {
            const session = await this.openSession(node);
            const sizeString = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedAesSizes, "Aes key length");
            if (sizeString == undefined) {
                return;
            }
            const size = Number.parseInt(sizeString);
            const id = await interactions_1.Interactions.showInputBox("ID for AES key");
            if (id == undefined) {
                return;
            }
            const label = await interactions_1.Interactions.showInputBox("Label for AES key");
            if (label == undefined) {
                return;
            }
            session.generateKey(graphene.KeyGenMechanism.AES, {
                keyType: graphene.KeyType.AES,
                id: Buffer.from(id),
                label: label,
                valueLen: size / 8,
                encrypt: true,
                decrypt: true,
                sign: true,
                verify: true,
                wrap: true,
                unwrap: true,
                derive: true,
                token: true
            });
            interactions_1.Interactions.showInformationMessage("AES key generated successfully.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to generate AES key.\n" + err.message);
        }
    }
    async generateRsaKeyPair(node) {
        const slot = node.slot;
        try {
            const session = await this.openSession(node);
            const sizeString = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedRsaKeySizes, "RSA key length");
            if (sizeString == undefined) {
                return;
            }
            const size = Number.parseInt(sizeString);
            const id = await interactions_1.Interactions.showInputBox("ID for RSA key");
            if (id == undefined) {
                return;
            }
            const label = await interactions_1.Interactions.showInputBox("Label for RSA key");
            if (label == undefined) {
                return;
            }
            session.generateKeyPair(graphene.KeyGenMechanism.RSA, {
                keyType: graphene.KeyType.RSA,
                id: Buffer.from(id),
                label: label,
                modulusBits: size,
                publicExponent: Buffer.from([3]),
                token: true,
                verify: true,
                encrypt: true,
                wrap: true,
            }, {
                keyType: graphene.KeyType.RSA,
                id: Buffer.from(id),
                label: label,
                token: true,
                sign: true,
                decrypt: true,
                unwrap: true,
            });
            interactions_1.Interactions.showInformationMessage("RSA key generated successfully.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
        }
    }
    async generateEccKeyPair(node) {
        const slot = node.slot;
        try {
            const session = await this.openSession(node);
            const namedCurve = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedEccNamedCurves, "Select the named curve.");
            if (namedCurve == undefined) {
                return;
            }
            const id = await interactions_1.Interactions.showInputBox("ID for ECC key");
            if (id == undefined) {
                return;
            }
            const label = await interactions_1.Interactions.showInputBox("Label for ECC key");
            if (label == undefined) {
                return;
            }
            const paramsEc = graphene.NamedCurve.getByName(namedCurve).value;
            session.generateKeyPair(graphene.KeyGenMechanism.EC, {
                keyType: graphene.KeyType.EC,
                id: Buffer.from(id),
                label: label,
                paramsEC: paramsEc,
                token: true,
                verify: true,
                encrypt: true,
                wrap: true,
                derive: false,
            }, {
                keyType: graphene.KeyType.EC,
                id: Buffer.from(id),
                label: label,
                token: true,
                sign: true,
                decrypt: true,
                unwrap: true,
                derive: false,
            });
            interactions_1.Interactions.showInformationMessage("ECC key generated successfully.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to generate RSA key.\n" + err.message);
        }
    }
    async createDigest(node) {
        const slot = node.slot;
        try {
            const session = await this.openSession(node);
            const digestMechanism = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedDigestAlgorithms, "Digest mechanism.");
            if (digestMechanism == undefined) {
                return;
            }
            const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data");
            if (dataArray == undefined || dataArray.length == 0) {
                return;
            }
            const digest = session.createDigest({ name: digestMechanism, params: null });
            for (const data of dataArray) {
                digest.update(data);
            }
            const result = digest.final();
            this.outputChannel.printDigest(digestMechanism, result);
            interactions_1.Interactions.showInformationMessage("Digest generated successfully.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage("Failed to create digest.\n" + err.message);
        }
    }
    async deleteObject(node) {
        const isDeleteConfirmed = await interactions_1.Interactions.showYesNoQuickPick("Confirm deletion?");
        if (!isDeleteConfirmed) {
            return;
        }
        try {
            node.object.destroy();
            interactions_1.Interactions.showInformationMessage("Object deleted.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to delete object.\n${err}`);
        }
    }
    async renameObject(node) {
        try {
            const id = await interactions_1.Interactions.showInputBox("New ID");
            if (id == undefined) {
                return;
            }
            const label = await interactions_1.Interactions.showInputBox("Label");
            if (label == undefined) {
                return;
            }
            node.object.setAttribute({ id: Buffer.from(id), label: label });
            interactions_1.Interactions.showInformationMessage("Object renamed.");
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to rename object.\n${err}`);
        }
    }
    async getAttribute(node) {
        let attributeName;
        try {
            attributeName = await interactions_1.Interactions.getObjectAttributeName();
            if (attributeName == undefined) {
                return;
            }
            const value = node.object.getAttribute(attributeName);
            this.outputChannel.printAttribute(attributeName, value);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to set attribute ${attributeName}.\n${err}`);
        }
    }
    async getAttributes(node) {
        const attributes = new Map();
        for (const key of definitions_1.Definitions.AttributeNameTypes.keys()) {
            try {
                const value = node.object.getAttribute(key);
                attributes.set(key, value);
            }
            catch (err) { /* ignore error, attribute not found */ }
        }
        this.outputChannel.printAttributes(attributes);
    }
    async setAttribute(node) {
        let attributeName;
        try {
            attributeName = await interactions_1.Interactions.getObjectAttributeName();
            if (attributeName == undefined) {
                return;
            }
            const newValue = await interactions_1.Interactions.showInputBox("value");
            if (attributeName == undefined) {
                return;
            }
            node.object.setAttribute(attributeName, newValue);
            interactions_1.Interactions.showInformationMessage(`Attribute ${attributeName} set.`);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to set attribute ${attributeName}.\n${err}`);
        }
    }
    async sign(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const signing = new signModel_1.SignModel(session);
        const result = await signing.sign(key, keyType);
        this.outputChannel.printSignature(node.label, result);
    }
    async signMultipart(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const signing = new signModel_1.SignModel(session);
        const result = await signing.signMultipart(key, keyType);
        this.outputChannel.printSignature(node.label, result);
    }
    async verify(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const verify = new verifyModel_1.VerifyModel(session);
        const isVerified = await verify.verify(key, keyType);
        if (isVerified) {
            interactions_1.Interactions.showInformationMessage("Signature verified successfully");
        }
        else {
            interactions_1.Interactions.showErrorMessage("Invalid Signature.");
        }
    }
    async verifyMultipart(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const verify = new verifyModel_1.VerifyModel(session);
        const isVerified = await verify.verifyMultipart(key, keyType);
        if (isVerified) {
            interactions_1.Interactions.showInformationMessage("Signature verified successfully");
        }
        else {
            interactions_1.Interactions.showErrorMessage("Invalid Signature.");
        }
    }
    async encrypt(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const encryption = new encryptModel_1.EncryptModel(session);
        const result = await encryption.encrypt(key, keyType);
        this.outputChannel.printEncrypt(result);
    }
    async decrypt(node) {
        const session = node.object.session;
        const keyType = node.object.getAttribute("keyType");
        const key = node.object.toType();
        const decryption = new decryptModel_1.DecryptModel(session);
        const result = await decryption.decrypt(key, keyType);
        this.outputChannel.printDecrypt(result);
    }
}
exports.Pkcs11Model = Pkcs11Model;
//# sourceMappingURL=pkcs11Model%20copy.js.map