"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interactions = void 0;
const vscode = require("vscode");
const graphene = require("graphene-pk11");
const handleUtils_1 = require("./handleUtils");
const definitions_1 = require("../model/definitions");
class Interactions {
    static async saveUserPin(slotId, userPin) {
        if (userPin == null) {
            this.userPinMap.delete(slotId);
        }
        else {
            this.userPinMap.set(slotId, userPin);
        }
    }
    static async getUserPin(slotId) {
        if (!this.userPinMap.has(slotId)) {
            this.userPinMap.set(slotId, await Interactions.showPasswordInputBox("User PIN"));
        }
        return this.userPinMap.get(slotId);
    }
    static async invalidateUserPin(slotId) {
        if (this.userPinMap.has(slotId)) {
            this.userPinMap.delete(slotId);
        }
    }
    static async getSoPin(slotId) {
        return await Interactions.showPasswordInputBox("SO PIN");
    }
    static showInformationMessage(message) {
        return vscode.window.showInformationMessage(message);
    }
    static showErrorMessage(message) {
        return vscode.window.showErrorMessage(message);
    }
    static async showInputBox(prompt) {
        return await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: prompt,
        });
    }
    static async showInputBoxWithQuickPickDataType(inputTypePrompt, prompt) {
        const dataType = await Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingInputData, inputTypePrompt);
        if (dataType == undefined) {
            return;
        }
        const data = await Interactions.showInputBox(`${prompt} in ${dataType} format.`);
        return Buffer.from(data, dataType);
    }
    static async showMultipleInputBoxWithQuickPickDataType(inputTypePrompt, prompt) {
        const dataType = await Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingInputData, inputTypePrompt);
        if (dataType == undefined) {
            return;
        }
        const dataArray = new Array();
        let data;
        const additionalInformation = "Press enter with no data to finalize the operation";
        do {
            data = await Interactions.showInputBox(`${prompt} in ${dataType} format.${dataArray.length > 0 ? " " + additionalInformation : ""}`);
            if (data != undefined && data != "") {
                dataArray.push(Buffer.from(data, dataType));
            }
        } while (data != undefined && data != "");
        return dataArray;
    }
    static async showPasswordInputBox(prompt) {
        return await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: prompt,
            password: true
        });
    }
    static async showYesNoQuickPick(placeholder) {
        const answer = await vscode.window.showQuickPick(["yes", "no"], {
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: placeholder
        });
        return answer == undefined ? undefined : answer == "yes";
    }
    static async showQuickPick(items, placeholder) {
        return await vscode.window.showQuickPick(items, {
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: placeholder
        });
    }
    static async getObjectAttributeName() {
        const attributes = Array.from(definitions_1.Definitions.AttributeNameTypes.keys());
        return await Interactions.showQuickPick(attributes, "Attributes.");
    }
    static async getSignVerifyData(keyType) {
        let mechanisms;
        let signingMechanism;
        let questionAsked = false;
        if (keyType == graphene.KeyType.RSA) {
            mechanisms = Array.from(definitions_1.Definitions.SupportedRsaAlgorithms.keys());
            signingMechanism = await Interactions.showQuickPick(mechanisms, "RSA mechanism.");
            questionAsked = true;
            signingMechanism = definitions_1.Definitions.SupportedRsaAlgorithms.get(signingMechanism);
        }
        else if (keyType == graphene.KeyType.EC || keyType == graphene.KeyType.ECDSA) {
            mechanisms = Array.from(definitions_1.Definitions.SupportedEccAlgorithms.keys());
            signingMechanism = await Interactions.showQuickPick(mechanisms, "ECC mechanism.");
            questionAsked = true;
            signingMechanism = definitions_1.Definitions.SupportedEccAlgorithms.get(signingMechanism);
        }
        if (!signingMechanism && questionAsked) {
            return;
        }
        if (!signingMechanism || signingMechanism == "Custom") {
            mechanisms = Object.keys(graphene.MechanismEnum)
                .filter(key => !isNaN(Number(graphene.MechanismEnum[key])));
            signingMechanism = await Interactions.showQuickPick(mechanisms, "Mechanism.");
        }
        if (signingMechanism == undefined) {
            return;
        }
        let mechanism;
        if (graphene.MechanismEnum[signingMechanism.toUpperCase()] !== undefined) {
            mechanism = graphene.MechanismEnum[signingMechanism.toUpperCase()];
        }
        else {
            Promise.reject("Unknown algorithm.");
        }
        return {
            mechanism: mechanism
        };
    }
    static printSlotInfo(slot) {
        console.log("Slot info");
        console.log(`  Handle: ${handleUtils_1.Handle.toString(slot.handle)}`);
        console.log(`  Description: ${slot.slotDescription}`);
        console.log(`  Manufacturer ID: ${slot.manufacturerID}`);
        console.log(`  Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
        console.log(`  Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
        console.log(`  Flags:`);
        console.log(`    HW: ${!!(slot.flags & graphene.SlotFlag.HW_SLOT)}`);
        console.log(`    Removable device: ${!!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE)}`);
        console.log(`    Token present: ${!!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT)}`);
        if (slot.flags & graphene.SlotFlag.TOKEN_PRESENT) {
            console.log(`  Token:`);
            const token = slot.getToken();
            console.log(`    Label: ${token.label}`);
            console.log(`    Manufacturer ID: ${token.manufacturerID}`);
            console.log(`    Model: ${token.model}`);
            console.log(`    Serial number: ${token.serialNumber}`);
            console.log(`    Max PIN length: ${token.maxPinLen}`);
            console.log(`    Min PIN length: ${token.minPinLen}`);
            console.log(`    Max session count: ${token.maxSessionCount}`);
            console.log(`    Session count: ${token.sessionCount}`);
            console.log(`    Max RW session count: ${token.maxRwSessionCount}`);
            console.log(`    RW session count: ${token.rwSessionCount}`);
            console.log(`    Total private memory: ${token.totalPrivateMemory}`);
            console.log(`    Free private memory: ${token.freePrivateMemory}`);
            console.log(`    Total public memory: ${token.totalPublicMemory}`);
            console.log(`    Free public memory: ${token.freePublicMemory}`);
            console.log(`    Firm version: ${slot.firmwareVersion.major}.${slot.firmwareVersion.minor}`);
            console.log(`    Hardware version: ${slot.hardwareVersion.major}.${slot.hardwareVersion.minor}`);
            console.log(`    Flags:`);
            console.log(`      Initialized: ${!!(token.flags & graphene.TokenFlag.TOKEN_INITIALIZED)}`);
            console.log(`      Logged in: ${!!(token.flags & graphene.TokenFlag.USER_PIN_INITIALIZED)}`);
        }
        console.log();
    }
}
exports.Interactions = Interactions;
Interactions.userPinMap = new Map();
//# sourceMappingURL=interactions.js.map