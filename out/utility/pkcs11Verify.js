"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pkcs11Verify = void 0;
const interactions_1 = require("./interactions");
class Pkcs11Verify {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
    }
    async verify(node) {
        const keyType = node.object.getAttribute("keyType");
        const verifyMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (verifyMechanism == undefined) {
            return;
        }
        const signature = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
        if (signature == undefined) {
            return;
        }
        const data = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
        if (data == undefined) {
            return;
        }
        try {
            const pubKey = node.object.toType();
            return node.object.session.createVerify(verifyMechanism.mechanism, pubKey).once(data, signature);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
            return;
        }
    }
    async verifyMultipart(node) {
        const keyType = node.object.getAttribute("keyType");
        const verifyMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (verifyMechanism == undefined) {
            return;
        }
        const signature = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of signature input.", "Signature to verify");
        if (signature == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to verify");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        try {
            const pubKey = node.object.toType();
            const verify = node.object.session.createVerify(verifyMechanism.mechanism, pubKey);
            for (const data of dataArray) {
                verify.update(data);
            }
            return verify.final(signature);
        }
        catch (err) {
            interactions_1.Interactions.showErrorMessage(`Failed to verify data.\n${err}`);
            return;
        }
    }
}
exports.Pkcs11Verify = Pkcs11Verify;
//# sourceMappingURL=pkcs11Verify.js.map