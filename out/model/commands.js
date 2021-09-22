"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiCommands = void 0;
const vscode = require("vscode");
const graphene = require("graphene-pk11");
const handleUtils_1 = require("./handleUtils");
class UiCommands {
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
            this.userPinMap.set(slotId, await UiCommands.showPasswordInputBox("User PIN"));
        }
        return this.userPinMap.get(slotId);
    }
    static async getSoPin(slotId) {
        return await UiCommands.showPasswordInputBox("SO PIN");
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
    static async showPasswordInputBox(prompt) {
        return await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: prompt,
            password: true
        });
    }
    static async showYesNoQuickPick(placeholder) {
        return await vscode.window.showQuickPick(["yes", "no"], {
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: placeholder
        });
    }
    static async showQuickPick(items, placeholder) {
        return await vscode.window.showQuickPick(items, {
            canPickMany: false,
            ignoreFocusOut: true,
            placeHolder: placeholder
        });
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
exports.UiCommands = UiCommands;
UiCommands.userPinMap = new Map();
//# sourceMappingURL=commands.js.map