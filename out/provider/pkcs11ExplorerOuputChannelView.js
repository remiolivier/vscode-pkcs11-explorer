"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11ExplorerOuputChannelView = void 0;
const vscode = require("vscode");
const graphene = require("graphene-pk11");
const handleUtils_1 = require("../utility/handleUtils");
/**
 * Converts Buffer to string and cut all 0s from the beginning
 *
 * @param {Buffer} buffer
 * @returns
 */
function bufferToHex(buffer) {
    return buffer.toString("hex").replace(/^0*/, "");
}
class Pkcs11ExplorerOuputChannelView {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel(Pkcs11ExplorerOuputChannelView.OutputChannelName);
    }
    printModuleDescription(module) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Module:");
        this.outputChannel.appendLine("\tCryptoki version: " + module.cryptokiVersion.major + "." + module.cryptokiVersion.minor);
        this.outputChannel.appendLine("\tLibrary file: " + module.libFile);
        this.outputChannel.appendLine("\tLibrary name: " + module.libName);
        this.outputChannel.appendLine("\tLibrary description: " + module.libraryDescription);
        this.outputChannel.appendLine("\tLibrary version: " + module.libraryVersion.major + "." + module.libraryVersion.minor);
        this.outputChannel.appendLine("\tManufacturer ID: " + module.manufacturerID);
    }
    printSlotDescription(slot) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Slot ID " + handleUtils_1.Handle.toString(slot.handle));
        this.outputChannel.appendLine("\tLabel: " + slot.getToken().label);
        this.outputChannel.appendLine("\tDescription: " + slot.slotDescription);
        this.outputChannel.appendLine("\tSerial: " + slot.getToken().serialNumber);
        this.outputChannel.appendLine("\tFirmware version: " + slot.firmwareVersion.major + "." + slot.firmwareVersion.minor);
        this.outputChannel.appendLine("\tHardware version: " + slot.hardwareVersion.major + "." + slot.hardwareVersion.minor);
        this.outputChannel.appendLine("\tManufacturer ID: " + slot.manufacturerID);
        this.outputChannel.appendLine("\tPassword(min/max): " + slot.getToken().minPinLen + "/" + slot.getToken().maxPinLen);
        this.outputChannel.appendLine("\tIs hardware: " + !!(slot.flags & graphene.SlotFlag.HW_SLOT));
        this.outputChannel.appendLine("\tIs removable: " + !!(slot.flags & graphene.SlotFlag.REMOVABLE_DEVICE));
        this.outputChannel.appendLine("\tIs initialized: " + !!(slot.flags & graphene.SlotFlag.TOKEN_PRESENT));
    }
    printSlotAvailableMechanisms(slot) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Mechanisms:");
        this.outputChannel.appendLine("Name                       h/s/v/e/d/w/u");
        this.outputChannel.appendLine("========================================");
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
            this.outputChannel.appendLine(s(mech.name) +
                b(mech.flags & graphene.MechanismFlag.DIGEST) + "/" +
                b(mech.flags & graphene.MechanismFlag.SIGN) + "/" +
                b(mech.flags & graphene.MechanismFlag.VERIFY) + "/" +
                b(mech.flags & graphene.MechanismFlag.ENCRYPT) + "/" +
                b(mech.flags & graphene.MechanismFlag.DECRYPT) + "/" +
                b(mech.flags & graphene.MechanismFlag.WRAP) + "/" +
                b(mech.flags & graphene.MechanismFlag.UNWRAP));
        }
    }
    print(data) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine(data);
    }
    printSignature(keyName, signature) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Signed data with key '" + keyName + "'");
        this.outputChannel.appendLine("\n" + signature.toString());
    }
    printAttribute(attributeName, value) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Attribute:");
        this.printSingleAttribute(attributeName, value);
    }
    printBufferWithEncoding(value) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine(value.toString());
    }
    printAttributes(attributes) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Attributes:");
        for (const [key, value] of attributes) {
            this.printSingleAttribute(key, value);
        }
    }
    printDigest(digest) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine(`Hash ${digest.mechanism}: ${digest.data.toString()}`);
    }
    printEncrypt(data) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Encrypted data:");
        this.outputChannel.appendLine(data.toString());
    }
    printDecrypt(data) {
        this.outputChannel.clear();
        this.outputChannel.show(true);
        this.outputChannel.appendLine("Decrypted data:");
        this.outputChannel.appendLine(data.toString());
    }
    printSingleAttribute(attributeName, value) {
        if (Object.prototype.toString.call(value).endsWith("Array]")) {
            this.outputChannel.appendLine("\t" + attributeName + ": " + value.toString("base64"));
        }
        else if (attributeName == "id") {
            this.outputChannel.appendLine("\t" + attributeName + ": " + handleUtils_1.Handle.toString(value));
        }
        else {
            this.outputChannel.appendLine("\t" + attributeName + ": " + value);
        }
    }
}
exports.Pkcs11ExplorerOuputChannelView = Pkcs11ExplorerOuputChannelView;
Pkcs11ExplorerOuputChannelView.OutputChannelName = "PKCS#11 Explorer";
//# sourceMappingURL=pkcs11ExplorerOuputChannelView.js.map