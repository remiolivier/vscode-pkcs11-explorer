"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyModel = void 0;
const interactions_1 = require("./interactions");
class VerifyModel {
    constructor(session) {
        this.session = session;
    }
    async verify(key, keyType) {
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
        return this.session.createVerify(verifyMechanism.mechanism, key).once(data, signature);
    }
    async verifyMultipart(key, keyType) {
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
        const verify = this.session.createVerify(verifyMechanism.mechanism, key);
        try {
            for (const data of dataArray) {
                verify.update(data);
            }
            return verify.final(signature);
        }
        catch (err) {
            try {
                verify.final(signature);
            }
            catch (err) { /* No action needed */ }
            throw (err);
        }
    }
}
exports.VerifyModel = VerifyModel;
//# sourceMappingURL=verifyModel.js.map