"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignModel = void 0;
const interactions_1 = require("./interactions");
const definitions_1 = require("../model/definitions");
const bufferWithEncoding_1 = require("../model/bufferWithEncoding");
class SignModel {
    constructor(session) {
        this.session = session;
    }
    async sign(key, keyType) {
        const signMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (signMechanism == undefined) {
            return;
        }
        const data = await interactions_1.Interactions.showInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
        if (data == undefined) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        const signature = this.session.createSign(signMechanism.mechanism, key).once(data);
        return new bufferWithEncoding_1.BufferWithEncoding(signature, dataResultType);
    }
    async signMultipart(key, keyType) {
        const signMechanism = await interactions_1.Interactions.getSignVerifyData(keyType);
        if (signMechanism == undefined) {
            return;
        }
        const dataArray = await interactions_1.Interactions.showMultipleInputBoxWithQuickPickDataType("Type of data input.", "Data to sign");
        if (dataArray == undefined || dataArray.length == 0) {
            return;
        }
        const dataResultType = await interactions_1.Interactions.showQuickPick(definitions_1.Definitions.SupportedSignEncodingOutputData, "Type of data output.");
        if (dataResultType == undefined) {
            return;
        }
        let signature;
        const sign = this.session.createSign(signMechanism.mechanism, key);
        try {
            for (const data of dataArray) {
                sign.update(data);
            }
            signature = sign.final();
        }
        catch (err) {
            try {
                sign.final();
            }
            catch (err) { /* No aciton needed */ }
            throw (err);
        }
        return new bufferWithEncoding_1.BufferWithEncoding(signature, dataResultType);
    }
}
exports.SignModel = SignModel;
//# sourceMappingURL=signModel.js.map